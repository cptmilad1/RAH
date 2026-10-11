import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { forgotPassword, login, register, resetPassword, verifyEmail } from '../auth/authApi'

const initialValues = {
	full_name: '',
	username: '',
	email: '',
	phone: '',
	password: '',
}

function AuthPage({ initialMode = 'login' }) {
	const [searchParams] = useSearchParams()
	const [mode, setMode] = useState(initialMode)
	const [values, setValues] = useState(initialValues)
	const [status, setStatus] = useState({ type: '', message: '' })
	const [verificationToken, setVerificationToken] = useState(searchParams.get('token') || '')
	const [resetToken, setResetToken] = useState(searchParams.get('token') || '')
	const [busy, setBusy] = useState(false)
	const navigate = useNavigate()
	const isSignup = mode === 'signup'
	const isReset = mode === 'reset'
	const isVerify = mode === 'verify'

	function updateField(event) {
		setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
	}

	function switchMode(nextMode) {
		setMode(nextMode)
		setStatus({ type: '', message: '' })
		setVerificationToken('')
		navigate(nextMode === 'signup' ? '/signup' : '/login', { replace: true })
	}

	async function handleSubmit(event) {
		event.preventDefault()
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
		if (!values.email) {
			setStatus({ type: 'error', message: 'Enter your email address first.' })
			return
		}
		setBusy(true)
		try {
			const result = await forgotPassword(values.email)
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
		<main className="auth-shell">
			<section className="brand-panel" aria-label="Rah">
				<div className="brand-topline"><span className="brand-mark">R</span><span>RAH / ACCOUNT</span></div>
				<div className="brand-copy">
					<p className="eyebrow">YOUR CITY, IN MOTION</p>
					<h1>Every journey<br />starts somewhere.</h1>
					<p className="brand-description">One account for the rides, deliveries, and moments that move your day.</p>
				</div>
				<div className="route-art" aria-hidden="true">
					<div className="route-line" />
					<span className="route-point route-point-start" />
					<span className="route-point route-point-end" />
					<span className="route-label route-label-start">HOME</span>
					<span className="route-label route-label-end">NEXT</span>
					<div className="route-stamp"><span>R</span><small>MOVE<br />WITH EASE</small></div>
				</div>
				<div className="brand-footer"><span>RAH MOBILITY</span><span>01 — 03</span></div>
			</section>

			<section className="form-panel">
				<header className="mobile-brand"><span className="brand-mark">R</span><span>RAH</span></header>
				<div className="form-wrap">
					<div className="form-heading">
						<p className="eyebrow">{isSignup ? 'A BETTER WAY TO GET THERE' : isReset ? 'ACCOUNT SECURITY' : isVerify ? 'ONE QUICK CHECK' : 'GOOD TO SEE YOU AGAIN'}</p>
						<h2>{isSignup ? 'Create your account' : isReset ? 'Choose a new password' : isVerify ? 'Verify your email' : 'Welcome back'}</h2>
						<p>{isSignup ? 'Start with the details you use every day.' : isReset ? 'Use a secure password you have not used before.' : isVerify ? 'Confirm your email address to activate your account.' : 'Sign in to pick up where you left off.'}</p>
					</div>

					{!isReset && !isVerify && <div className="mode-switch" role="tablist" aria-label="Account access">
						<button type="button" role="tab" aria-selected={!isSignup} className={!isSignup ? 'active' : ''} onClick={() => switchMode('login')}>Sign in</button>
						<button type="button" role="tab" aria-selected={isSignup} className={isSignup ? 'active' : ''} onClick={() => switchMode('signup')}>Create account</button>
					</div>}

					<form className="auth-form" onSubmit={handleSubmit}>
						{isVerify ? (
							<label className="field">
								<span>Verification token</span>
								<input value={verificationToken} onChange={(event) => setVerificationToken(event.target.value)} required />
							</label>
						) : <>
						{isSignup && (
							<div className="field-row">
								{!isReset && <label className="field">
									<span>Full name</span>
									<input autoComplete="name" name="full_name" value={values.full_name} onChange={updateField} placeholder="Your name" minLength="2" maxLength="100" required />
								</label>}
								<label className="field">
									<span>Username</span>
									<input autoComplete="username" name="username" value={values.username} onChange={updateField} placeholder="yourname" minLength="3" maxLength="50" pattern="[A-Za-z0-9_]+" required />
								</label>
							</div>
						)}
						<label className="field">
							<span>Email address</span>
							<input autoComplete="email" type="email" name="email" value={values.email} onChange={updateField} placeholder="you@example.com" required />
						</label>
						{isSignup && (
							<label className="field">
								<span>Phone <small>Optional</small></span>
								<input autoComplete="tel" type="tel" name="phone" value={values.phone} onChange={updateField} placeholder="+93 700 000 000" />
							</label>
						)}
						{isReset && <label className="field">
							<span>Reset token</span>
							<input value={resetToken} onChange={(event) => setResetToken(event.target.value)} required />
						</label>}
						{!isVerify && <label className="field">
							<span>{isReset ? 'New password' : 'Password'}</span>
							<input autoComplete={isSignup ? 'new-password' : 'current-password'} type="password" name="password" value={values.password} onChange={updateField} placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'} minLength="8" maxLength="72" required />
						</label>}
						{!isSignup && !isReset && <div className="form-utility"><span>Protected with secure sign-in</span><button type="button" disabled={busy} onClick={handleForgotPassword}>Forgot password?</button></div>}
						</>}
						{!isVerify && <button className="submit-button" type="submit" disabled={busy}>
							<span>{busy ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}</span>
							<span className="button-arrow" aria-hidden="true">↗</span>
						</button>}
					</form>

					{isVerify && <button className="submit-button verify-submit" type="button" disabled={busy} onClick={handleVerify}><span>{busy ? 'Please wait...' : 'Verify email'}</span><span className="button-arrow" aria-hidden="true">↗</span></button>}

					{status.message && <p className={`status-message ${status.type}`} role="status">{status.message}</p>}
					  {!isVerify && verificationToken && (
						<div className="verify-box">
							<label className="field">
								<span>Development verification token</span>
								<input value={verificationToken} readOnly />
							</label>
							<button className="text-button" type="button" disabled={busy} onClick={handleVerify}>Verify email</button>
						</div>
					)}
					  {(isReset || isVerify) && <button className="text-button back-to-login" type="button" onClick={() => { setMode('login'); navigate('/login', { replace: true }) }}>Back to sign in</button>}
					<p className="legal-note">By continuing, you agree to Rah's terms of service and privacy policy.</p>
				</div>
				<footer className="form-footer"><span>© 2026 Rah Mobility</span><span>Built for the way you move.</span></footer>
			</section>
		</main>
	)
}

export default AuthPage
