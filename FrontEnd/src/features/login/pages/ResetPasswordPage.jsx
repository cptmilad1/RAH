import { localizeText } from '../../settings/locals/localizedText.js'
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
      status={localizeText(status)}
      heading={localizeText({
        eyebrow: 'امنیت حساب کاربری',
        title: 'گذرواژهٔ تازه',
        description: 'کد بازیابی و گذرواژهٔ جدید را وارد کنید.',
      })}
    >
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          label={localizeText("کد بازیابی")}
          dir="ltr"
          placeholder={localizeText("کد بازیابی را وارد کنید")}
          registration={register('token')}
          error={localizeText(errors.token?.message)}
        />
        <AuthField
          label={localizeText("گذرواژهٔ جدید")}
          type="password"
          dir="ltr"
          placeholder={localizeText("حداقل ۸ نویسه")}
          autoComplete="new-password"
          registration={register('password')}
          error={localizeText(errors.password?.message)}
        />
        <AuthSubmitButton busy={isSubmitting}>{localizeText("ذخیرهٔ گذرواژهٔ جدید")}</AuthSubmitButton>
      </form>
    </AuthShell>
  )
}

export default ResetPasswordPage
