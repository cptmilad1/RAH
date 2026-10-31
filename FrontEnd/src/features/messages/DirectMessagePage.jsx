import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuthStore } from '../auth/authStore'
import { usePresenceStore } from '../presence/presenceStore'
import Card from '../../global/Card'
import UserProfileLink from '../../global/UserProfileLink'
import { blockUser, unblockUser } from '../profiles/profileApi'
import { getDirectConversation } from './messagesApi'

function formatMessageDate(value) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function DirectMessagePage() {
  const { userId } = useParams()
  const currentUserId = useAuthStore((state) => state.user?.id)
  const socket = usePresenceStore((state) => state.socket)
  const connected = usePresenceStore((state) => state.connected)
  const [conversation, setConversation] = useState(null)
  const [message, setMessage] = useState('')
  const [state, setState] = useState({ loading: true, error: '', sending: false, savingBlock: false })
  const messageEndRef = useRef(null)

  useEffect(() => {
    let active = true
    setConversation(null)
    setState({ loading: true, error: '', sending: false, savingBlock: false })
    getDirectConversation(userId)
      .then((result) => {
        if (active) {
          setConversation(result)
          setState({ loading: false, error: '', sending: false, savingBlock: false })
        }
      })
      .catch((error) => {
        if (active) setState({ loading: false, error: error.message || 'بازکردن گفت‌وگو ناموفق بود.', sending: false, savingBlock: false })
      })
    return () => { active = false }
  }, [userId])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [conversation?.messages])

  useEffect(() => {
    if (!socket || !connected || !conversation?.otherUser?.id) return undefined

    function handleHistory(payload) {
      if (String(payload.userId) !== String(userId)) return
      setConversation((current) => current
        ? { ...current, messages: payload.messages }
        : current)
    }

    function handleMessage(payload) {
      if (String(payload.userId) !== String(userId)) return
      setConversation((current) => {
        if (!current) return current
        const alreadyReceived = current.messages.some((item) => String(item.id) === String(payload.message.id))
        return alreadyReceived ? current : { ...current, messages: [...current.messages, payload.message] }
      })
      if (String(payload.message.senderId) !== String(currentUserId)) {
        socket.emit('direct:read', { userId })
      }
    }

    socket.on('direct:history', handleHistory)
    socket.on('direct:message', handleMessage)
    socket.timeout(8000).emit('direct:join', { userId }, (timeoutError, response) => {
      if (timeoutError || response?.error) {
        setState((current) => ({
          ...current,
          error: response?.error || 'اتصال زنده برقرار نشد؛ اتصال اینترنت را بررسی کنید.',
        }))
      }
    })

    return () => {
      socket.off('direct:history', handleHistory)
      socket.off('direct:message', handleMessage)
    }
  }, [socket, connected, conversation?.otherUser?.id, userId, currentUserId])

  const blocked = conversation?.blockedByMe || conversation?.blockedMe

  async function submitMessage(event) {
    event.preventDefault()
    const text = message.trim()
    if (!text || text.length > 2000 || blocked || state.sending) return
    setState((current) => ({ ...current, sending: true, error: '' }))
    try {
      if (!socket || !connected) {
        setState((current) => ({ ...current, sending: false, error: 'برای ارسال پیام باید اتصال زنده برقرار باشد.' }))
        return
      }
      socket.timeout(8000).emit('direct:send', { userId, message: text }, (timeoutError, response) => {
        if (timeoutError || response?.error) {
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
      setState((current) => ({ ...current, sending: false, error: error.message || 'ارسال پیام ناموفق بود.' }))
    }
  }

  async function toggleBlock() {
    setState((current) => ({ ...current, savingBlock: true, error: '' }))
    try {
      const result = conversation.blockedByMe
        ? await unblockUser(userId)
        : await blockUser(userId)
      setConversation((current) => ({ ...current, blockedByMe: result.blockedByMe }))
      setState((current) => ({ ...current, savingBlock: false }))
    } catch (error) {
      setState((current) => ({ ...current, savingBlock: false, error: error.message || 'تغییر وضعیت مسدودسازی ناموفق بود.' }))
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f5f7f1] px-4 py-8 text-[#17352e] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/messages" className="text-sm font-bold text-[#547460] no-underline">← بازگشت به پیام‌ها</Link>
        {state.loading ? (
          <p role="status" className="mt-10 text-sm text-[#829188]">در حال بازکردن گفت‌وگو…</p>
        ) : state.error && !conversation ? (
          <p role="alert" className="mt-8 rounded-2xl bg-white p-6 text-sm text-[#a94f3d]">{state.error}</p>
        ) : conversation && (
          <>
            <Card as="header" variant="unstyled" className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-[26px] bg-[linear-gradient(135deg,#1d5742,#10382e)] p-5 text-white shadow-[0_20px_50px_rgba(23,63,50,.17)] sm:p-7">
              <UserProfileLink
                userId={conversation.otherUser.id}
                name={conversation.otherUser.name}
                image={conversation.otherUser.image}
                imageClassName="size-14"
                nameClassName="text-lg font-extrabold text-white"
              />
              <div className="flex flex-wrap gap-2">
                <Link to={`/profile/${conversation.otherUser.id}`} className="rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-white no-underline">مشاهدهٔ پروفایل</Link>
                <button type="button" onClick={toggleBlock} disabled={state.savingBlock || (conversation.blockedMe && !conversation.blockedByMe)} className="rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                  {state.savingBlock ? 'در حال ثبت…' : conversation.blockedByMe ? 'رفع مسدودسازی' : 'مسدودکردن'}
                </button>
              </div>
            </Card>

            <Card as="section" aria-label="پیام‌ها" variant="unstyled" className="mt-5 rounded-[24px] border border-[#e5ebe3] bg-white p-4 sm:p-6">
              <div aria-live="polite" className="grid max-h-[55vh] min-h-56 gap-3 overflow-y-auto rounded-2xl bg-[#f7f9f4] p-4">
                {!connected && <p role="status" className="m-0 rounded-xl bg-[#fff8e8] px-3 py-2 text-center text-xs text-[#876c30]">در حال اتصال به پیام‌رسان…</p>}
                {conversation.messages.length === 0 && <p className="my-auto text-center text-xs text-[#84918a]">هنوز پیامی در این گفت‌وگو نیست.</p>}
                {conversation.messages.map((item) => {
                  const isOwnMessage = String(item.senderId) === String(currentUserId)
                  return (
                    <div key={item.id} className={`flex items-end gap-2 ${isOwnMessage ? 'justify-start' : 'justify-end'}`}>
                      {!isOwnMessage && <UserProfileLink userId={item.senderId} name="" image={item.senderImage} imageClassName="size-8" />}
                      <article className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isOwnMessage ? 'bg-[#f5df62] text-[#3d3513]' : 'bg-white text-[#17352e]'}`}>
                        <UserProfileLink
                          userId={item.senderId}
                          name={item.senderName || 'کاربر'}
                          image={item.senderImage}
                          imageClassName="size-6"
                          nameClassName="text-[11px] font-bold opacity-80"
                        />
                        <p className="mb-0 mt-2 whitespace-pre-wrap break-words text-sm leading-6">{item.message}</p>
                        <time className="mt-2 block text-left text-[10px] opacity-60">{formatMessageDate(item.createdAt)}</time>
                      </article>
                      {isOwnMessage && <UserProfileLink userId={item.senderId} name="" image={item.senderImage} imageClassName="size-8" />}
                    </div>
                  )
                })}
                <div ref={messageEndRef} />
              </div>
              {blocked && <p role="status" className="mb-0 mt-4 rounded-xl bg-[#fff8e8] px-4 py-3 text-xs leading-6 text-[#876c30]">{conversation.blockedMe ? 'این کاربر شما را مسدود کرده است؛ امکان ارسال پیام ندارید.' : 'این کاربر را مسدود کرده‌اید؛ برای ارسال دوباره پیام، مسدودسازی را بردارید.'}</p>}
              {state.error && <p role="alert" className="mb-0 mt-3 text-xs text-[#a94f3d]">{state.error}</p>}
              <form onSubmit={submitMessage} className="mt-4 flex gap-2">
                <label htmlFor="direct-message-input" className="sr-only">نوشتن پیام</label>
                <input
                  id="direct-message-input"
                  value={message}
                  maxLength={2000}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={blocked || state.sending || !connected}
                  placeholder={blocked ? 'ارسال پیام غیرفعال است' : 'پیامت را بنویس…'}
                  className="min-w-0 flex-1 rounded-xl border border-[#dfe8df] px-4 py-3 text-sm outline-none focus:border-[#77955f] disabled:bg-[#f4f6f2]"
                />
                <button type="submit" disabled={blocked || state.sending || !connected || !message.trim()} className="rounded-xl bg-[#173f32] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {state.sending ? '…' : 'ارسال'}
                </button>
              </form>
            </Card>
          </>
        )}
      </div>
    </main>
  )
}

export default DirectMessagePage
