import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../auth/authStore'
import { useDriverParcelsStore } from './driverParcelsStore'
import { useDriverParcels } from './hooks/useDriverParcels'

function DriverPanelPage() {
  const user = useAuthStore((state) => state.user)
  const acceptParcel = useDriverParcelsStore((state) => state.acceptParcel)
  const clearMessages = useDriverParcelsStore((state) => state.clearMessages)
  const { control, register, reset } = useForm({ defaultValues: { search: '' } })
  const search = useWatch({ control, name: 'search' })
  const { parcels, province, loading, acceptingCode, error, notice, fetchParcels } = useDriverParcels(search || '')

  async function handleAccept(trackingCode) {
    clearMessages()
    const accepted = await acceptParcel(trackingCode)
    if (!accepted) fetchParcels()
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[radial-gradient(ellipse_at_84%_-8%,rgba(215,243,106,.2),transparent_34%),#f5f7f1] px-4 py-6 text-[#17352e] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-[1120px]">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/dashboard" className="text-xs font-bold text-[#658071] no-underline">← بازگشت به داشبورد</Link>
            <p className="mb-2 mt-6 text-xs font-bold text-[#789083]">ناحیهٔ کاری: {province || 'هنوز تنظیم نشده'}</p>
            <h1 className="m-0 text-2xl font-black text-[#163a30] sm:text-3xl">پنل راننده</h1>
            <p className="mb-0 mt-2 text-sm text-[#7b8c82]">مرسوله‌های آزاد ولایت خود را بررسی و قبول کنید، {user?.name || 'راننده'}.</p>
          </div>
          <Link to={`/profile/${user?.id}/edit`} className="rounded-xl border border-[#dce6dc] bg-white px-4 py-3 text-xs font-bold text-[#315946] no-underline transition hover:bg-[#f8faf5]">تنظیم پروفایل</Link>
        </header>

        <section className="border-y border-[#dfe8df] py-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[11px] text-[#86948c]">بازار مرسوله</span>
              <h2 className="mb-0 mt-1 text-lg font-extrabold">مرسوله‌های قابل قبول</h2>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <label className="min-w-0 flex-1 sm:w-[280px]">
                <span className="sr-only">جست‌وجوی مرسوله</span>
                <input {...register('search')} type="search" placeholder="جست‌وجو در کد، شهر یا فرستنده" className="min-h-11 w-full rounded-xl border border-[#e0e8df] bg-white px-3 text-xs outline-none transition focus:border-[#9dbb87] focus:ring-4 focus:ring-[#82aa85]/[0.12]" />
              </label>
              <button type="button" onClick={() => { reset(); fetchParcels() }} aria-label="پاک‌کردن جست‌وجو و تازه‌سازی" title="تازه‌سازی فهرست" className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#e0e8df] bg-white text-lg text-[#496b58] transition hover:bg-[#f6f9f2]">↻</button>
            </div>
          </div>
        </section>

        {error && <p role="alert" className="mb-0 mt-5 rounded-xl border border-[#f0d7d0] bg-[#fff7f4] px-4 py-3 text-sm text-[#a94f3d]">{error}</p>}
        {notice && <p role="status" className="mb-0 mt-5 rounded-xl border border-[#d5e8ce] bg-[#f3f8ed] px-4 py-3 text-sm text-[#416d43]">{notice}</p>}

        {loading ? (
          <p role="status" className="py-16 text-center text-sm text-[#829188]">در حال دریافت مرسوله‌های ولایت {province || 'شما'}…</p>
        ) : parcels.length ? (
          <div className="divide-y divide-[#e7ece5]">
            {parcels.map((parcel) => (
              <article key={parcel.trackingCode} className="grid gap-5 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <strong dir="ltr" className="font-mono text-sm text-[#244b39]">{parcel.trackingCode}</strong>
                    <span className="text-xs text-[#8c9991]">{parcel.senderName || 'فرستنده'}</span>
                    <span className="text-xs text-[#8c9991]">{parcel.weightKg ? `${parcel.weightKg} کیلوگرم` : 'وزن ثبت نشده'}</span>
                  </div>
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <p className="m-0"><span className="ml-2 text-xs text-[#8b9990]">مبدأ</span><strong>{parcel.pickupCity}، {parcel.pickupProvince}</strong></p>
                    <p className="m-0"><span className="ml-2 text-xs text-[#8b9990]">مقصد</span><strong>{parcel.deliveryCity}، {parcel.deliveryProvince || 'ولایت نامشخص'}</strong></p>
                  </div>
                  {parcel.description && <p className="mb-0 mt-3 max-w-3xl text-xs leading-6 text-[#76877d]">{parcel.description}</p>}
                </div>
                <button type="button" disabled={Boolean(acceptingCode)} onClick={() => handleAccept(parcel.trackingCode)} className="min-h-11 rounded-xl bg-[#174c3c] px-5 text-xs font-extrabold text-white transition hover:bg-[#103b30] disabled:cursor-wait disabled:opacity-60">
                  {acceptingCode === parcel.trackingCode ? 'در حال ثبت…' : 'قبول مرسوله'}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="mb-2 text-base font-bold text-[#4c6858]">مرسولهٔ آزادی پیدا نشد</p>
            <p className="m-0 text-sm text-[#89958e]">با ثبت مرسولهٔ تازه در ولایت شما، این فهرست به‌روز می‌شود.</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default DriverPanelPage