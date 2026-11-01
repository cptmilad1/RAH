import Card from "../../../global/Card"
import Conversation from "../components/conversation"
import MessageDataForm from "../components/msgSenterForm"

function MsgSection({connected, conversation, currentUserId, messageEndRef, state}) {
    const blocked = conversation?.blockedByMe || conversation?.blockedMe
    return (
        <Card as="section" aria-label="پیام‌ها" variant="unstyled" className="mt-5 rounded-[24px] border border-[#e5ebe3] bg-white p-4 sm:p-6">
              <Conversation conversation={conversation} currentUserId={currentUserId} connected={connected} messageEndRef={messageEndRef} />
              {blocked && <p role="status" className="mb-0 mt-4 rounded-xl bg-[#fff8e8] px-4 py-3 text-xs leading-6 text-[#876c30]">{conversation.blockedMe ? 'این کاربر شما را مسدود کرده است؛ امکان ارسال پیام ندارید.' : 'این کاربر را مسدود کرده‌اید؛ برای ارسال دوباره پیام، مسدودسازی را بردارید.'}</p>}
              {state.error && <p role="alert" className="mb-0 mt-3 text-xs text-[#a94f3d]">{state.error}</p>}
              <MessageDataForm blocked={blocked} state={state} connected={connected} />
        </Card>
    )
}
export default MsgSection