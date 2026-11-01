import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { useAuthStore } from '../auth/authStore'
import { useAdminStore } from './adminStore'
import Card from '../../global/Card'
import Tabs from './components/Tabs'
import FindForm from './components/findForm'
import Header from './components/adminPageHeader'
import DetailsCard from './components/adminDetailsCard'
import UsersAndDriversDetails from './components/users&driverDetails'


function AdminPanelPage() {
  const rootRef = useRef(null)
  const {currentUser} = useAuthStore()
  const {users, loading, 
        updatingId, error, notice, fetchUsers, 
        setUserRole, approveDriver, rejectDriver, 
        setAccountActive} = useAdminStore()
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


  return (
    <main ref={rootRef} dir="rtl" className="min-h-screen bg-[radial-gradient(ellipse_at_84%_-8%,rgba(215,243,106,.2),transparent_34%),#f5f7f1] px-4 py-6 text-[#17352e] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-[1320px]">
        <Header fetchUsers={fetchUsers} loading={loading} filteredUsers={filteredUsers} />
        <DetailsCard users={users} />
        {error && <p role="alert" className="mb-4 rounded-xl border border-[#f0d7d0] bg-[#fff7f4] px-4 py-3 text-sm text-[#a94f3d]">{error}</p>}
        {notice && <p role="status" className="mb-4 rounded-xl border border-[#d5e8ce] bg-[#f3f8ed] px-4 py-3 text-sm text-[#416d43]">{notice}</p>}
        <Card as="section" variant="unstyled" className="overflow-hidden rounded-[22px] border border-[#e5ebe3] bg-white shadow-[0_18px_52px_rgba(22,57,43,.045)]">
          <FindForm
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            cityFilter={cityFilter}
            setCityFilter={setCityFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            submitSearch={submitSearch}
          />
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} users={users} />
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6">
            <p className="m-0 text-xs text-[#829188]">نمایش {filteredUsers.length} از {users.length} حساب</p>
            <button type="button" onClick={clearFilters} className="text-xs font-bold text-[#547460] hover:text-[#1c5942]">پاک‌کردن جست‌وجو و فیلترها</button>
          </div>
          <UsersAndDriversDetails
            loading={loading}
            currentUser={currentUser}
            updatingId={updatingId}
            filteredUsers={filteredUsers}
            setUserRole={setUserRole}
            approveDriver={approveDriver}
            rejectDriver={rejectDriver}
            setAccountActive={setAccountActive}
          />
        </Card>
      </div>
    </main>
  )
}

export default AdminPanelPage
