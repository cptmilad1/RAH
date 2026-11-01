import AdminUserCard from "./AdminUserCard"

function UsersAndDriversDetails({loading, currentUser, updatingId, filteredUsers, setUserRole, approveDriver, rejectDriver, setAccountActive }) {
    return (
        <section aria-label="فهرست کاربران" className="grid gap-3 p-4 sm:p-6">
            {loading ? <p role="status" className="py-12 text-center text-sm text-[#829188]">در حال دریافت کاربران…</p>
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
                  <p className="mb-1 text-sm font-bold text-[#4c6858]">نتیجه‌ای پیدا نشد</p>
                  <p className="m-0 text-xs text-[#89958e]">عبارت جست‌وجو یا فیلترها را تغییر دهید.</p>
                </div>}
          </section>
    )
}
export default UsersAndDriversDetails