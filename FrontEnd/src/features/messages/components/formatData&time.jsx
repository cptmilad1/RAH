function formatMessageDate(value) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
export default formatMessageDate