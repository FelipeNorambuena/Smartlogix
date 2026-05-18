import { useEffect, useMemo, useState } from 'react'
import { fetchOrders } from '../../orders/services/orderService'
import {
  cancelShipment,
  createShipment,
  fetchShipmentById,
  fetchShipmentByOrderId,
  fetchShipmentByTrackingNumber,
  fetchShipmentEvents,
  fetchShipments,
  updateShipment,
  updateShipmentStatus,
} from '../services/shippingService'

const PAGE_SIZE = 10

const SHIPMENT_STATUSES = [
  'pending',
  'ready_to_ship',
  'in_transit',
  'delivered',
  'failed',
  'returned',
  'cancelled',
]

const STATUS_TRANSITIONS = {
  pending: ['ready_to_ship', 'cancelled'],
  ready_to_ship: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'failed', 'returned'],
  failed: ['ready_to_ship', 'returned', 'cancelled'],
  returned: [],
  delivered: [],
  cancelled: [],
}

const INITIAL_FILTERS = {
  carrier: '',
  orderId: '',
  status: '',
  trackingNumber: '',
}

const INITIAL_DISPATCH_ORDER_FILTERS = {
  status: 'SHIPPED',
}

const INITIAL_SHIPMENT_FORM = {
  carrier: '',
  orderId: '',
  shippingAddress: '',
  trackingNumber: '',
}

const INITIAL_LOOKUP = {
  orderId: '',
  shipmentId: '',
  trackingNumber: '',
}

const INITIAL_STATUS_FORM = {
  description: '',
  location: '',
  occurredAt: '',
  shipmentId: '',
  status: 'ready_to_ship',
}

const INITIAL_UPDATE_FORM = {
  carrier: '',
  shipmentId: '',
  shippingAddress: '',
  trackingNumber: '',
}

/*
 * Hook de orquestacion para envios.
 * Admin y operador reutilizan este flujo para que ambos llamen al API Gateway
 * con el mismo contrato REST y las mismas reglas de transicion de estados.
 */
