function Actions(user, navigate) {
    const actions = [
    { label: 'مرسوله‌ها', icon: '▣', variant: 'highlight', onClick: () => navigate('/shipments') },
    { label: 'تاکسی آنلاین', icon: '⌖', variant: 'dark' },
    ...(user?.role === 'driver' ? [{ label: 'پنل راننده', icon: '⇢', to: '/driver' }] : []),
    ...(user?.role === 'user' ? [{ label: 'ثبت‌نام به‌عنوان راننده', icon: '＋', to: '/driver-application' }] : []),
    ...(user?.role === 'admin' ? [{ label: 'پنل ادمین', icon: '⚙', to: '/admin' }] : []),
  ]
  return actions
}
export default Actions