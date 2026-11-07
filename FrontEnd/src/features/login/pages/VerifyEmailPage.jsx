import i18n from '../../settings/locals/i18n.js'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../../auth/authApi'
import AuthField from '../components/AuthField'
import AuthShell from '../components/AuthShell'
import AuthSubmitButton from '../components/AuthSubmitButton'
import { verificationSchema } from '../schema/authSchemas'
import translateMessage from '../utils/translator'

function VerifyEmailPage() {
  const [status, setStatus] = useState(null)
  const email = useLocation().state?.email
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: searchParams.get('code') || '' },
  })

  async function onSubmit({ code }) {
    setStatus(null)
    try {
      const result = await verifyEmail(code)
      navigate('/login', {
        replace: true,
        state: {
          notice: translateMessage(result.message, 'ایمیل شما تأیید شد؛ حالا می‌توانید وارد شوید.'),
        },
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: translateMessage(error.message, 'تأیید ایمیل انجام نشد؛ کد را بررسی و دوباره تلاش کنید.'),
      })
    }
  }

  return (
    <AuthShell
      mode="verify"
      status={status}
      heading={{
        eyebrow: 'فقط یک قدم مانده',
        title: 'تأیید ایمیل',
        description: email
          ? i18n.t('VerifyEmailPrompt {{email}}', { email })
          : 'کد ارسال‌شده به ایمیلتان را وارد کنید تا حساب شما فعال شود.',
      }}
    >
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          label={i18n.t("کد تأیید")}
          dir="ltr"
          type="text"
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]{6}"
          placeholder={i18n.t("کد ۶ رقمی")}
          autoComplete="one-time-code"
          registration={register('code')}
          error={i18n.t(errors.code?.message)}
        />
        <AuthSubmitButton busy={isSubmitting}>{i18n.t("تأیید و فعال‌سازی حساب")}</AuthSubmitButton>
      </form>
      <p data-form-item className="mt-[17px] text-center text-[10px] text-[#829087]">{i18n.t("هنوز حساب نساخته‌اید؟")}{' '}<Link to="/signup" className="font-bold text-[#326249] hover:underline">{i18n.t("ثبت‌نام")}</Link>
      </p>
    </AuthShell>
  )
}

export default VerifyEmailPage
