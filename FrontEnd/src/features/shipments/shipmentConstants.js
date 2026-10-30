export const statusLabels = {
  created: 'در انتظار بررسی',
  assigned: 'در صف دریافت',
  picked_up: 'دریافت‌شده',
  in_transit: 'در مسیر',
  delivered: 'تحویل‌شده',
  cancelled: 'لغوشده',
}

export const afghanistanProvinces = [
  'کابل', 'کاپیسا', 'پروان', 'وردک', 'لوگر', 'غزنی', 'پکتیا', 'پکتیکا', 'خوست',
  'ننگرهار', 'لغمان', 'کنر', 'نورستان', 'بدخشان', 'تخار', 'کندز', 'بغلان', 'سمنگان',
  'بلخ', 'جوزجان', 'سرپل', 'فاریاب', 'بادغیس', 'هرات', 'فراه', 'نیمروز', 'هلمند',
  'قندهار', 'زابل', 'ارزگان', 'دایکندی', 'بامیان', 'پنجشیر',
]

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
  pickup: { province: '', city: '', addressLine: '' },
  delivery: { province: '', city: '', addressLine: '' },
  itemName: '',
  quantity: '1',
  weightKg: '',
  description: '',
}

export function formatShipmentDate(value) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(value))
}
