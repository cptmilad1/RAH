import i18n from '../../settings/locals/i18n.js'
import { useState } from 'react'

function MessageDataForm({
  blocked,
  state,
  connected,
  socket,
  userId,
  setState,
  setConversation,
}) {
  const [message, setMessage] = useState('')

  function submitMessage(event) {
    event.preventDefault()
    const text = message.trim()
    if (!text || text.length > 2000 || blocked || state.sending) return
    if (!socket || !connected) {
      setState((current) => ({ ...current, error: 'برای ارسال پیام باید اتصال زنده برقرار باشد.' }))
      return
    }

    setState((current) => ({ ...current, sending: true, error: '' }))
    try {
      socket.timeout(8000).emit('direct:send', { userId, message: text }, (timeoutError, response) => {
        if (timeoutError || response?.error || !response?.message) {
          setState((current) => ({
            ...current,
            sending: false,
            error: response?.error || 'ارسال پیام با خطا روبه‌رو شد؛ دوباره تلاش کنید.',
          }))
          return
        }
        setConversation((current) => {
          if (!current || current.messages.some((item) => String(item.id) === String(response.message.id))) return current
          return { ...current, messages: [...current.messages, response.message] }
        })
        setMessage('')
        setState((current) => ({ ...current, sending: false }))
      })
    } catch (error) {
      setState((current) => ({
        ...current,
        sending: false,
        error: error.message || 'ارسال پیام ناموفق بود.',
      }))
    }
  }

  return (
    <form onSubmit={submitMessage} className="mt-4 flex gap-2">
      <label htmlFor="direct-message-input" className="sr-only">{i18n.t("نوشتن پیام")}</label>
      <input
        id="direct-message-input"
        value={message}
        maxLength={2000}
        onChange={(event) => setMessage(event.target.value)}
        disabled={blocked || state.sending || !connected}
        placeholder={i18n.t(blocked ? 'ارسال پیام غیرفعال است' : 'پیامت را بنویس…')}
        className="min-w-0 flex-1 rounded-xl border border-[#dfe8df] px-4 py-3 text-sm outline-none focus:border-[#77955f] disabled:bg-[#f4f6f2]"
      />
      <button
        type="submit"
        disabled={blocked || state.sending || !connected || !message.trim()}
        className="rounded-xl bg-[#173f32] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {i18n.t(state.sending ? '…' : 'ارسال')}
      </button>
    </form>
  )
}

export default MessageDataForm
