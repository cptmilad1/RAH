function exportUsers(users) {
  const columns = [
    ['fullName', 'نام'],
    ['username', 'نام کاربری'],
    ['email', 'ایمیل'],
    ['phone', 'شماره تماس'],
    ['role', 'نقش'],
    ['driverProvince', 'ولایت'],
    ['driverStatus', 'وضعیت درخواست رانندگی'],
    ['createdAt', 'تاریخ عضویت'],
    ['isActive', 'حساب فعال'],
  ]
  const escapeCell = (value) => {
    const text = String(value ?? '')
    const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
    return `"${safeText.replaceAll('"', '""')}"`
  }
  const csv = [
    columns.map(([, label]) => escapeCell(label)).join(','),
    ...users.map((user) => columns.map(([key]) => escapeCell(user[key])).join(',')),
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
  const download = document.createElement('a')
  download.href = url
  download.download = 'rah-admin-users.csv'
  download.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export default exportUsers