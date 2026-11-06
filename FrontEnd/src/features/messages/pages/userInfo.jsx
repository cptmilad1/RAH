import i18n from '../../settings/locals/i18n.js'
import Card from "../../../global/Card"

function UserInfoMsgBox({ conversation, toggleBlock, state }) {
    return(
        <Card as="header" variant="unstyled" className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-[26px] bg-[linear-gradient(135deg,#1d5742,#10382e)] p-5 text-white shadow-[0_20px_50px_rgba(23,63,50,.17)] sm:p-7">
              <div className="inline-flex min-w-0 items-center gap-2">
                <img
                  src={conversation.otherUser.image || '/imgs/default-avatar.svg'}
                  alt=""
                  className="size-14 shrink-0 rounded-full bg-[#e7efd9] object-cover"
                />
                <span className="text-lg font-extrabold text-white">{conversation.otherUser.name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={toggleBlock} disabled={state.savingBlock || (conversation.blockedMe && !conversation.blockedByMe)} className="rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                  {i18n.t(state.savingBlock ? 'در حال ثبت…' : conversation.blockedByMe ? 'رفع مسدودسازی' : 'مسدودکردن')}
                </button>
              </div>
            </Card>
    )
}
export default UserInfoMsgBox