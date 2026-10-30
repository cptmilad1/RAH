import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import gsap from 'gsap'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../auth/authStore'
import useProfile from './hooks/UseProfile'
import { driverProfileEditSchema, profileEditSchema } from './profileEditSchema'
import { afghanistanProvinces } from '../shipments/shipmentConstants'
import Card from '../../global/Card'

const fields = [
  { name: 'full_name', label: 'نام کامل', autoComplete: 'name', maxLength: 100 },
  { name: 'username', label: 'نام کاربری', dir: 'ltr', autoComplete: 'username', maxLength: 50 },
  { name: 'phone', label: 'شماره تماس', dir: 'ltr', type: 'tel', autoComplete: 'tel', maxLength: 30 },
  { name: 'user_address', label: 'نشانی', autoComplete: 'street-address', maxLength: 500 },
]

function ProfileEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const panelRef = useRef(null)
  const currentUser = useAuthStore((state) => state.user)
  const setUsers = useProfile((state) => state.setUsers)
  const updateUser = useProfile((state) => state.updateUser)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const canEdit = currentUser?.role === 'admin' || String(currentUser?.id) === String(id)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(currentUser?.role === 'driver' ? driverProfileEditSchema : profileEditSchema),
    defaultValues: { full_name: '', username: '', phone: '', user_address: '', driver_province: '' },
  })

  useEffect(() => {
    if (!canEdit) return undefined

    let isCurrent = true

    async function loadProfile() {
      setLoading(true)
      setLoadError('')
      try {
        const profile = await setUsers(id)
        if (isCurrent) {
          reset({
            full_name: profile.name || '',
            username: profile.username || '',
            phone: profile.phone || '',
            user_address: profile.address || '',
            driver_province: profile.driverProvince || '',
          })
        }
      } catch {
        if (isCurrent) setLoadError('بارگذاری اطلاعات پروفایل انجام نشد. دوباره تلاش کنید.')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      isCurrent = false
    }
  }, [canEdit, id, reset, setUsers])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      gsap.fromTo('[data-edit-panel]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' })
    }, panel)

    return () => context.revert()
  }, [])

  if (!canEdit) return <Navigate to={currentUser?.id ? `/profile/${currentUser.id}` : '/dashboard'} replace />

  async function onSubmit(values) {
    try {
      await updateUser(id, values)
      navigate(`/profile/${id}`, { replace: true, state: { notice: 'اطلاعات پروفایل ذخیره شد.' } })
    } catch (error) {
      setError('root.server', {
        message: error.message || 'ذخیرهٔ تغییرات انجام نشد. دوباره تلاش کنید.',
      })
    }
  }

  return (
    <main ref={panelRef} className="min-h-screen bg-[radial-gradient(ellipse_at_76%_-12%,rgba(215,243,106,0.18),transparent_34%),#f6f7f2] px-4 py-5 text-[#17352e] sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-[760px]">
        <header className="mb-5 flex items-center justify-between sm:mb-7">
          <Link to={`/profile/${id}`} className="group inline-flex items-center gap-2 text-xs font-bold text-[#587366] transition hover:text-[#17352e]">
            <span className="grid size-9 place-items-center rounded-xl border border-[#e0e8dc] bg-white text-base transition group-hover:-translate-x-0.5" aria-hidden="true">→</span>
            بازگشت به پروفایل
          </Link>
          <span className="flex items-center gap-2 text-sm font-black text-[#234a39]">
            <span className="grid size-8 place-items-center rounded-[11px] bg-[#d7f36a] text-base text-[#17352e]">ر</span>
            راه
          </span>
        </header>

        <Card as="section" data-edit-panel variant="unstyled" className="overflow-hidden rounded-[20px] border border-[#e5ebe2] bg-white/[0.92] shadow-[0_18px_50px_rgba(22,57,43,0.07)]">
          <div className="bg-[linear-gradient(115deg,#123e32,#1c5942)] px-5 py-6 text-white sm:px-8 sm:py-7">
            <p className="mb-2 text-[10px] font-bold text-[#d8e8bc]">حساب کاربری</p>
            <h1 className="m-0 text-2xl font-extrabold text-[#f4f7ef]">ویرایش پروفایل</h1>
            <p className="mt-2 text-xs leading-6 text-[#c0d4c7]">اطلاعات تماس و مشخصات نمایه را به‌روز کنید.</p>
          </div>

          <div className="p-5 sm:p-8">
            {loading ? (
              <p className="m-0 py-8 text-center text-sm text-[#829087]" role="status">در حال دریافت اطلاعات...</p>
            ) : loadError ? (
              <div className="rounded-xl border border-[#f0d5ce] bg-[#fff4f0] px-4 py-3 text-sm text-[#9d4b40]" role="alert">{loadError}</div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  {currentUser?.role === 'driver' && (
                    <label className="grid min-w-0 gap-2 text-[11px] font-bold text-[#385247]">
                      <span>ولایت کاری راننده</span>
                      <select {...register('driver_province')} required className="min-h-12 w-full rounded-xl border border-[#e1e8e0] bg-[#fbfcf9] px-3.5 text-xs text-[#244738] focus:border-[#8eae91] focus:outline-none focus:ring-4 focus:ring-[#82aa85]/[0.12]">
                        <option value="">انتخاب ولایت</option>
                        {afghanistanProvinces.map((province) => <option key={province} value={province}>{province}</option>)}
                      </select>
                      {errors.driver_province && <small className="text-[10px] font-medium text-[#9d4b40]">{errors.driver_province.message}</small>}
                    </label>
                  )}
                  {fields.map((field) => {
                    const error = errors[field.name]
                    return (
                      <label key={field.name} className={`grid min-w-0 gap-2 text-[11px] font-bold text-[#385247] ${field.name === 'user_address' ? 'sm:col-span-2' : ''}`}>
                        <span>{field.label}</span>
                        {field.name === 'user_address' ? (
                          <textarea
                            {...register(field.name)}
                            autoComplete={field.autoComplete}
                            maxLength={field.maxLength}
                            rows={3}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? `${field.name}-error` : undefined}
                            className="w-full resize-y rounded-xl border border-[#e1e8e0] bg-[#fbfcf9] px-3.5 py-3 text-xs leading-6 text-[#244738] transition placeholder:text-[#a8b2ac] focus:border-[#8eae91] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#82aa85]/[0.12]"
                          />
                        ) : (
                          <input
                            {...register(field.name)}
                            type={field.type || 'text'}
                            dir={field.dir}
                            autoComplete={field.autoComplete}
                            maxLength={field.maxLength}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? `${field.name}-error` : undefined}
                            className="min-h-12 w-full rounded-xl border border-[#e1e8e0] bg-[#fbfcf9] px-3.5 text-xs text-[#244738] transition placeholder:text-[#a8b2ac] focus:border-[#8eae91] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#82aa85]/[0.12]"
                          />
                        )}
                        {error && <small id={`${field.name}-error`} className="text-[10px] font-medium text-[#9d4b40]">{error.message}</small>}
                      </label>
                    )
                  })}
                </div>

                {errors.root?.server && (
                  <p className="m-0 rounded-xl border border-[#f0d5ce] bg-[#fff4f0] px-4 py-3 text-[11px] leading-6 text-[#9d4b40]" role="alert">
                    {errors.root.server.message}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-[#edf0eb] pt-5 sm:flex-row sm:justify-end">
                  <Link to={`/profile/${id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#e1e8e0] px-5 text-xs font-bold text-[#587366] transition hover:bg-[#f6f8f3]">
                    انصراف
                  </Link>
                  <button type="submit" disabled={isSubmitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#174c3c] px-5 text-xs font-extrabold text-white transition hover:bg-[#103b30] disabled:cursor-wait disabled:opacity-60">
                    {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}

export default ProfileEditPage