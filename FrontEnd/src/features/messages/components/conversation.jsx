import formatMessageDate from './formatData&time'

const Conversation = ({ conversation, currentUserId, connected, messageEndRef }) => {
    return (
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
    )
}
export default Conversation