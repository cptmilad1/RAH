import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { forgotPassword, login, register, resetPassword, verifyEmail } from '../auth/authApi'

const defaultValues = {
  full_name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
}

function AuthPage({ initialMode = 'login' }) {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(initialMode)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [verificationToken, setVerificationToken] = useState(searchParams.get('token') || '')
  const [resetToken, setResetToken] = useState(searchParams.get('token') || '')
  const [busy, setBusy] = useState(false)

  const navigate = useNavigate()
  const isSignup = mode === 'signup'
  const isReset = mode === 'reset'
  const isVerify = mode === 'verify'

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues })

  function switchMode(nextMode) {
    setMode(nextMode)
    setStatus({ type: '', message: '' })
    setVerificationToken('')
    reset(defaultValues)
    navigate(nextMode === 'signup' ? '/signup' : '/login', { replace: true })
  }

  async function onSubmit(values) {
    setBusy(true)
    setStatus({ type: '', message: '' })

    try {
      if (isSignup) {
        const result = await register({
          full_name: values.full_name,
          username: values.username,
          email: values.email,
          phone: values.phone,
          password: values.password,
        })
        setVerificationToken(result.verificationToken || '')
        setStatus({ type: 'success', message: result.message || 'Your account has been created.' })
      } else if (isReset) {
        const result = await resetPassword(resetToken, values.password)
        setStatus({ type: 'success', message: result.message || 'Password updated. Sign in with your new password.' })
        setMode('login')
        navigate('/login', { replace: true })
      } else {
        const result = await login({ email: values.email, password: values.password })
        setStatus({ type: 'success', message: `Welcome back${result.data?.name ? `, ${result.data.name}` : ''}.` })
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setBusy(false)
    }
  }

  async function handleVerify() {
    setBusy(true)
    try {
      const result = await verifyEmail(verificationToken)
      setStatus({ type: 'success', message: result.message || 'Email verified. You can now sign in.' })
      setVerificationToken('')
      setMode('login')
      navigate('/login', { replace: true })
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setBusy(false)
    }
  }

  async function handleForgotPassword() {
    const email = document.querySelector('input[name="email"]')?.value

    if (!email) {
      setStatus({ type: 'error', message: 'Enter your email address first.' })
      return
    }

    setBusy(true)
    try {
      const result = await forgotPassword(email)
      setStatus({ type: 'success', message: result.message })

      if (result.resetToken) {
        setResetToken(result.resetToken)
        setMode('reset')
        navigate(`/reset-password?token=${encodeURIComponent(result.resetToken)}`, { replace: true })
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen grid md:grid-cols-[1.1fr_1.2fr] bg-[#f3f1eb] text-[#202722]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#29463b] p-8 text-[#f5f5ed] md:flex md:flex-col md:justify-between">
        <div className="relative z-10 flex items-center gap-3 text-[11px] font-bold tracking-[0.18em] uppercase">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d7f05b] text-[20px] font-bold text-[#202722]">R</span>
          <span>RAH / Account</span>
        </div>

        <div className="relative z-10 max-w-xl">
          <p className="mb-4 text-[10px] font-extrabold tracking-[0.22em] text-[#98aa97] uppercase">Your city, in motion</p>
          <h1 className="font-serif text-6xl leading-none text-[#f9f8f2]">Every journey starts somewhere.</h1>
          <p className="mt-6 max-w-xs text-sm leading-7 text-[#c8d2c7]">One account for rides, deliveries, and moments that move your day.</p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[9px] font-bold tracking-[0.18em] text-[#afc0b1] uppercase">
          <span>Rah Mobility</span>
          <span>01 — 03</span>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center bg-[#fbfaf6] px-5 py-8 md:px-10">
        <div className="w-full max-w-xl">
          <div className="mb-7 flex items-center gap-3 text-[#202722] md:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#29463b] text-[18px] font-bold text-[#d7f05b]">R</span>
            <span className="text-sm font-bold tracking-[0.18em] uppercase">Rah</span>
          </div>

          <div className="mb-8 space-y-3">
            <p className="text-[10px] font-extrabold tracking-[0.22em] text-[#687d6f] uppercase">
              {isSignup ? 'A better way to get there' : isReset ? 'Account security' : isVerify ? 'One quick check' : 'Good to see you again'}
            </p>
            <h2 className="font-serif text-4xl text-[#202722] md:text-5xl">
              {isSignup ? 'Create your account' : isReset ? 'Choose a new password' : isVerify ? 'Verify your email' : 'Welcome back'}
            </h2>
            <p className="text-sm text-[#666d67]">
              {isSignup ? 'Start with the details you use every day.' : isReset ? 'Use a secure password you have not used before.' : isVerify ? 'Confirm your email address to activate your account.' : 'Sign in to pick up where you left off.'}
            </p>
          </div>

          {!isReset && !isVerify && (
            <div className="mb-6 grid grid-cols-2 rounded-md bg-[#edf0ea] p-1" role="tablist" aria-label="Account access">
              <button type="button" role="tab" aria-selected={!isSignup} className={`rounded-sm px-3 py-2 text-xs font-bold transition ${!isSignup ? 'bg-white text-[#202722] shadow-sm' : 'text-[#667169]'}`} onClick={() => switchMode('login')}>Sign in</button>
              <button type="button" role="tab" aria-selected={isSignup} className={`rounded-sm px-3 py-2 text-xs font-bold transition ${isSignup ? 'bg-white text-[#202722] shadow-sm' : 'text-[#667169]'}`} onClick={() => switchMode('signup')}>Create account</button>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {isVerify ? (
              <label className="block space-y-2 text-[11px] font-bold tracking-[0.05em] text-[#333b36] uppercase">
                <span>Verification token</span>
                <input value={verificationToken} onChange={(event) => setVerificationToken(event.target.value)} required className="w-full rounded-md border border-[#dfe2da] bg-white px-3 py-3 text-sm text-[#202722] outline-none transition focus:border-[#67806e] focus:ring-3 focus:ring-[#d7f05b]/20" />
              </label>
            ) : (
              <>
                {isSignup && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-2 text-[11px] font-bold tracking-[0.05em] text-[#333b36] uppercase">
                      <span>Full name</span>
                      <input {...formRegister('full_name', { required: 'Full name is required', minLength: { value: 2, message: 'Too short' } })} className="w-full rounded-md border border-[#dfe2da] bg-white px-3 py-3 text-sm text-[#202722] outline-none transition focus:border-[#67806e] focus:ring-3 focus:ring-[#d7f05b]/20" placeholder="Your name" />
                    </label>

                    <label className="block space-y-2 text-[11px] font-bold tracking-[0.05em] text-[#333b36] uppercase">
                      <span>Username</span>
                      <input {...formRegister('username', { required: 'Username is required', minLength: { value: 3, message: 'At least 3 chars' } })} className="w-full rounded-md border border-[#dfe2da] bg-white px-3 py-3 text-sm text-[#202722] outline-none transition focus:border-[#67806e] focus:ring-3 focus:ring-[#d7f05b]/20" placeholder="yourname" />
                    </label>
                  </div>
                )}

                <label className="block space-y-2 text-[11px] font-bold tracking-[0.05em] text-[#333b36] uppercase">
                  <span>Email address</span>
                  <input {...formRegister('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} type="email" className="w-full rounded-md border border-[#dfe2da] bg-white px-3 py-3 text-sm text-[#202722] outline-none transition focus:border-[#67806e] focus:ring-3 focus:ring-[#d7f05b]/20" placeholder="you@example.com" />
                </label>

                {isSignup && (
                  <label className="block space-y-2 text-[11px] font-bold tracking-[0.05em] text-[#333b36] uppercase">
                    <span>Phone</span>
                    <input {...formRegister('phone')} className="w-full rounded-md border border-[#dfe2da] bg-white px-3 py-3 text-sm text-[#202722] outline-none transition focus:border-[#67806e] focus:ring-3 focus:ring-[#d7f05b]/20" placeholder="+93 700 000 000" />
                  </label>
                )}

                {isReset && (
                  <label className="block space-y-2 text-[11px] font-bold tracking-[0.05em] text-[#333b36] uppercase">
                    <span>Reset token</span>
                    <input value={resetToken} onChange={(event) => setResetToken(event.target.value)} required className="w-full rounded-md border border-[#dfe2da] bg-white px-3 py-3 text-sm text-[#202722] outline-none transition focus:border-[#67806e] focus:ring-3 focus:ring-[#d7f05b]/20" />
                  </label>
                )}

                {!isVerify && (
                  <label className="block space-y-2 text-[11px] font-bold tracking-[0.05em] text-[#333b36] uppercase">
                    <span>{isReset ? 'New password' : 'Password'}</span>
                    <input {...formRegister('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })} type="password" className="w-full rounded-md border border-[#dfe2da] bg-white px-3 py-3 text-sm text-[#202722] outline-none transition focus:border-[#67806e] focus:ring-3 focus:ring-[#d7f05b]/20" placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'} />
                  </label>
                )}

                {!isSignup && !isReset && (
                  <div className="flex items-center justify-between text-[10px] font-medium text-[#717a72]">
                    <span>Protected with secure sign-in</span>
                    <button type="button" disabled={busy} onClick={handleForgotPassword} className="font-bold text-[#315a45] transition hover:underline disabled:opacity-60">Forgot password?</button>
                  </div>
                )}
              </>
            )}

            {!isVerify && (
              <button type="submit" disabled={busy} className="flex w-full items-center justify-between rounded-md bg-[#29463b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1d382e] disabled:opacity-70">
                <span>{busy ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}</span>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#d7f05b] text-base text-[#202722]">↗</span>
              </button>
            )}
          </form>

          {isVerify && (
            <button type="button" disabled={busy} onClick={handleVerify} className="mt-4 flex w-full items-center justify-between rounded-md bg-[#29463b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1d382e] disabled:opacity-70">
              <span>{busy ? 'Please wait...' : 'Verify email'}</span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#d7f05b] text-base text-[#202722]">↗</span>
            </button>
          )}

          {Object.values(errors).length > 0 && (
            <div className="mt-4 rounded-md border border-[#f0d5d0] bg-[#fbefeb] p-3 text-xs text-[#8a3d36]">
              {Object.values(errors)[0]?.message}
            </div>
          )}

          {status.message && (
            <p className={`mt-4 rounded-md border p-3 text-xs ${status.type === 'success' ? 'border-[#cfe5ce] bg-[#edf5e9] text-[#315a45]' : 'border-[#efc9c2] bg-[#fbefeb] text-[#8a3d36]'}`} role="status">
              {status.message}
            </p>
          )}

          {!isVerify && verificationToken && (
            <div className="mt-4 rounded-md border border-[#dfe2da] bg-white p-3">
              <label className="block space-y-2 text-[11px] font-bold tracking-[0.05em] text-[#333b36] uppercase">
                <span>Development verification token</span>
                <input value={verificationToken} readOnly className="w-full rounded-md border border-[#dfe2da] bg-[#f8faf7] px-3 py-2 text-sm text-[#202722]" />
              </label>
              <button type="button" onClick={handleVerify} disabled={busy} className="mt-3 text-xs font-bold text-[#315a45] transition hover:underline disabled:opacity-60">Verify email</button>
            </div>
          )}

          {(isReset || isVerify) && (
            <button type="button" onClick={() => { setMode('login'); navigate('/login', { replace: true }) }} className="mt-4 text-xs font-bold text-[#315a45] underline-offset-2 transition hover:underline">Back to sign in</button>
          )}

          <p className="mt-6 text-[10px] leading-6 text-[#929790]">By continuing, you agree to Rah's terms of service and privacy policy.</p>
        </div>
      </section>
    </main>
  )
}

export default AuthPage
