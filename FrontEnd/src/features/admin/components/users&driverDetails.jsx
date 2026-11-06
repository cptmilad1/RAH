import i18n from '../../settings/locals/i18n.js'
import AdminUserCard from "./AdminUserCard"

function UsersAndDriversDetails({loading, currentUser, updatingId, filteredUsers, setUserRole, approveDriver, rejectDriver, setAccountActive }) {
    return (
        <section aria-label={i18n.t("فهرست کاربران")} className="grid gap-3 p-4 sm:p-6">
            {loading ? <p role="status" className="py-12 text-center text-sm text-[#829188]">{i18n.t("در حال دریافت کاربران…")}</p>
              : filteredUsers.length ? filteredUsers.map((user) => <div data-admin-user key={user.id}>
                <AdminUserCard
                  user={user}
                  updating={updatingId === user.id}
                  isCurrentUser={String(currentUser?.id) === String(user.id)}
                  onSetRole={setUserRole}
                  onApprove={approveDriver}
                  onReject={rejectDriver}
                  onSetActive={setAccountActive}
                />
              </div>)
                : <div className="py-12 text-center">
                  <p className="mb-1 text-sm font-bold text-[#4c6858]">{i18n.t("نتیجه‌ای پیدا نشد")}</p>
                  <p className="m-0 text-xs text-[#89958e]">{i18n.t("عبارت جست‌وجو یا فیلترها را تغییر دهید.")}</p>
                </div>}
          </section>
    )
}
export default UsersAndDriversDetails