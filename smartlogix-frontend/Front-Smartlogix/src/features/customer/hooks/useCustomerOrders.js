import { useEffect, useMemo, useState } from 'react'
import {
  cancelOrder,
  createOrder,
  fetchOrderById,
  fetchOrders,
  fetchOrdersByCustomer,
} from '../../orders/services/orderService'
import { fetchProducts } from '../../inventory/services/inventoryService'

const PAGE_SIZE = 10

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'PAYMENT_FAILED',
]

const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED', 'PAYMENT_FAILED']

const INITIAL_FILTERS = {
  status: '',
}

const INITIAL_PRODUCT_FILTERS = {
  category: '',
  name: '',
  sku: '',
}

const EMPTY_ORDER_ITEM = {
  productName: '',
  quantity: '1',
  sku: '',
  unitPrice: '',
}

const INITIAL_ORDER_FORM = {
  shippingAddress: '',
  items: [EMPTY_ORDER_ITEM],
}

const INITIAL_LOOKUP = {
  orderId: '',
}

/*
 * Hook del rol CLIENTE.
 * El cliente no envia customerId al crear pedidos; pedidos-service resuelve el
 * propietario desde los headers internos que arma el API Gateway con el JWT.
 */
export function useCustomerOrders(session) {
  const customerId = session?.user?.id || ''
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [productFilters, setProductFilters] = useState(INITIAL_PRODUCT_FILTERS)
  const [orderForm, setOrderForm] = useState(INITIAL_ORDER_FORM)
  const [lookup, setLookup] = useState(INITIAL_LOOKUP)
  const [ordersPage, setOrdersPage] = useState(null)
  const [customerOrdersPage, setCustomerOrdersPage] = useState(null)
  const [productsPage, setProductsPage] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [page, setPage] = useState(0)
  const [customerPage, setCustomerPage] = useState(0)
  const [productPage, setProductPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const orders = useMemo(() => ordersPage?.content || [], [ordersPage])
  const customerOrders = useMemo(
    () => customerOrdersPage?.content || [],
    [customerOrdersPage],
  )
  const products = useMemo(() => productsPage?.content || [], [productsPage])
  const totalElements = ordersPage?.totalElements || 0
  const totalPages = ordersPage?.totalPages || 0
  const customerTotalElements = customerOrdersPage?.totalElements || 0
  const customerTotalPages = customerOrdersPage?.totalPages || 0
  const productTotalElements = productsPage?.totalElements || 0
  const productTotalPages = productsPage?.totalPages || 0
  const summary = useMemo(() => calculateSummary(orders), [orders])
  const orderDraftSummary = useMemo(
    () => calculateOrderDraftSummary(orderForm.items),
    [orderForm.items],
  )
  const canCancelSelectedOrder =
    selectedOrder && CANCELLABLE_STATUSES.includes(selectedOrder.status)

  useEffect(() => {
    if (!session?.token) {
      return
    }

    loadOrders()
    loadOrdersByCurrentCustomer()
    loadProducts()
    // La carga inicial depende solo de la sesion autenticada.
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
        filters: {
          customerId: '',
          status: nextFilters.status,
        },
        page: nextPage,
        size: PAGE_SIZE,
        token: session.token,
      })
      setOrdersPage(response)
      setFilters(nextFilters)
      setPage(nextPage)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadOrdersByCurrentCustomer(nextPage = customerPage) {
    if (!session?.token || !customerId) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetchOrdersByCustomer({
        customerId,
        page: nextPage,
        size: PAGE_SIZE,
        token: session.token,
      })
      setCustomerOrdersPage(response)
      setCustomerPage(nextPage)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadProducts(nextPage = productPage, nextFilters = productFilters) {
    if (!session?.token) {
      return
    }

    setIsLoadingProducts(true)
    setErrorMessage('')

    try {
      const response = await fetchProducts({
        filters: nextFilters,
        page: nextPage,
        size: PAGE_SIZE,
        token: session.token,
      })
      setProductsPage(response)
      setProductFilters(nextFilters)
      setProductPage(nextPage)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function handleProductFilterChange(event) {
    const { name, value } = event.target
    setProductFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function applyProductFilters(event) {
    event.preventDefault()
    loadProducts(0, productFilters)
  }

  function clearProductFilters() {
    loadProducts(0, INITIAL_PRODUCT_FILTERS)
  }

  function applyFilters(event) {
    event.preventDefault()
    loadOrders(0, filters)
  }

  function clearFilters() {
    loadOrders(0, INITIAL_FILTERS)
  }

  function goToPage(nextPage) {
    loadOrders(nextPage, filters)
  }

  function goToCustomerPage(nextPage) {
    loadOrdersByCurrentCustomer(nextPage)
  }

  function goToProductPage(nextPage) {
    loadProducts(nextPage, productFilters)
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
      items: currentForm.items.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item
        }

        if (name === 'sku') {
          return enrichOrderItemBySku({ ...item, sku: value }, products)
        }

        return { ...item, [name]: value }
      }),
    }))
  }

  function addOrderItem() {
    setOrderForm((currentForm) => ({
      ...currentForm,
      items: [...currentForm.items, EMPTY_ORDER_ITEM],
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

  function addProductToOrder(product) {
    setOrderForm((currentForm) => {
      const existingItemIndex = currentForm.items.findIndex(
        (item) => item.sku.trim().toUpperCase() === product.sku.toUpperCase(),
      )
      if (existingItemIndex >= 0) {
        return {
          ...currentForm,
          items: currentForm.items.map((item, itemIndex) =>
            itemIndex === existingItemIndex
              ? {
                  ...buildOrderItemFromProduct(product),
                  quantity: String(Number(item.quantity || 0) + 1),
                }
              : item,
          ),
        }
      }

      const emptyItemIndex = currentForm.items.findIndex((item) => !item.sku.trim())
      if (emptyItemIndex >= 0) {
        return {
          ...currentForm,
          items: currentForm.items.map((item, itemIndex) =>
            itemIndex === emptyItemIndex
              ? {
                  ...buildOrderItemFromProduct(product),
                  quantity: item.quantity || '1',
                }
              : item,
          ),
        }
      }

      return {
        ...currentForm,
        items: [...currentForm.items, buildOrderItemFromProduct(product)],
      }
    })
    setSuccessMessage(`Producto ${product.sku} agregado al pedido.`)
    setErrorMessage('')
  }

  function handleLookupChange(event) {
    const { name, value } = event.target
    setLookup((currentLookup) => ({
      ...currentLookup,
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
        order: buildCustomerOrderPayload(orderForm),
        token: session.token,
      })
      setSelectedOrder(createdOrder)
      setOrderForm(INITIAL_ORDER_FORM)
      setLookup({ orderId: createdOrder.id })
      setSuccessMessage(`Pedido ${shortId(createdOrder.id)} creado correctamente.`)
      await loadOrders(0, filters)
      await loadOrdersByCurrentCustomer(0)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function searchOrderById(event) {
    event.preventDefault()
    const orderId = lookup.orderId.trim()

    if (!orderId) {
      setErrorMessage('Ingresa el ID del pedido.')
      return
    }

    await loadOrderDetail(orderId)
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

  function selectOrder(order) {
    setSelectedOrder(order)
    setLookup({ orderId: order.id })
    setSuccessMessage(`Pedido ${shortId(order.id)} seleccionado.`)
    setErrorMessage('')
  }

  async function handleCancelOrder() {
    if (!selectedOrder?.id) {
      setErrorMessage('Selecciona un pedido antes de cancelar.')
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const cancelledOrder = await cancelOrder({
        orderId: selectedOrder.id,
        token: session.token,
      })
      setSelectedOrder(cancelledOrder)
      setSuccessMessage('Pedido cancelado correctamente.')
      await loadOrders(page, filters)
      await loadOrdersByCurrentCustomer(customerPage)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    addOrderItem,
    addProductToOrder,
    applyFilters,
    applyProductFilters,
    canCancelSelectedOrder,
    clearFilters,
    clearProductFilters,
    customerId,
    customerOrders,
    customerPage,
    customerTotalElements,
    customerTotalPages,
    errorMessage,
    filters,
    goToCustomerPage,
    goToPage,
    goToProductPage,
    handleCancelOrder,
    handleCreateOrder,
    handleFilterChange,
    handleLookupChange,
    handleOrderFormChange,
    handleOrderItemChange,
    handleProductFilterChange,
    isLoading,
    isLoadingProducts,
    isSaving,
    loadOrders,
    loadOrdersByCurrentCustomer,
    loadProducts,
    lookup,
    orderForm,
    orderDraftSummary,
    orders,
    page,
    productFilters,
    productPage,
    products,
    productTotalElements,
    productTotalPages,
    removeOrderItem,
    searchOrderById,
    selectOrder,
    selectedOrder,
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
      delivered:
        order.status === 'DELIVERED'
          ? currentSummary.delivered + 1
          : currentSummary.delivered,
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
    {
      cancelled: 0,
      confirmed: 0,
      delivered: 0,
      pending: 0,
      shipped: 0,
      totalAmount: 0,
    },
  )
}

function buildCustomerOrderPayload(form) {
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

function buildOrderItemFromProduct(product) {
  return {
    productName: product.name || '',
    quantity: '1',
    sku: product.sku || '',
    unitPrice: String(product.unitPrice ?? ''),
  }
}

function enrichOrderItemBySku(item, products) {
  const product = products.find(
    (currentProduct) =>
      currentProduct.sku.toUpperCase() === item.sku.trim().toUpperCase(),
  )

  if (!product) {
    return {
      ...item,
      productName: '',
      unitPrice: '',
    }
  }

  return {
    ...item,
    productName: product.name || '',
    unitPrice: String(product.unitPrice ?? ''),
  }
}

function calculateOrderDraftSummary(items) {
  return items.reduce(
    (currentSummary, item) => {
      const hasSku = Boolean(item.sku.trim())
      const quantity = Number(item.quantity)
      const unitPrice = Number(item.unitPrice)
      const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0
      const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0

      return {
        itemCount: hasSku ? currentSummary.itemCount + 1 : currentSummary.itemCount,
        totalAmount: currentSummary.totalAmount + safeQuantity * safeUnitPrice,
        totalQuantity: currentSummary.totalQuantity + safeQuantity,
      }
    },
    {
      itemCount: 0,
      totalAmount: 0,
      totalQuantity: 0,
    },
  )
}

function shortId(id) {
  return String(id || '').slice(0, 8)
}
