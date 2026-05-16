import { useEffect, useState } from 'react'
import {
  cancelShipment,
  createShipment,
  fetchShipmentById,
  fetchShipments,
  updateShipmentStatus,
} from '../services/shippingService'

const PAGE_SIZE = 10

const SHIPMENT_STATUSES = [
  'PENDING',
  'IN_TRANSIT',
  'DELIVERED',
  'EXCEPTION',
  'CANCELLED'
]

const INITIAL_FILTERS = {
  orderId: '',
  status: '',
  trackingNumber: '',
}

const INITIAL_SHIPMENT_FORM = {
  orderId: '',
  carrier: '',
  trackingNumber: '',
  standardPrice: '0.00',
  externalReference: '',
}

const INITIAL_LOOKUP = {
  shipmentId: '',
}

const INITIAL_STATUS_FORM = {
  shipmentId: '',
  status: 'IN_TRANSIT',
  operationDetails: '',
}

/*
 * Hook de orquestacion para el panel admin de envíos.
 * Mantiene estado de UI separado de llamadas HTTP al API Gateway.
 */
export function useShippingAdmin(session) {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [shipmentForm, setShipmentForm] = useState(INITIAL_SHIPMENT_FORM)
  const [lookup, setLookup] = useState(INITIAL_LOOKUP)
  const [statusForm, setStatusForm] = useState(INITIAL_STATUS_FORM)
  const [shipmentsPage, setShipmentsPage] = useState(null)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const shipments = shipmentsPage?.content || []
  const totalElements = shipmentsPage?.totalElements || 0
  const totalPages = shipmentsPage?.totalPages || 0

  useEffect(() => {
    if (!session?.token) {
      return
    }
    loadShipments()
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
      
      // Limpiar messages si fue exitoso
      setErrorMessage('')
    } catch (err) {
      setErrorMessage(err.message || 'Error cargando envíos.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleFilterChange(e) {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  function submitFilters(e) {
    if (e) e.preventDefault()
    setPage(0)
    loadShipments(0, filters)
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS)
    setPage(0)
    loadShipments(0, INITIAL_FILTERS)
  }

  async function goToPage(newPage) {
    if (newPage >= 0 && newPage < totalPages) {
      loadShipments(newPage)
    }
  }

  async function loadShipmentById(id) {
    if (!session?.token || !id) return
    try {
      setIsLoading(true)
      setErrorMessage('')
      const data = await fetchShipmentById({ shipmentId: id, token: session.token })
      setSelectedShipment(data)
      setStatusForm({ ...INITIAL_STATUS_FORM, shipmentId: data.id })
    } catch (err) {
      setErrorMessage(err.message || 'Error al buscar envío.')
      setSelectedShipment(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function createNewShipment(e) {
    e.preventDefault()
    if (!session?.token) return
    try {
      setIsSaving(true)
      setErrorMessage('')
      
      await createShipment({ shipment: shipmentForm, token: session.token })
      
      setSuccessMessage('Envío creado exitosamente.')
      setShipmentForm(INITIAL_SHIPMENT_FORM)
      loadShipments(0)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage(err.message || 'Error creando envío.')
    } finally {
      setIsSaving(false)
    }
  }

  async function updateStatus(e) {
    e.preventDefault()
    if (!session?.token || !statusForm.shipmentId) return
    try {
      setIsSaving(true)
      setErrorMessage('')
      
      await updateShipmentStatus({
        shipmentId: statusForm.shipmentId,
        status: statusForm.status,
        operationDetails: statusForm.operationDetails,
        token: session.token,
      })
      
      setSuccessMessage('Estado actualizado.')
      loadShipmentById(statusForm.shipmentId)
      loadShipments() // update list as well
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage(err.message || 'Error actualizando estado.')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    filters,
    shipmentForm,
    lookup,
    statusForm,
    shipments,
    totalElements,
    totalPages,
    page,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    selectedShipment,
    SHIPMENT_STATUSES,
    setShipmentForm,
    setLookup,
    setStatusForm,
    handleFilterChange,
    submitFilters,
    clearFilters,
    goToPage,
    loadShipments,
    loadShipmentById,
    createNewShipment,
    updateStatus
  }
}
