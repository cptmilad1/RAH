import i18n from '../../settings/locals/i18n.js'
import formatMessageDate from './formatData&time'

const Conversation = ({ conversation, currentUserId, connected, messageEndRef }) => {
    return (
        <div aria-live="polite" className="grid max-h-[55vh] min-h-56 gap-3 overflow-y-auto rounded-2xl bg-[#f7f9f4] p-4">
                {!connected && <p role="status" className="m-0 rounded-xl bg-[#fff8e8] px-3 py-2 text-center text-xs text-[#876c30]">{i18n.t("در حال اتصال به پیام‌رسان…")}</p>}
                {conversation.messages.length === 0 && <p className="my-auto text-center text-xs text-[#84918a]">{i18n.t("هنوز پیامی در این گفت‌وگو نیست.")}</p>}
                {conversation.messages.map((item) => {
                  const isOwnMessage = String(item.senderId) === String(currentUserId)
                  return (
                    <div key={item.id} className={`flex items-end gap-2 ${isOwnMessage ? 'justify-start' : 'justify-end'}`}>
                      {!isOwnMessage && <img src={item.senderImage || '/imgs/default-avatar.svg'} alt="" className="size-8 shrink-0 rounded-full bg-[#e7efd9] object-cover" />}
                      <article className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isOwnMessage ? 'bg-[#f5df62] text-[#3d3513]' : 'bg-white text-[#17352e]'}`}>
                        <span className="text-[11px] font-bold opacity-80">{item.senderName || i18n.t('کاربر')}</span>
                        <p className="mb-0 mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6">{item.message}</p>
                        <time className="mt-2 block text-left text-[10px] opacity-60">{formatMessageDate(item.createdAt)}</time>
                      </article>
                      {isOwnMessage && <img src={item.senderImage || '/imgs/default-avatar.svg'} alt="" className="size-8 shrink-0 rounded-full bg-[#e7efd9] object-cover" />}
                    </div>
                  )
                })}
                <div ref={messageEndRef} />
              </div>
    )
}
export default Conversation