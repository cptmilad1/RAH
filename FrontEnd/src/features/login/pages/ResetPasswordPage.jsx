import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../auth/authApi'
import AuthField from '../components/AuthField'
import AuthShell from '../components/AuthShell'
import AuthSubmitButton from '../components/AuthSubmitButton'
import { resetPasswordSchema } from '../authSchemas'
import translateMessage from '../utils/translator'

function ResetPasswordPage() {
  const [status, setStatus] = useState(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: searchParams.get('token') || '', password: '' },
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
          label="کد بازیابی"
          dir="ltr"
          placeholder="کد بازیابی را وارد کنید"
          registration={register('token')}
          error={errors.token?.message}
        />
        <AuthField
          label="گذرواژهٔ جدید"
          type="password"
          dir="ltr"
          placeholder="حداقل ۸ نویسه"
          autoComplete="new-password"
          registration={register('password')}
          error={errors.password?.message}
        />
        <AuthSubmitButton busy={isSubmitting}>ذخیرهٔ گذرواژهٔ جدید</AuthSubmitButton>
      </form>
    </AuthShell>
  )
}

export default ResetPasswordPage
