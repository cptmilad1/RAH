import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../auth/authApi'
import { useAuthStore } from '../../auth/authStore'
import AuthField from '../components/AuthField'
import AuthShell from '../components/AuthShell'
import AuthSubmitButton from '../components/AuthSubmitButton'
import { loginSchema } from '../authSchemas'
import translateMessage from '../utils/translator'

function LoginPage() {
  const location = useLocation()
  const [status, setStatus] = useState(() => (
    location.state?.notice ? { type: 'success', message: location.state.notice } : null
  ))
  const [isForgotBusy, setIsForgotBusy] = useState(false)
  const navigate = useNavigate()
  const loginUser = useAuthStore((state) => state.login)
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values) {
    setStatus(null)
    try {
      await loginUser(values)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setStatus({
        type: 'error',
        message: translateMessage(error.message, 'ورود انجام نشد؛ لطفاً دوباره تلاش کنید.'),
      })
    }
  }

  async function onForgotPassword() {
    const validEmail = await trigger('email')
    if (!validEmail) return

    setIsForgotBusy(true)
    setStatus(null)
    try {
      const result = await forgotPassword(getValues('email'))
      setStatus({
        type: 'success',
        message: translateMessage(result.message, 'اگر این حساب وجود داشته باشد، پیوند بازیابی برای آن ارسال شده است.'),
      })
      if (result.resetToken) {
        navigate(`/reset-password?token=${encodeURIComponent(result.resetToken)}`, { replace: true })
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: translateMessage(error.message, 'ارسال پیوند بازیابی انجام نشد؛ دوباره تلاش کنید.'),
      })
    } finally {
      setIsForgotBusy(false)
    }
  }

  return (
    <AuthShell
      mode="login"
      status={status}
      heading={{
        eyebrow: 'خوش برگشتید',
        title: 'ورود به حساب',
        description: 'برای ادامهٔ مسیر، وارد حساب خود شوید.',
      }}
    >
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          label="نشانی ایمیل"
          type="email"
          dir="ltr"
          placeholder="name@example.com"
          autoComplete="email"
          registration={register('email')}
          error={errors.email?.message}
        />
        <AuthField
          label="گذرواژه"
          type="password"
          dir="ltr"
          placeholder="گذرواژهٔ خود را وارد کنید"
          autoComplete="current-password"
          registration={register('password')}
          error={errors.password?.message}
        />

        <div data-form-item className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-[7px] text-[9px] text-[#94a098]">
            <i className="size-1.5 rounded-full bg-[#84ac75]" /> ارتباط شما امن است
          </span>
          <button
            type="button"
            disabled={isSubmitting || isForgotBusy}
            onClick={onForgotPassword}
            className="py-[3px] text-[10px] font-extrabold text-[#326249] transition hover:text-[#163d2e] hover:underline disabled:opacity-50"
          >
            گذرواژه را فراموش کرده‌اید؟
          </button>
        </div>

        <AuthSubmitButton busy={isSubmitting}>ورود به حساب</AuthSubmitButton>
      </form>

      <p data-form-item className="mt-4 text-center text-[11px] text-[#829087]">
        حساب را تأیید نکرده‌اید؟ <Link to="/verify-email" className="font-bold text-[#326249] hover:underline">تأیید ایمیل</Link>
      </p>
    </AuthShell>
  )
}

export default LoginPage
