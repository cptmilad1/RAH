import { Link } from "react-router-dom"
import Card from "../../../global/Card"
import UserProfileLink from "../../../global/UserProfileLink"

function UserInfoMsgBox({ conversation, toggleBlock, state }) {
    return(
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
    )
}
export default UserInfoMsgBox