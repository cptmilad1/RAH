export const statusLabels = {
  created: 'در انتظار بررسی',
  assigned: 'در صف دریافت',
  picked_up: 'دریافت‌شده',
  in_transit: 'در مسیر',
  delivered: 'تحویل‌شده',
  cancelled: 'لغوشده',
}

export const shipmentFilters = [
  { id: 'all', label: 'همه' },
  { id: 'created', label: 'در انتظار' },
  { id: 'assigned', label: 'در صف دریافت' },
  { id: 'picked_up', label: 'دریافت‌شده' },
  { id: 'in_transit', label: 'در مسیر' },
  { id: 'delivered', label: 'تحویل‌شده' },
  { id: 'cancelled', label: 'لغوشده' },
]

export const initialShipmentForm = {
  receiver: { name: '', phone: '' },
  pickup: { city: '', addressLine: '' },
  delivery: { city: '', addressLine: '' },
  itemName: '',
  quantity: '1',
  weightKg: '',
  description: '',
}

export function formatShipmentDate(value) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(value))
}
