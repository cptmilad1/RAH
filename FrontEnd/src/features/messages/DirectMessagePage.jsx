import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../auth/authStore'
import { usePresenceStore } from '../presence/presenceStore'
import { getDirectConversation } from './api/messagesApi'
import MsgStatus from './components/msgStatus'

function DirectMessagePage() {
  const { userId } = useParams()
  const [state, setState] = useState({ loading: true, error: '', sending: false, savingBlock: false })
  const currentUserId = useAuthStore((state) => state.user?.id)
  const socket = usePresenceStore((state) => state.socket)
  const connected = usePresenceStore((state) => state.connected)
  const [conversation, setConversation] = useState(null)

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


  return (
    <main dir="rtl" className="min-h-screen bg-[#f5f7f1] px-4 py-8 text-[#17352e] sm:px-8 sm:py-12">
      <MsgStatus
        conversation={conversation}
        state={state}
        currentUserId={currentUserId}
        connected={connected}
        socket={socket}
        userId={userId}
        setState={setState}
        setConversation={setConversation}
        messageEndRef={messageEndRef}
      />
    </main>
  )
}

export default DirectMessagePage
