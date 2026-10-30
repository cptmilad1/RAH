import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { initialShipmentForm } from '../shipmentConstants'
import { useShipmentsStore } from '../shipmentsStore'

export function useShipmentPage() {
  const shipments = useShipmentsStore((state) => state.shipments)
  const loading = useShipmentsStore((state) => state.loading)
  const saving = useShipmentsStore((state) => state.saving)
  const error = useShipmentsStore((state) => state.error)
  const fetchShipments = useShipmentsStore((state) => state.fetchShipments)
  const addShipment = useShipmentsStore((state) => state.addShipment)
  const cancelShipment = useShipmentsStore((state) => state.cancelShipment)
  const clearError = useShipmentsStore((state) => state.clearError)
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase())
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(initialShipmentForm)
  const [formError, setFormError] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')

  useEffect(() => {
    fetchShipments()
  }, [fetchShipments])

  const filteredShipments = useMemo(() => shipments.filter((shipment) => {
    const matchesStatus = activeFilter === 'all' || shipment.status === activeFilter
    const searchable = `${shipment.trackingCode} ${shipment.receiverName || ''} ${shipment.receiverPhone || ''} ${shipment.pickupProvince || ''} ${shipment.deliveryProvince || ''}`.toLocaleLowerCase()
    return matchesStatus && searchable.includes(deferredSearch)
  }), [shipments, activeFilter, deferredSearch])

  const stats = useMemo(() => ({
    total: shipments.length,
    active: shipments.filter((shipment) => ['created', 'assigned', 'picked_up', 'in_transit'].includes(shipment.status)).length,
    delivered: shipments.filter((shipment) => shipment.status === 'delivered').length,
  }), [shipments])

  function updateFormField(section, field, value) {
    setForm((current) => section
      ? { ...current, [section]: { ...current[section], [field]: value } }
      : { ...current, [field]: value })
  }

  async function submitShipment(event) {
    event.preventDefault()
    setFormError('')
    clearError()
    try {
      await addShipment({
        ...form,
        quantity: Number(form.quantity),
        weightKg: form.weightKg ? Number(form.weightKg) : null,
      })
      setForm(initialShipmentForm)
      setFormOpen(false)
    } catch (submitError) {
      setFormError(submitError.message || 'ثبت مرسوله ناموفق بود.')
    }
  }

  async function submitCancellation(event) {
    event.preventDefault()
    setCancelError('')
    try {
      await cancelShipment(cancelTarget.trackingCode, cancelReason)
      setCancelTarget(null)
      setCancelReason('')
    } catch (cancelRequestError) {
      setCancelError(cancelRequestError.message || 'لغو مرسوله ناموفق بود.')
    }
  }

  return {
    shipments, loading, saving, error, fetchShipments, clearError,
    activeFilter, setActiveFilter, search, setSearch, deferredSearch, filteredShipments, stats,
    formOpen, setFormOpen, form, setForm, formError, setFormError,
    updateFormField, submitShipment,
    cancelTarget, setCancelTarget, cancelReason, setCancelReason,
    cancelError, setCancelError, submitCancellation,
  }
}
