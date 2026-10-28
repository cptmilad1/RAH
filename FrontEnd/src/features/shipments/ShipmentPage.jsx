import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useAuth } from '../auth/authStore'
import CancelShipmentDialog from './components/CancelShipmentDialog'
import CreateShipmentDialog from './components/CreateShipmentDialog'
import ShipmentFilters from './components/ShipmentFilters'
import ShipmentList from './components/ShipmentList'
import ShipmentPageHeader from './components/ShipmentPageHeader'
import ShipmentSidebar from './components/ShipmentSidebar'
import ShipmentStats from './components/ShipmentStats'
import { useShipmentPage } from './hooks/useShipmentPage'

function ShipmentPage() {
  const { user, logout } = useAuth()
  const rootRef = useRef(null)
  const page = useShipmentPage()

  useEffect(() => {
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from('[data-shipment-intro]', { autoAlpha: 0, y: 22, duration: 0.65, ease: 'power3.out' })
      gsap.from('[data-shipment-card]', {
        autoAlpha: 0,
        y: 18,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.12,
      })
    }, rootRef)
    return () => context.revert()
  }, [page.filteredShipments.length, page.activeFilter, page.deferredSearch])

  function openCreateDialog() {
    page.setFormOpen(true)
    page.setFormError('')
    page.clearError()
  }

  function openCancelDialog(shipment) {
    page.setCancelTarget(shipment)
    page.setCancelError('')
    page.setCancelReason('')
  }

  return (
    <main ref={rootRef} dir="rtl" className="min-h-screen bg-[radial-gradient(ellipse_at_85%_0%,rgba(215,243,106,0.2),transparent_32%),#f5f7f1] text-[#17352e]">
      <div className="mx-auto grid min-h-screen max-w-[1480px] lg:grid-cols-[250px_minmax(0,1fr)]">
        <ShipmentSidebar user={user} logout={logout} />
        <section className="min-w-0 px-4 py-7 sm:px-8 sm:py-10 lg:px-[clamp(28px,5vw,76px)] lg:py-12">
          <ShipmentPageHeader onCreate={openCreateDialog} />
          <ShipmentStats stats={page.stats} loading={page.loading} />
          <section aria-label="فهرست مرسوله‌ها" className="overflow-hidden rounded-[24px] border border-[#e5ebe3] bg-white/90 shadow-[0_18px_52px_rgba(22,57,43,.055)]">
            <ShipmentFilters
              activeFilter={page.activeFilter}
              onFilterChange={page.setActiveFilter}
              search={page.search}
              onSearchChange={page.setSearch}
            />
            <ShipmentList
              shipments={page.filteredShipments}
              allShipments={page.shipments}
              loading={page.loading}
              error={page.error}
              onRetry={page.fetchShipments}
              onCreate={openCreateDialog}
              user={user}
              onCancel={openCancelDialog}
            />
          </section>
          <p className="mt-5 text-center text-[11px] text-[#9aa49e]">اطلاعات مرسوله‌ها فقط برای فرستنده، گیرنده و افراد مجاز نمایش داده می‌شود.</p>
        </section>
      </div>
      <CreateShipmentDialog
        open={page.formOpen}
        onClose={() => page.setFormOpen(false)}
        form={page.form}
        onChange={page.updateFormField}
        onSubmit={page.submitShipment}
        saving={page.saving}
        error={page.formError || (page.formOpen ? page.error : '')}
      />
      <CancelShipmentDialog
        shipment={page.cancelTarget}
        reason={page.cancelReason}
        error={page.cancelError}
        onReasonChange={page.setCancelReason}
        onSubmit={page.submitCancellation}
        onClose={() => page.setCancelTarget(null)}
      />
    </main>
  )
}

export default ShipmentPage
