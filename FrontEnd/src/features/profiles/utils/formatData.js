function formatDate(value, language = 'fa') {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR' : 'en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}
export default formatDate