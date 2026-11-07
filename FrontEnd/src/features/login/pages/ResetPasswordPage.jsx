import i18n from '../../settings/locals/i18n.js'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { resetPassword } from '../../auth/authApi'
import AuthField from '../components/AuthField'
import AuthShell from '../components/AuthShell'
import AuthSubmitButton from '../components/AuthSubmitButton'
import { resetPasswordSchema } from '../schema/authSchemas'
import translateMessage from '../utils/translator'

function ResetPasswordPage() {
  const [status, setStatus] = useState(null)
  const { hash } = useLocation()
  const navigate = useNavigate()
  const token = new URLSearchParams(hash.slice(1)).get('token') || ''
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '' },
  })

  async function onSubmit({ token, password }) {
    setStatus(null)
    try {
      await resetPassword(token, password)
      navigate('/login', {
        replace: true,
        state: { notice: 'گذرواژه با موفقیت تغییر کرد؛ حالا با گذرواژهٔ جدید وارد شوید.' },
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: translateMessage(error.message, 'تغییر گذرواژه انجام نشد؛ دوباره تلاش کنید.'),
      })
    }
  }

  return (
    <AuthShell
      mode="reset"
      status={status}
      heading={{
        eyebrow: 'امنیت حساب کاربری',
        title: 'گذرواژهٔ تازه',
        description: 'کد بازیابی و گذرواژهٔ جدید را وارد کنید.',
      }}
    >
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          label={i18n.t("کد بازیابی")}
          dir="ltr"
          placeholder={i18n.t("کد بازیابی را وارد کنید")}
          registration={register('token')}
          error={i18n.t(errors.token?.message)}
        />
        <AuthField
          label={i18n.t("گذرواژهٔ جدید")}
          type="password"
          dir="ltr"
          placeholder={i18n.t("حداقل ۸ نویسه")}
          autoComplete="new-password"
          registration={register('password')}
          error={i18n.t(errors.password?.message)}
        />
        <AuthSubmitButton busy={isSubmitting}>{i18n.t("ذخیرهٔ گذرواژهٔ جدید")}</AuthSubmitButton>
      </form>
    </AuthShell>
  )
}

export default ResetPasswordPage
