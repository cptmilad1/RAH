import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../auth/authStore'
import { useAdminStore } from './adminStore'
import AdminUserCard from './components/AdminUserCard'
import MetricCard from '../../global/MetricCard'
import Card from '../../global/Card'

const tabs = [
  { id: 'all', label: 'همه', count: (users) => users.length },
  { id: 'pending', label: 'درخواست‌های رانندگی', count: (users) => users.filter((user) => user.driverStatus === 'pending').length },
  { id: 'drivers', label: 'رانندگان', count: (users) => users.filter((user) => user.role === 'driver').length },
  { id: 'users', label: 'کاربران عادی', count: (users) => users.filter((user) => user.role === 'user' && !user.driverStatus).length },
  { id: 'admins', label: 'مدیران', count: (users) => users.filter((user) => user.role === 'admin').length },
  { id: 'rejected', label: 'درخواست‌های ردشده', count: (users) => users.filter((user) => user.driverStatus === 'rejected').length },
  { id: 'inactive', label: 'حساب‌های غیرفعال', count: (users) => users.filter((user) => !user.isActive).length },
]

function exportUsers(users) {
  const columns = [
    ['fullName', 'نام'],
    ['username', 'نام کاربری'],
    ['email', 'ایمیل'],
    ['phone', 'شماره تماس'],
    ['role', 'نقش'],
    ['driverProvince', 'ولایت'],
    ['driverStatus', 'وضعیت درخواست رانندگی'],
    ['createdAt', 'تاریخ عضویت'],
    ['isActive', 'حساب فعال'],
  ]
  const escapeCell = (value) => {
    const text = String(value ?? '')
    const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
    return `"${safeText.replaceAll('"', '""')}"`
  }
  const csv = [
    columns.map(([, label]) => escapeCell(label)).join(','),
    ...users.map((user) => columns.map(([key]) => escapeCell(user[key])).join(',')),
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
  const download = document.createElement('a')
  download.href = url
  download.download = 'rah-admin-users.csv'
  download.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function AdminPanelPage() {
  const rootRef = useRef(null)
  const currentUser = useAuthStore((state) => state.user)
  const users = useAdminStore((state) => state.users)
  const loading = useAdminStore((state) => state.loading)
  const updatingId = useAdminStore((state) => state.updatingId)
  const error = useAdminStore((state) => state.error)
  const notice = useAdminStore((state) => state.notice)
  const fetchUsers = useAdminStore((state) => state.fetchUsers)
  const setUserRole = useAdminStore((state) => state.setUserRole)
  const approveDriver = useAdminStore((state) => state.approveDriver)
  const rejectDriver = useAdminStore((state) => state.rejectDriver)
  const setAccountActive = useAdminStore((state) => state.setAccountActive)
  const [activeTab, setActiveTab] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filteredUsers = useMemo(() => {
    const query = activeSearch.trim().toLocaleLowerCase()
    const cityQuery = cityFilter.trim().toLocaleLowerCase()
    const filtered = users.filter((user) => {
      const matchesQuery = !query || [
        user.fullName, user.username, user.email, user.phone, user.plateNumber, user.licenseNumber,
      ].some((value) => String(value || '').toLocaleLowerCase().includes(query))
      const searchableLocation = `${user.driverProvince || ''} ${user.city || ''} ${user.address || ''}`.toLocaleLowerCase()
      const matchesCity = !cityQuery || searchableLocation.includes(cityQuery)
      const recordDate = user.driverAppliedAt || user.createdAt
      const matchesDate = !dateFilter || String(recordDate || '').slice(0, 10) === dateFilter
      const matchesTab = activeTab === 'all'
        || (activeTab === 'pending' && user.driverStatus === 'pending')
        || (activeTab === 'drivers' && user.role === 'driver')
        || (activeTab === 'users' && user.role === 'user' && !user.driverStatus)
        || (activeTab === 'admins' && user.role === 'admin')
        || (activeTab === 'rejected' && user.driverStatus === 'rejected')
        || (activeTab === 'inactive' && !user.isActive)
      return matchesQuery && matchesCity && matchesDate && matchesTab
    })

    return filtered.sort((left, right) => {
      if (sortOrder === 'name-asc') return (left.fullName || '').localeCompare(right.fullName || '', 'fa')
      const leftDate = new Date(left.driverAppliedAt || left.createdAt || 0).getTime()
      const rightDate = new Date(right.driverAppliedAt || right.createdAt || 0).getTime()
      return sortOrder === 'oldest' ? leftDate - rightDate : rightDate - leftDate
    })
  }, [users, activeSearch, cityFilter, dateFilter, activeTab, sortOrder])

  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      gsap.fromTo('[data-admin-header]',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' },
      )
      gsap.fromTo('[data-admin-stat]',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out' },
      )
      gsap.fromTo('[data-admin-user]',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.035, ease: 'power2.out' },
      )
    }, root)
    return () => context.revert()
  }, [filteredUsers.length, loading])

  function submitSearch(event) {
    event.preventDefault()
    setActiveSearch(searchInput)
  }

  function clearFilters() {
    setSearchInput('')
    setActiveSearch('')
    setCityFilter('')
    setDateFilter('')
    setActiveTab('all')
    setSortOrder('newest')
  }

  const stats = [
    { label: 'همهٔ حساب‌ها', value: users.length, icon: '◉', tone: 'bg-[#f0f4eb] text-[#547460]' },
    { label: 'درخواست‌های بررسی‌نشده', value: users.filter((user) => user.driverStatus === 'pending').length, icon: '◷', tone: 'bg-[#fbf6df] text-[#897c3e]' },
    { label: 'رانندگان تأییدشده', value: users.filter((user) => user.role === 'driver' && user.driverStatus === 'approved').length, icon: '⇢', tone: 'bg-[#eaf5e5] text-[#4c8046]' },
    { label: 'مدیران', value: users.filter((user) => user.role === 'admin').length, icon: '⚙', tone: 'bg-[#edf0fb] text-[#5b6594]' },
  ]

  return (
    <main ref={rootRef} dir="rtl" className="min-h-screen bg-[radial-gradient(ellipse_at_84%_-8%,rgba(215,243,106,.2),transparent_34%),#f5f7f1] px-4 py-6 text-[#17352e] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-[1320px]">
        <header data-admin-header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/dashboard" className="text-xs font-bold text-[#658071] no-underline">← بازگشت به داشبورد</Link>
            <p className="mb-2 mt-5 text-xs font-bold text-[#789083]">مدیریت سامانه</p>
            <h1 className="m-0 text-2xl font-black text-[#163a30] sm:text-3xl">پنل ادمین</h1>
            <p className="mb-0 mt-2 text-sm text-[#7b8c82]">مدیریت کاربران، درخواست‌های رانندگی و وضعیت حساب‌ها</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={fetchUsers} disabled={loading} className="min-h-11 rounded-xl border border-[#dce6dc] bg-white px-4 text-xs font-bold text-[#315946] disabled:opacity-60">↻ تازه‌سازی فهرست</button>
            <button type="button" onClick={() => exportUsers(filteredUsers)} disabled={!filteredUsers.length} className="min-h-11 rounded-xl bg-[#174c3c] px-4 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">↓ خروجی CSV</button>
          </div>
        </header>

        <section aria-label="آمار سامانه" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => <MetricCard data-admin-stat key={stat.label} layout="header" label={stat.label} value={stat.value} icon={stat.icon} iconClassName={stat.tone} />)}
        </section>

        {error && <p role="alert" className="mb-4 rounded-xl border border-[#f0d7d0] bg-[#fff7f4] px-4 py-3 text-sm text-[#a94f3d]">{error}</p>}
        {notice && <p role="status" className="mb-4 rounded-xl border border-[#d5e8ce] bg-[#f3f8ed] px-4 py-3 text-sm text-[#416d43]">{notice}</p>}

        <Card as="section" variant="unstyled" className="overflow-hidden rounded-[22px] border border-[#e5ebe3] bg-white shadow-[0_18px_52px_rgba(22,57,43,.045)]">
          <div className="border-b border-[#edf0eb] p-4 sm:p-6">
            <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
              <label className="min-w-0 flex-1">
                <span className="sr-only">جست‌وجو در کاربران</span>
                <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="min-h-12 w-full rounded-xl border border-[#dfe7dd] bg-[#fbfcf9] px-4 text-sm outline-none transition focus:border-[#9dbb87] focus:ring-4 focus:ring-[#82aa85]/[0.12]" placeholder="جست‌وجو با نام، ایمیل، شماره تماس، نام کاربری یا پلیت…" />
              </label>
              <button type="submit" className="min-h-12 rounded-xl bg-[#174c3c] px-7 text-sm font-extrabold text-white transition hover:bg-[#103b30]">جست‌وجو</button>
            </form>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1.5 text-[11px] font-bold text-[#66776d]">فیلتر شهر یا ولایت
                <input value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} className="min-h-10 rounded-xl border border-[#e2e8de] bg-white px-3 text-sm font-normal" placeholder="نام شهر یا ولایت" />
              </label>
              <label className="grid gap-1.5 text-[11px] font-bold text-[#66776d]">تاریخ عضویت یا درخواست
                <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="min-h-10 rounded-xl border border-[#e2e8de] bg-white px-3 text-sm font-normal" />
              </label>
              <label className="grid gap-1.5 text-[11px] font-bold text-[#66776d]">ترتیب نمایش
                <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="min-h-10 rounded-xl border border-[#e2e8de] bg-white px-3 text-sm font-normal">
                  <option value="newest">جدیدترین ابتدا</option>
                  <option value="oldest">قدیمی‌ترین ابتدا</option>
                  <option value="name-asc">نام (الف تا ی)</option>
                </select>
              </label>
            </div>
          </div>

          <div role="tablist" aria-label="دسته‌بندی کاربران" className="flex gap-2 overflow-x-auto border-b border-[#edf0eb] px-4 py-3 sm:px-6">
            {tabs.map((tab) => <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${activeTab === tab.id ? 'bg-[#eaf2df] text-[#315946]' : 'text-[#829188] hover:bg-[#f7f9f4] hover:text-[#315946]'}`}
            >
              {tab.label}<span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px]">{tab.count(users)}</span>
            </button>)}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6">
            <p className="m-0 text-xs text-[#829188]">نمایش {filteredUsers.length} از {users.length} حساب</p>
            <button type="button" onClick={clearFilters} className="text-xs font-bold text-[#547460] hover:text-[#1c5942]">پاک‌کردن جست‌وجو و فیلترها</button>
          </div>

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
        </Card>
      </div>
    </main>
  )
}

export default AdminPanelPage
