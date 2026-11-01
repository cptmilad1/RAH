function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}
export default formatDate