import i18n from '../settings/locals/i18n.js'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useAuth } from '../auth/authStore'
import CancelShipmentDialog from './components/CancelShipmentDialog'
import CreateShipmentDialog from './components/CreateShipmentDialog'
import ShipmentPageHeader from './components/ShipmentPageHeader'
import ShipmentStats from './components/ShipmentStats'
import { useShipmentPage } from './hooks/useShipmentPage'
import ShipmentCards from './components/shipmentsCard'

function ShipmentPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const rootRef = useRef(null)
  const page = useShipmentPage()

  useEffect(() => {
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo('[data-shipment-intro]',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' },
      )
      gsap.fromTo('[data-shipment-card]',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          delay: 0.12,
        },
      )
    }, rootRef)
    return () => context.revert()
  }, [page.filteredShipments.length, page.activeFilter, page.deferredSearch])

  function openCreateDialog() {
    page.setFormOpen(true)
    page.setFormError('')
    page.clearError()
  }

  

  return (
    <main ref={rootRef} dir="rtl" className="min-h-screen bg-[radial-gradient(ellipse_at_85%_0%,rgba(215,243,106,0.2),transparent_32%),#f5f7f1] text-[#17352e]">
      <div className="mx-auto grid min-h-screen max-w-[1480px] lg:grid-cols-[250px_minmax(0,1fr)]">
        <section className="min-w-0 px-4 py-7 sm:px-8 sm:py-10 lg:px-[clamp(28px,5vw,76px)] lg:py-12">
          <ShipmentPageHeader onCreate={openCreateDialog} onTrack={(code) => navigate(`/shipments/${encodeURIComponent(code)}`)} />
          <ShipmentStats stats={page.stats} loading={page.loading} />
          <ShipmentCards user={user} openCreateDialog={openCreateDialog} />
          <p className="mt-5 text-center text-[11px] text-[#9aa49e]">{i18n.t("اطلاعات مرسوله‌ها فقط برای فرستنده، گیرنده و افراد مجاز نمایش داده می‌شود.")}</p>
        </section>
      </div>
      <CreateShipmentDialog
        open={page.formOpen}
        onClose={() => page.setFormOpen(false)}
        form={page.form}
        onChange={page.updateFormField}
        onSubmit={page.submitShipment}
        saving={page.saving}
        error={i18n.t(page.formError || (page.formOpen ? page.error : ''))}
      />
      <CancelShipmentDialog
        shipment={page.cancelTarget}
        reason={page.cancelReason}
        error={i18n.t(page.cancelError)}
        onReasonChange={page.setCancelReason}
        onSubmit={page.submitCancellation}
        onClose={() => page.setCancelTarget(null)}
      />
    </main>
  )
}

export default ShipmentPage
