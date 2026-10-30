import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../auth/authStore'
import { afghanistanProvinces } from '../shipments/shipmentConstants'
import { useDriverApplicationStore } from './driverApplicationStore'
import { driverApplicationSchema } from './driverApplicationSchema'
import DriverApplicationField from './components/DriverApplicationField'
import Card from '../../global/Card'

const initialValues = {
  province: '',
  licenseNumber: '',
  licenseExpiry: '',
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: new Date().getFullYear(),
  vehicleColor: '',
  plateNumber: '',
}

function DriverApplicationPage() {
  const application = useDriverApplicationStore((state) => state.application)
  const loading = useDriverApplicationStore((state) => state.loading)
  const saving = useDriverApplicationStore((state) => state.saving)
  const error = useDriverApplicationStore((state) => state.error)
  const notice = useDriverApplicationStore((state) => state.notice)
  const fetchApplication = useDriverApplicationStore((state) => state.fetchApplication)
  const submitApplication = useDriverApplicationStore((state) => state.submitApplication)
  const refreshSession = useAuthStore((state) => state.refreshSession)
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(driverApplicationSchema),
    defaultValues: initialValues,
  })

  useEffect(() => { fetchApplication() }, [fetchApplication])

  useEffect(() => {
    if (application && application.status === 'rejected') {
      reset({ ...initialValues, ...application })
    }
  }, [application, reset])

  useEffect(() => {
    if (application?.status === 'approved') refreshSession()
  }, [application?.status, refreshSession])

  async function onSubmit(values) {
    const submitted = await submitApplication(values)
    if (submitted) reset(values)
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[radial-gradient(ellipse_at_84%_-8%,rgba(215,243,106,.2),transparent_34%),#f5f7f1] px-4 py-8 text-[#17352e] sm:px-8 sm:py-12">
      <Card as="section" variant="unstyled" className="mx-auto max-w-3xl rounded-[24px] border border-[#e5ebe3] bg-white p-5 shadow-[0_18px_52px_rgba(22,57,43,.055)] sm:p-8">
        <Link to="/dashboard" className="text-xs font-bold text-[#658071] no-underline">← بازگشت به داشبورد</Link>
        <p className="mb-2 mt-7 text-xs font-bold text-[#789083]">درخواست همکاری</p>
        <h1 className="m-0 text-2xl font-black text-[#163a30]">ثبت‌نام به‌عنوان راننده</h1>
        <p className="mb-0 mt-2 text-sm leading-7 text-[#7b8c82]">مشخصات جواز و موتر را وارد کنید. پس از بررسی و تأیید مدیر، پنل راننده برای شما فعال می‌شود.</p>

        {loading ? (
          <p role="status" className="py-12 text-center text-sm text-[#829188]">در حال دریافت وضعیت درخواست…</p>
        ) : application?.status === 'pending' ? (
          <div role="status" className="mt-7 rounded-2xl border border-[#e9e4c4] bg-[#fbf9ed] p-5 text-sm leading-7 text-[#776d3a]">
            درخواست شما ثبت شده و در انتظار بررسی مدیر است.
            <p className="mb-0 mt-2 text-xs">موتر: {application.vehicleMake} {application.vehicleModel} · پلیت: {application.plateNumber}</p>
          </div>
        ) : application?.status === 'approved' ? (
          <div role="status" className="mt-7 rounded-2xl border border-[#d5e8ce] bg-[#f3f8ed] p-5 text-sm text-[#416d43]">
            درخواست شما تأیید شده است. <Link to="/driver" className="font-bold text-[#315946]">رفتن به پنل راننده ←</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 grid gap-5">
            {application?.status === 'rejected' && <p className="m-0 rounded-xl bg-[#fff7f4] p-3 text-sm text-[#a94f3d]">درخواست پیشین تأیید نشد. مشخصات را اصلاح و دوباره ارسال کنید.</p>}
            <label className="grid gap-2 text-xs font-bold text-[#66776d]">ولایت کاری
              <select {...register('province')} className="min-h-11 rounded-xl border border-[#e2e8de] bg-white px-3 text-sm font-normal text-[#17352e]">
                <option value="">انتخاب ولایت</option>
                {afghanistanProvinces.map((province) => <option key={province} value={province}>{province}</option>)}
              </select>
              {errors.province && <span className="font-normal text-[#a94f3d]">{errors.province.message}</span>}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <DriverApplicationField label="شمارهٔ جواز رانندگی" {...register('licenseNumber')} error={errors.licenseNumber?.message} />
              <DriverApplicationField label="تاریخ اعتبار جواز" type="date" {...register('licenseExpiry')} error={errors.licenseExpiry?.message} />
              <DriverApplicationField label="شرکت سازندهٔ موتر" placeholder="مثلاً تویوتا" {...register('vehicleMake')} error={errors.vehicleMake?.message} />
              <DriverApplicationField label="مدل موتر" placeholder="مثلاً کرولا" {...register('vehicleModel')} error={errors.vehicleModel?.message} />
              <DriverApplicationField label="سال ساخت موتر" type="number" min="1900" max={new Date().getFullYear() + 1} {...register('vehicleYear')} error={errors.vehicleYear?.message} />
              <DriverApplicationField label="رنگ موتر" {...register('vehicleColor')} error={errors.vehicleColor?.message} />
              <DriverApplicationField label="نمبر پلیت" {...register('plateNumber')} error={errors.plateNumber?.message} />
            </div>
            {error && <p role="alert" className="m-0 rounded-xl border border-[#f0d7d0] bg-[#fff7f4] px-4 py-3 text-sm text-[#a94f3d]">{error}</p>}
            {notice && <p role="status" className="m-0 rounded-xl border border-[#d5e8ce] bg-[#f3f8ed] px-4 py-3 text-sm text-[#416d43]">{notice}</p>}
            <button type="submit" disabled={saving} className="min-h-12 rounded-xl bg-[#174c3c] px-5 text-sm font-extrabold text-white transition hover:bg-[#103b30] disabled:cursor-wait disabled:opacity-60">
              {saving ? 'در حال ارسال…' : 'ارسال درخواست برای تأیید'}
            </button>
          </form>
        )}
        {error && !application && <p role="alert" className="mt-5 text-sm text-[#a94f3d]">{error}</p>}
        {notice && application?.status === 'pending' && <p role="status" className="mt-5 text-sm text-[#416d43]">{notice}</p>}
      </Card>
    </main>
  )
}

export default DriverApplicationPage
