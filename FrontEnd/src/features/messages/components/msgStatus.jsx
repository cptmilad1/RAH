import { useEffect } from "react"
import { Link } from "react-router-dom"

function MsgStatus({conversation, toggleBlock, state}) {
    
    useEffect(() => {
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
    })
    return (
        <div className="mx-auto max-w-3xl">
            <Link to="/messages" className="text-sm font-bold text-[#547460] no-underline">← بازگشت به پیام‌ها</Link>
            {state.loading ? (
                <p role="status" className="mt-10 text-sm text-[#829188]">در حال بازکردن گفت‌وگو…</p>
            ) : state.error && !conversation ? (
                <p role="alert" className="mt-8 rounded-2xl bg-white p-6 text-sm text-[#a94f3d]">{state.error}</p>
            ) : conversation && (
                <>
                    <UserInfoMsgBox conversation={conversation} toggleBlock={toggleBlock} state={state} />
                    <MsgSection conversation={conversation} currentUserId={currentUserId} connected={connected} messageEndRef={messageEndRef} state={state} />
                </>
            )}
        </div>
    )
}
export default MsgStatus