export function useShippingAdmin(session) {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [dispatchOrderFilters, setDispatchOrderFilters] = useState(INITIAL_DISPATCH_ORDER_FILTERS)
  const [shipmentForm, setShipmentForm] = useState(INITIAL_SHIPMENT_FORM)
  const [lookup, setLookup] = useState(INITIAL_LOOKUP)
  const [statusForm, setStatusForm] = useState(INITIAL_STATUS_FORM)
  const [updateForm, setUpdateForm] = useState(INITIAL_UPDATE_FORM)
  const [shipmentsPage, setShipmentsPage] = useState(null)
  const [dispatchOrdersPage, setDispatchOrdersPage] = useState(null)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [shipmentEvents, setShipmentEvents] = useState([])
  const [page, setPage] = useState(0)
  const [dispatchOrderPage, setDispatchOrderPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDispatchOrders, setIsLoadingDispatchOrders] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const shipments = useMemo(() => shipmentsPage?.content || [], [shipmentsPage])
  const dispatchOrders = useMemo(
    () => dispatchOrdersPage?.content || [],
    [dispatchOrdersPage],
  )
  const totalElements = shipmentsPage?.totalElements || 0
  const totalPages = shipmentsPage?.totalPages || 0
  const dispatchOrderTotalElements = dispatchOrdersPage?.totalElements || 0
  const dispatchOrderTotalPages = dispatchOrdersPage?.totalPages || 0
  const summary = useMemo(() => buildSummary(shipments), [shipments])
  const statusActionOptions = selectedShipment
    ? getNextStatusOptions(selectedShipment.status)
    : SHIPMENT_STATUSES
  const hasStatusActionOptions = statusActionOptions.length > 0

  useEffect(() => {
    if (!session?.token) {
      return
    }
    loadShipments()
    loadDispatchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token])

  async function loadShipments(nextPage = page, nextFilters = filters) {
    if (!session?.token) return
    try {
      setIsLoading(true)
      setErrorMessage('')
      const pageResult = await fetchShipments({
        filters: nextFilters,
        page: nextPage,
        size: PAGE_SIZE,
        token: session.token,
      })
      setShipmentsPage(pageResult)
      setFilters(nextFilters)
      setPage(nextPage)
    } catch (err) {
      setErrorMessage(err.message || 'Error cargando envios.')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadDispatchOrders(
    nextPage = dispatchOrderPage,
    nextFilters = dispatchOrderFilters,
  ) {
    if (!session?.token) return
    try {
      setIsLoadingDispatchOrders(true)
      setErrorMessage('')
      const pageResult = await fetchOrders({
        filters: {
          customerId: '',
          status: nextFilters.status,
        },
        page: nextPage,
        size: PAGE_SIZE,
        token: session.token,
      })
      setDispatchOrdersPage(pageResult)
      setDispatchOrderFilters(nextFilters)
      setDispatchOrderPage(nextPage)
    } catch (err) {
      setErrorMessage(err.message || 'Error cargando pedidos para despacho.')
    } finally {
      setIsLoadingDispatchOrders(false)
    }
  }

  async function loadShipmentEvents(shipmentId) {
    if (!session?.token || !shipmentId) return
    try {
      setIsLoadingEvents(true)
      const events = await fetchShipmentEvents({ shipmentId, token: session.token })
      setShipmentEvents(events || [])
    } catch (err) {
      setShipmentEvents([])
      setErrorMessage(err.message || 'Error cargando eventos del envio.')
    } finally {
      setIsLoadingEvents(false)
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  function handleDispatchOrderFilterChange(event) {
    const { name, value } = event.target
    setDispatchOrderFilters((prev) => ({ ...prev, [name]: value }))
  }

  function applyDispatchOrderFilters(event) {
    if (event) event.preventDefault()
    loadDispatchOrders(0, dispatchOrderFilters)
  }

  function handleShipmentFormChange(event) {
    const { name, value } = event.target
    setShipmentForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleLookupChange(event) {
    const { name, value } = event.target
    setLookup((prev) => ({ ...prev, [name]: value }))
  }

  function handleStatusFormChange(event) {
    const { name, value } = event.target
    setStatusForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleUpdateFormChange(event) {
    const { name, value } = event.target
    setUpdateForm((prev) => ({ ...prev, [name]: value }))
  }

  function applyFilters(event) {
    if (event) event.preventDefault()
    loadShipments(0, filters)
  }

  function clearFilters() {
    loadShipments(0, INITIAL_FILTERS)
  }

  async function goToPage(newPage) {
    if (newPage >= 0 && newPage < totalPages) {
      await loadShipments(newPage)
    }
  }

  async function goToDispatchOrderPage(newPage) {
    if (newPage >= 0 && newPage < dispatchOrderTotalPages) {
      await loadDispatchOrders(newPage)
    }
  }

  async function selectShipment(shipment) {
    fillSelectedShipment(shipment)
    await loadShipmentEvents(shipment.id)
  }

  async function loadShipmentById(id = lookup.shipmentId) {
    if (!session?.token || !id?.trim()) return
    try {
      setIsLoading(true)
      setErrorMessage('')
      const data = await fetchShipmentById({ shipmentId: id.trim(), token: session.token })
      fillSelectedShipment(data)
      await loadShipmentEvents(data.id)
    } catch (err) {
      setErrorMessage(err.message || 'Error al buscar envio.')
      clearSelectedShipment()
    } finally {
      setIsLoading(false)
    }
  }

  async function loadShipmentByOrder(event) {
    if (event) event.preventDefault()
    if (!session?.token || !lookup.orderId.trim()) return
    try {
      setIsLoading(true)
      setErrorMessage('')
      const data = await fetchShipmentByOrderId({
        orderId: lookup.orderId.trim(),
        token: session.token,
      })
      fillSelectedShipment(data)
      await loadShipmentEvents(data.id)
    } catch (err) {
      setErrorMessage(err.message || 'Error al buscar envio por pedido.')
      clearSelectedShipment()
    } finally {
      setIsLoading(false)
    }
  }

  async function loadShipmentByTracking(event) {
    if (event) event.preventDefault()
    if (!session?.token || !lookup.trackingNumber.trim()) return
    try {
      setIsLoading(true)
      setErrorMessage('')
      const data = await fetchShipmentByTrackingNumber({
        token: session.token,
        trackingNumber: lookup.trackingNumber.trim(),
      })
      fillSelectedShipment(data)
      await loadShipmentEvents(data.id)
    } catch (err) {
      setErrorMessage(err.message || 'Error al buscar envio por tracking.')
      clearSelectedShipment()
    } finally {
      setIsLoading(false)
    }
  }

  async function createNewShipment(event) {
    event.preventDefault()
    if (!session?.token) return

    const validationMessage = validateShipmentCreateForm(shipmentForm)
    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    try {
      setIsSaving(true)
      setErrorMessage('')
      const createdShipment = await createShipment({
        shipment: buildCreatePayload(shipmentForm),
        token: session.token,
      })
      setSuccessMessage('Envio creado correctamente.')
      setShipmentForm(INITIAL_SHIPMENT_FORM)
      fillSelectedShipment(createdShipment)
      await loadShipmentEvents(createdShipment.id)
      await loadShipments(0)
      clearSuccessMessageLater()
    } catch (err) {
      setErrorMessage(err.message || 'Error creando envio.')
    } finally {
      setIsSaving(false)
    }
  }

  async function createShipmentFromOrder(order) {
    if (!session?.token || !order?.id) return
    try {
      setIsSaving(true)
      setErrorMessage('')
      const createdShipment = await createShipment({
        shipment: {
          orderId: order.id,
          shippingAddress: order.shippingAddress,
        },
        token: session.token,
      })
      setSuccessMessage('Envio creado desde pedido.')
      fillSelectedShipment(createdShipment)
      await loadShipmentEvents(createdShipment.id)
      await loadShipments(0)
      await loadDispatchOrders(dispatchOrderPage)
      clearSuccessMessageLater()
    } catch (err) {
      setErrorMessage(err.message || 'Error creando envio desde pedido.')
    } finally {
      setIsSaving(false)
    }
  }

  async function updateShipmentDetails(event) {
    event.preventDefault()
    if (!session?.token) return

    const validationMessage = validateShipmentUpdateForm(updateForm)
    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    try {
      setIsSaving(true)
      setErrorMessage('')
      const updatedShipment = await updateShipment({
        shipment: buildUpdatePayload(updateForm),
        shipmentId: updateForm.shipmentId.trim(),
        token: session.token,
      })
      setSuccessMessage('Datos logisticos actualizados.')
      fillSelectedShipment(updatedShipment)
      await loadShipmentEvents(updatedShipment.id)
      await loadShipments(page)
      clearSuccessMessageLater()
    } catch (err) {
      setErrorMessage(err.message || 'Error actualizando datos logisticos.')
    } finally {
      setIsSaving(false)
    }
  }

  async function updateStatus(event) {
    event.preventDefault()
    if (!session?.token || !statusForm.shipmentId.trim()) return

    try {
      setIsSaving(true)
      setErrorMessage('')
      const updatedShipment = await updateShipmentStatus({
        description: normalizeOptional(statusForm.description),
        location: normalizeOptional(statusForm.location),
        occurredAt: toIsoDateTime(statusForm.occurredAt),
        shipmentId: statusForm.shipmentId.trim(),
        status: statusForm.status,
        token: session.token,
      })
      setSuccessMessage('Estado del envio actualizado.')
      fillSelectedShipment(updatedShipment)
      await loadShipmentEvents(updatedShipment.id)
      await loadShipments(page)
      clearSuccessMessageLater()
    } catch (err) {
      setErrorMessage(err.message || 'Error actualizando estado.')
    } finally {
      setIsSaving(false)
    }
  }

  async function cancelSelectedShipment() {
    const shipmentId = statusForm.shipmentId || selectedShipment?.id
    if (!session?.token || !shipmentId) return

    try {
      setIsSaving(true)
      setErrorMessage('')
      const cancelledShipment = await cancelShipment({
        shipmentId,
        token: session.token,
      })
      setSuccessMessage('Envio cancelado.')
      fillSelectedShipment(cancelledShipment)
      await loadShipmentEvents(cancelledShipment.id)
      await loadShipments(page)
      clearSuccessMessageLater()
    } catch (err) {
      setErrorMessage(err.message || 'Error cancelando envio.')
    } finally {
      setIsSaving(false)
    }
  }

  function fillSelectedShipment(shipment) {
    setSelectedShipment(shipment)
    setLookup((prev) => ({
      ...prev,
      orderId: shipment.orderId || prev.orderId,
      shipmentId: shipment.id || prev.shipmentId,
      trackingNumber: shipment.trackingNumber || prev.trackingNumber,
    }))
    setStatusForm(buildStatusFormFromShipment(shipment))
    setUpdateForm(buildUpdateFormFromShipment(shipment))
  }

  function clearSelectedShipment() {
    setSelectedShipment(null)
    setShipmentEvents([])
    setStatusForm(INITIAL_STATUS_FORM)
    setUpdateForm(INITIAL_UPDATE_FORM)
  }

  function clearSuccessMessageLater() {
    window.setTimeout(() => setSuccessMessage(''), 3000)
  }

  return {
    filters,
    dispatchOrderFilters,
    dispatchOrderPage,
    dispatchOrders,
    dispatchOrderTotalElements,
    dispatchOrderTotalPages,
    handleDispatchOrderFilterChange,
    handleFilterChange,
    handleLookupChange,
    handleShipmentFormChange,
    handleStatusFormChange,
    handleUpdateFormChange,
    hasStatusActionOptions,
    isLoading,
    isLoadingDispatchOrders,
    isLoadingEvents,
    isSaving,
    lookup,
    page,
    selectedShipment,
    shipmentEvents,
    shipmentForm,
    shipments,
    statusActionOptions,
    statusForm,
    summary,
    totalElements,
    totalPages,
    updateForm,
    errorMessage,
    successMessage,
    SHIPMENT_STATUSES,
    applyFilters,
    applyDispatchOrderFilters,
    cancelSelectedShipment,
    clearFilters,
    createShipmentFromOrder,
    createNewShipment,
    goToDispatchOrderPage,
    goToPage,
    loadDispatchOrders,
    loadShipmentById,
    loadShipmentByOrder,
    loadShipmentByTracking,
    loadShipmentEvents,
    loadShipments,
    selectShipment,
    updateShipmentDetails,
    updateStatus,
  }
}

function buildSummary(shipments) {
  return {
    cancelled: countStatus(shipments, 'cancelled'),
    delivered: countStatus(shipments, 'delivered'),
    inTransit: countStatus(shipments, 'in_transit'),
    pending: countStatus(shipments, 'pending'),
    readyToShip: countStatus(shipments, 'ready_to_ship'),
  }
}

function countStatus(shipments, status) {
  return shipments.filter((shipment) => shipment.status === status).length
}

function getNextStatusOptions(currentStatus) {
  if (!currentStatus) {
    return SHIPMENT_STATUSES
  }
  return STATUS_TRANSITIONS[currentStatus] || []
}

function buildStatusFormFromShipment(shipment) {
  const nextStatuses = getNextStatusOptions(shipment.status)

  return {
    ...INITIAL_STATUS_FORM,
    shipmentId: shipment.id || '',
    status: nextStatuses[0] || shipment.status || INITIAL_STATUS_FORM.status,
  }
}

function buildUpdateFormFromShipment(shipment) {
  return {
    carrier: shipment.carrier || '',
    shipmentId: shipment.id || '',
    shippingAddress: shipment.shippingAddress || '',
    trackingNumber: shipment.trackingNumber || '',
  }
}

function buildCreatePayload(form) {
  return {
    carrier: normalizeOptional(form.carrier),
    orderId: form.orderId.trim(),
    shippingAddress: normalizeOptional(form.shippingAddress),
    trackingNumber: normalizeOptional(form.trackingNumber),
  }
}

function buildUpdatePayload(form) {
  return {
    carrier: normalizeOptional(form.carrier),
    shippingAddress: form.shippingAddress.trim(),
    trackingNumber: normalizeOptional(form.trackingNumber),
  }
}

function validateShipmentCreateForm(form) {
  if (!form.orderId.trim()) {
    return 'Ingresa el ID del pedido.'
  }

  return ''
}

function validateShipmentUpdateForm(form) {
  if (!form.shipmentId.trim()) {
    return 'Selecciona o busca un envio antes de editarlo.'
  }

  if (!form.shippingAddress.trim()) {
    return 'Ingresa la direccion de envio.'
  }

  return ''
}

function normalizeOptional(value) {
  const normalizedValue = value?.trim()
  return normalizedValue || undefined
}

function toIsoDateTime(value) {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}
