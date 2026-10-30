import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePresenceStore } from '../presence/presenceStore'
import { getInboxMessages } from './dashboardInboxApi'

function formatMessageDate(value) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function InboxPage() {
  const socket = usePresenceStore((state) => state.socket)
  const connected = usePresenceStore((state) => state.connected)
  const [result, setResult] = useState({ messages: [], loading: true, error: '' })

  const loadMessages = useCallback(async () => {
    try {
      const messages = await getInboxMessages()
      setResult({ messages, loading: false, error: '' })
    } catch (error) {
      setResult((current) => ({
        ...current,
        loading: false,
        error: error.message || 'دریافت صندوق ورودی ناموفق بود.',
      }))
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadMessages)
  }, [loadMessages])

  useEffect(() => {
    if (!socket || !connected) return undefined
    socket.on('inbox:updated', loadMessages)
    return () => socket.off('inbox:updated', loadMessages)
  }, [socket, connected, loadMessages])

  return (
    <main dir="rtl" className="min-h-screen bg-[#f5f7f1] px-4 py-8 text-[#17352e] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/dashboard" className="text-sm font-bold text-[#547460] no-underline">← بازگشت به داشبورد</Link>
        <header className="mt-7 rounded-[26px] bg-[linear-gradient(135deg,#1d5742,#10382e)] p-6 text-white shadow-[0_20px_50px_rgba(23,63,50,.17)] sm:p-9">
          <p className="m-0 text-xs text-[#b9d1c2]">پیام‌هایی که از دیگران دریافت کرده‌اید</p>
          <h1 className="mb-2 mt-2 text-3xl font-black">صندوق ورودی</h1>
          <p className="m-0 text-sm text-[#d3e2d7]">{connected ? 'پیام‌های تازه به‌صورت زنده نمایش داده می‌شوند.' : 'برای دیدن پیام‌های تازه صفحه را تازه‌سازی کنید.'}</p>
        </header>

        <section aria-label="فهرست پیام‌های دریافتی" className="mt-5 rounded-[24px] border border-[#e5ebe3] bg-white p-4 shadow-[0_18px_52px_rgba(22,57,43,.055)] sm:p-6">
          {result.error && (
            <div role="alert" className="rounded-xl border border-[#f1d4ce] bg-[#fff5f2] px-4 py-3 text-sm text-[#a94f3d]">
              {result.error}
              <button type="button" onClick={loadMessages} className="mr-3 font-bold underline">تلاش دوباره</button>
            </div>
          )}
          {result.loading ? (
            <p role="status" className="py-12 text-center text-sm text-[#829188]">در حال دریافت پیام‌ها…</p>
          ) : result.messages.length ? (
            <ul className="m-0 grid list-none gap-3 p-0">
              {result.messages.map((item) => (
                <li key={`${item.id}-${item.trackingCode}`}>
                  <Link
                    to={`/inbox/${encodeURIComponent(item.trackingCode)}`}
                    className="grid gap-3 rounded-2xl border border-[#e9eee7] p-4 text-inherit no-underline transition hover:border-[#d3e2ca] hover:bg-[#fbfcf8] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <strong className="text-sm font-extrabold text-[#244b39]">{item.senderName || 'کاربر'}</strong>
                        <span className="text-xs text-[#74857b]">مرسوله: <bdi dir="ltr" className="font-mono font-bold">{item.trackingCode}</bdi></span>
                      </span>
                      <span className="mt-2 block truncate text-sm text-[#5f7268]">{item.message}</span>
                    </span>
                    <time className="text-[11px] text-[#8c9991]">{formatMessageDate(item.createdAt)}</time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : !result.error ? (
            <p className="m-0 rounded-xl bg-[#f7f9f4] px-4 py-10 text-center text-sm text-[#829188]">هنوز پیامی دریافت نکرده‌اید.</p>
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default InboxPage
