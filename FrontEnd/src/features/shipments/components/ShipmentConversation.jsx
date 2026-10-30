import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../auth/authStore'
import { usePresenceStore } from '../../presence/presenceStore'

function ShipmentConversation({ trackingCode }) {
  const userId = useAuthStore((state) => state.user?.id)
  const socket = usePresenceStore((state) => state.socket)
  const connected = usePresenceStore((state) => state.connected)
  const connectionError = usePresenceStore((state) => state.connectionError)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!socket || !connected) return undefined

    function handleHistory(payload) {
      if (payload.trackingCode === trackingCode) setMessages(payload.messages)
    }
    function handleMessage(payload) {
      if (payload.trackingCode !== trackingCode) return
      setMessages((current) => current.some((item) => item.id === payload.message.id)
        ? current
        : [...current, payload.message])
    }
    function handleError(payload) {
      if (payload.trackingCode === trackingCode) setError(payload.message)
    }
    socket.on('parcel:chat:history', handleHistory)
    socket.on('parcel:chat:message', handleMessage)
    socket.on('parcel:chat:error', handleError)
    socket.emit('parcel:join', { trackingCode })
    return () => {
      socket.emit('parcel:leave', { trackingCode })
      socket.off('parcel:chat:history', handleHistory)
      socket.off('parcel:chat:message', handleMessage)
      socket.off('parcel:chat:error', handleError)
    }
  }, [socket, connected, trackingCode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])

  function submitMessage(event) {
    event.preventDefault()
    const text = message.trim()
    if (!text || !socket || !connected || sending) return

    setSending(true)
    setError('')
    socket.timeout(8000).emit('parcel:chat:send', { trackingCode, message: text }, (timeoutError, response) => {
      setSending(false)
      if (timeoutError) {
        setError('ارسال پیام با خطا روبه‌رو شد؛ دوباره تلاش کن.')
      } else if (response?.error) {
        setError(response.error)
      } else {
        setMessage('')
      }
    })
  }

  return (
    <section className="mt-5 rounded-[24px] border border-[#e5ebe3] bg-white p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="m-0 text-lg font-extrabold">گفت‌وگوی مرسوله</h2>
          <p className="mb-0 mt-1 text-xs text-[#8c9991]">
            {connected ? 'اتصال بلادرنگ برقرار است' : connectionError ? `اتصال برقرار نشد: ${connectionError}` : 'در انتظار اتصال…'}
          </p>
        </div>
        <span className={`size-2.5 rounded-full ${connected ? 'bg-[#79a85b]' : 'bg-[#d6a94f]'}`} aria-label={connected ? 'متصل' : 'در حال اتصال'} />
      </div>
      <div aria-live="polite" className="mt-5 grid max-h-80 gap-3 overflow-y-auto rounded-2xl bg-[#f7f9f4] p-4">
        {messages.length === 0 && <p className="my-4 text-center text-xs text-[#84918a]">هنوز پیامی در این گفت‌وگو نیست.</p>}
        {messages.map((item) => (
          <div key={item.id} className={`flex ${String(item.senderId) === String(userId) ? 'justify-start' : 'justify-end'}`}>
            <article className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-sm ${String(item.senderId) === String(userId) ? 'bg-[#f5df62] text-[#3d3513]' : 'bg-white text-[#17352e]'}`}>
              <p className="mb-1 text-[11px] font-bold opacity-70">{item.senderName || 'کاربر'}</p>
              <p className="m-0 whitespace-pre-wrap break-words text-sm leading-6">{item.message}</p>
              <time className="mt-2 block text-left text-[10px] opacity-60">
                {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}
              </time>
            </article>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {error && <p role="alert" className="mb-0 mt-3 text-xs text-[#a94f3d]">{error}</p>}
      <form onSubmit={submitMessage} className="mt-4 flex gap-2">
        <label htmlFor="shipment-message" className="sr-only">پیام به راننده</label>
        <input
          id="shipment-message"
          value={message}
          maxLength={2000}
          onChange={(event) => setMessage(event.target.value)}
          disabled={!connected || sending}
          placeholder="پیامت را بنویس…"
          className="min-w-0 flex-1 rounded-xl border border-[#dfe8df] px-4 py-3 text-sm outline-none focus:border-[#77955f] disabled:bg-[#f4f6f2]"
        />
        <button type="submit" disabled={!connected || sending || !message.trim()} className="rounded-xl bg-[#173f32] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {sending ? '…' : 'ارسال'}
        </button>
      </form>
    </section>
  )
}

export default ShipmentConversation
