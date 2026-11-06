import i18n from '../../settings/locals/i18n.js'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { register as createAccount } from '../../auth/authApi'
import AuthField from '../components/AuthField'
import AuthShell from '../components/AuthShell'
import AuthSubmitButton from '../components/AuthSubmitButton'
import { signupSchema } from '../schema/authSchemas'
import translateMessage from '../utils/translator'

function SignupPage() {
  const [status, setStatus] = useState(null)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
    },
  })

  async function onSubmit(values) {
    setStatus(null)
    try {
      await createAccount(values)
      navigate('/verify-email', { replace: true, state: { email: values.email } })
    } catch (error) {
      setStatus({
        type: 'error',
        message: translateMessage(error.message, 'ساخت حساب انجام نشد؛ لطفاً دوباره تلاش کنید.'),
      })
    }
  }

  return (
    <AuthShell
      mode="signup"
      status={status}
      heading={{
        eyebrow: 'شروع یک تجربهٔ تازه',
        title: 'حساب بسازید',
        description: 'چند قدم کوتاه تا شروع مسیر شما.',
      }}
    >
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div data-form-item className="grid gap-4 sm:grid-cols-2 sm:gap-[13px]">
          <AuthField
            label={i18n.t("نام و نام خانوادگی")}
            placeholder={i18n.t("مثلاً سارا محمدی")}
            autoComplete="name"
            registration={register('full_name')}
            error={i18n.t(errors.full_name?.message)}
          />
          <AuthField
            label={i18n.t("نام کاربری")}
            dir="ltr"
            placeholder={i18n.t("نام کاربری")}
            autoComplete="username"
            registration={register('username')}
            error={i18n.t(errors.username?.message)}
          />
        </div>
        <AuthField
          label={i18n.t("نشانی ایمیل")}
          type="email"
          dir="ltr"
          placeholder="name@example.com"
          autoComplete="email"
          registration={register('email')}
          error={i18n.t(errors.email?.message)}
        />
        <AuthField
          label={<span>{i18n.t("شمارهٔ تماس")}{' '}<small className="mr-1 text-[9px] font-medium text-[#9ba79f]">{i18n.t("اختیاری")}</small></span>}
          type="tel"
          dir="ltr"
          placeholder="+93 700 000 000"
          autoComplete="tel"
          registration={register('phone')}
          error={i18n.t(errors.phone?.message)}
        />
        <AuthField
          label={i18n.t("گذرواژه")}
          type="password"
          dir="ltr"
          placeholder={i18n.t("حداقل ۸ نویسه")}
          autoComplete="new-password"
          registration={register('password')}
          error={i18n.t(errors.password?.message)}
        />
        <AuthSubmitButton busy={isSubmitting}>{i18n.t("ساخت حساب کاربری")}</AuthSubmitButton>
      </form>
    </AuthShell>
  )
}

export default SignupPage
