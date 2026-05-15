import { useEffect, useState } from 'react'
import {
  cancelOrder,
  createOrder,
  fetchOrderById,
  fetchOrders,
  fetchOrdersByCustomer,
  updateOrderStatus,
} from '../services/orderService'

const PAGE_SIZE = 10

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'PAYMENT_FAILED',
]

const INITIAL_FILTERS = {
  customerId: '',
  status: '',
}

const INITIAL_ORDER_FORM = {
  shippingAddress: '',
  items: [{ sku: '', quantity: '1' }],
}

const INITIAL_LOOKUP = {
  orderId: '',
  customerId: '',
}

const INITIAL_STATUS_FORM = {
  orderId: '',
  status: 'SHIPPED',
}

/*
 * Hook de orquestacion para el panel admin de pedidos.
 * Mantiene estado de UI separado de llamadas HTTP al API Gateway.
 */
export function useOrdersAdmin(session) {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [orderForm, setOrderForm] = useState(INITIAL_ORDER_FORM)
  const [lookup, setLookup] = useState(INITIAL_LOOKUP)
  const [statusForm, setStatusForm] = useState(INITIAL_STATUS_FORM)
  const [ordersPage, setOrdersPage] = useState(null)
  const [customerOrdersPage, setCustomerOrdersPage] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [page, setPage] = useState(0)
  const [customerPage, setCustomerPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const orders = ordersPage?.content || []
  const customerOrders = customerOrdersPage?.content || []
  const totalElements = ordersPage?.totalElements || 0
  const totalPages = ordersPage?.totalPages || 0
  const customerTotalElements = customerOrdersPage?.totalElements || 0
  const customerTotalPages = customerOrdersPage?.totalPages || 0
  const summary = calculateSummary(orders)

  useEffect(() => {
    if (!session?.token) {
      return
    }

    loadOrders()
    // La carga inicial depende solo del token de sesion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token])

  async function loadOrders(nextPage = page, nextFilters = filters) {
    if (!session?.token) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetchOrders({
        filters: nextFilters,
        page: nextPage,
        size: PAGE_SIZE,
        token: session.token,
      })
      setOrdersPage(response)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function applyFilters(event) {
    event.preventDefault()
    setPage(0)
    loadOrders(0, filters)
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS)
    setPage(0)
    loadOrders(0, INITIAL_FILTERS)
  }

  function goToPage(nextPage) {
    setPage(nextPage)
    loadOrders(nextPage, filters)
  }

  function goToCustomerPage(nextPage) {
    setCustomerPage(nextPage)
    loadCustomerOrders(nextPage, lookup.customerId)
  }

  function handleOrderFormChange(event) {
    const { name, value } = event.target

    setOrderForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function handleOrderItemChange(index, event) {
    const { name, value } = event.target

    setOrderForm((currentForm) => ({
      ...currentForm,
      items: currentForm.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [name]: value } : item,
      ),
    }))
  }

  function addOrderItem() {
    setOrderForm((currentForm) => ({
      ...currentForm,
      items: [...currentForm.items, { sku: '', quantity: '1' }],
    }))
  }

  function removeOrderItem(index) {
    setOrderForm((currentForm) => ({
      ...currentForm,
      items:
        currentForm.items.length === 1
          ? currentForm.items
          : currentForm.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  function handleLookupChange(event) {
    const { name, value } = event.target

    setLookup((currentLookup) => ({
      ...currentLookup,
      [name]: value,
    }))
  }

  function handleStatusFormChange(event) {
    const { name, value } = event.target

    setStatusForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  async function handleCreateOrder(event) {
    event.preventDefault()

    const validationMessage = validateOrderForm(orderForm)
    if (validationMessage) {
      setErrorMessage(validationMessage)
      setSuccessMessage('')
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const createdOrder = await createOrder({
        order: buildOrderPayload(orderForm),
        token: session.token,
      })
      setSelectedOrder(createdOrder)
      setOrderForm(INITIAL_ORDER_FORM)
      setStatusForm({
        orderId: createdOrder.id,
        status: nextSuggestedStatus(createdOrder.status),
      })
      setSuccessMessage(`Pedido ${shortId(createdOrder.id)} creado correctamente.`)
      setPage(0)
      await loadOrders(0, filters)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function searchOrderById() {
    const orderId = lookup.orderId.trim()
    if (!orderId) {
      setErrorMessage('Ingresa el ID del pedido.')
      return
    }

    await loadOrderDetail(orderId)
  }

  async function loadCustomerOrders(nextPage = customerPage, customerId = lookup.customerId) {
    const normalizedCustomerId = customerId.trim()
    if (!normalizedCustomerId) {
      setErrorMessage('Ingresa el ID del cliente.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetchOrdersByCustomer({
        customerId: normalizedCustomerId,
        page: nextPage,
        size: PAGE_SIZE,
        token: session.token,
      })
      setCustomerOrdersPage(response)
      setLookup((currentLookup) => ({
        ...currentLookup,
        customerId: normalizedCustomerId,
      }))
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCustomerSearch(event) {
    event.preventDefault()
    setCustomerPage(0)
    await loadCustomerOrders(0, lookup.customerId)
  }

  async function handleUpdateStatus(event) {
    event.preventDefault()

    const orderId = statusForm.orderId.trim()
    if (!orderId) {
      setErrorMessage('Selecciona o ingresa el ID del pedido.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const updatedOrder = await updateOrderStatus({
        orderId,
        status: statusForm.status,
        token: session.token,
      })
      setSelectedOrder(updatedOrder)
      setStatusForm({
        orderId: updatedOrder.id,
        status: nextSuggestedStatus(updatedOrder.status),
      })
      setSuccessMessage(`Estado actualizado a ${updatedOrder.status}.`)
      await loadOrders(page, filters)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCancelOrder() {
    const orderId = statusForm.orderId.trim() || selectedOrder?.id
    if (!orderId) {
      setErrorMessage('Selecciona o ingresa el ID del pedido.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const cancelledOrder = await cancelOrder({
        orderId,
        token: session.token,
      })
      setSelectedOrder(cancelledOrder)
      setStatusForm({
        orderId: cancelledOrder.id,
        status: nextSuggestedStatus(cancelledOrder.status),
      })
      setSuccessMessage('Pedido cancelado correctamente.')
      await loadOrders(page, filters)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  function selectOrder(order) {
    setSelectedOrder(order)
    setLookup((currentLookup) => ({
      ...currentLookup,
      orderId: order.id,
      customerId: order.customerId,
    }))
    setStatusForm({
      orderId: order.id,
      status: nextSuggestedStatus(order.status),
    })
    setSuccessMessage(`Pedido ${shortId(order.id)} seleccionado.`)
    setErrorMessage('')
  }

  async function loadOrderDetail(orderId) {
    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const order = await fetchOrderById({
        orderId,
        token: session.token,
      })
      selectOrder(order)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    addOrderItem,
    applyFilters,
    clearFilters,
    customerOrders,
    customerPage,
    customerTotalElements,
    customerTotalPages,
    errorMessage,
    filters,
    goToCustomerPage,
    goToPage,
    handleCancelOrder,
    handleCreateOrder,
    handleCustomerSearch,
    handleFilterChange,
    handleLookupChange,
    handleOrderFormChange,
    handleOrderItemChange,
    handleStatusFormChange,
    handleUpdateStatus,
    isLoading,
    isSaving,
    loadCustomerOrders,
    loadOrders,
    lookup,
    orderForm,
    orders,
    page,
    removeOrderItem,
    searchOrderById,
    selectOrder,
    selectedOrder,
    statusForm,
    statusOptions: ORDER_STATUSES,
    successMessage,
    summary,
    totalElements,
    totalPages,
  }
}

function calculateSummary(orders) {
  return orders.reduce(
    (currentSummary, order) => ({
      cancelled:
        order.status === 'CANCELLED'
          ? currentSummary.cancelled + 1
          : currentSummary.cancelled,
      confirmed:
        order.status === 'CONFIRMED'
          ? currentSummary.confirmed + 1
          : currentSummary.confirmed,
      pending:
        order.status === 'PENDING'
          ? currentSummary.pending + 1
          : currentSummary.pending,
      shipped:
        order.status === 'SHIPPED'
          ? currentSummary.shipped + 1
          : currentSummary.shipped,
      totalAmount: currentSummary.totalAmount + Number(order.totalAmount || 0),
    }),
    { cancelled: 0, confirmed: 0, pending: 0, shipped: 0, totalAmount: 0 },
  )
}

function buildOrderPayload(form) {
  return {
    shippingAddress: form.shippingAddress.trim(),
    items: form.items.map((item) => ({
      sku: item.sku.trim(),
      quantity: Number(item.quantity),
    })),
  }
}

function validateOrderForm(form) {
  if (!form.shippingAddress.trim()) {
    return 'Ingresa la direccion de envio.'
  }

  const normalizedSkus = new Set()
  for (const item of form.items) {
    const sku = item.sku.trim().toUpperCase()
    const quantity = Number(item.quantity)

    if (!sku) {
      return 'Todos los items deben tener SKU.'
    }

    if (normalizedSkus.has(sku)) {
      return `El SKU ${sku} esta duplicado en el pedido.`
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return 'Todas las cantidades deben ser enteros mayores que cero.'
    }

    normalizedSkus.add(sku)
  }

  return ''
}

function nextSuggestedStatus(status) {
  if (status === 'PENDING') {
    return 'CONFIRMED'
  }
  if (status === 'CONFIRMED') {
    return 'SHIPPED'
  }
  if (status === 'SHIPPED') {
    return 'DELIVERED'
  }
  return 'SHIPPED'
}

function shortId(id) {
  return String(id || '').slice(0, 8)
}
