import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../global/Card'
import UserProfileLink from '../../global/UserProfileLink'
import { usePresenceStore } from '../presence/presenceStore'
import { getDirectConversations } from './messagesApi'

function MessagesPage() {
  const [result, setResult] = useState({ conversations: [], loading: true, error: '' })
  const socket = usePresenceStore((state) => state.socket)
  const connected = usePresenceStore((state) => state.connected)

  const loadConversations = useCallback(() => {
    getDirectConversations()
      .then((conversations) => {
        setResult({ conversations, loading: false, error: '' })
      })
      .catch((error) => {
        setResult((current) => ({ ...current, loading: false, error: error.message || 'دریافت پیام‌ها ناموفق بود.' }))
      })
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (!socket || !connected) return undefined
    socket.on('direct:message', loadConversations)
    return () => socket.off('direct:message', loadConversations)
  }, [socket, connected, loadConversations])

  return (
    <main dir="rtl" className="min-h-screen bg-[#f5f7f1] px-4 py-8 text-[#17352e] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/dashboard" className="text-sm font-bold text-[#547460] no-underline">← بازگشت به داشبورد</Link>
        <header className="mt-7 rounded-[26px] bg-[linear-gradient(135deg,#1d5742,#10382e)] p-6 text-white shadow-[0_20px_50px_rgba(23,63,50,.17)] sm:p-9">
          <p className="m-0 text-xs text-[#b9d1c2]">گفت‌وگوهای خصوصی شما</p>
          <h1 className="mb-0 mt-2 text-3xl font-black">پیام‌ها</h1>
        </header>

        <Card as="section" aria-label="فهرست گفت‌وگوها" variant="unstyled" className="mt-5 rounded-[24px] border border-[#e5ebe3] bg-white p-4 shadow-[0_18px_52px_rgba(22,57,43,.055)] sm:p-6">
          {result.loading ? (
            <p role="status" className="py-12 text-center text-sm text-[#829188]">در حال دریافت گفت‌وگوها…</p>
          ) : result.error ? (
            <p role="alert" className="rounded-xl bg-[#fff5f2] px-4 py-3 text-sm text-[#a94f3d]">{result.error}</p>
          ) : result.conversations.length ? (
            <ul className="m-0 grid list-none gap-3 p-0">
              {result.conversations.map((conversation) => (
                <li key={conversation.userId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e9eee7] p-4">
                  <UserProfileLink
                    userId={conversation.userId}
                    name={conversation.userName}
                    image={conversation.userImage}
                    imageClassName="size-12"
                    nameClassName="truncate text-sm font-extrabold text-[#244b39]"
                  />
                  <span className="min-w-[180px] flex-1 text-xs text-[#718078]">{conversation.message}</span>
                  <Link to={`/messages/${conversation.userId}`} className="rounded-xl bg-[#174c3c] px-4 py-2.5 text-xs font-bold text-white no-underline">
                    بازکردن گفت‌وگو
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 rounded-xl bg-[#f7f9f4] px-4 py-10 text-center text-sm text-[#829188]">هنوز گفت‌وگویی ندارید. از پروفایل کاربرها پیام تازه بفرستید.</p>
          )}
        </Card>
      </div>
    </main>
  )
}

export default MessagesPage
