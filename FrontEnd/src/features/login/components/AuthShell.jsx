import i18n from '../../settings/locals/i18n.js'
import GreenSide from '../pages/greenSide'
import useAuthAnimations from '../hooks/useAuthAnimations'
import AuthModeTabs from './AuthModeTabs'

function AuthShell({ heading, mode, status, children }) {
  const { rootRef, heroRef, formRef, statusRef } = useAuthAnimations(status?.message)

  return (
    <main
      ref={rootRef}
      className="grid min-h-screen bg-[#f5f7f2] text-[#17352e] lg:grid-cols-[minmax(0,1fr)_minmax(480px,0.92fr)]"
    >
      <GreenSide heroRef={heroRef} />

      <section className="relative flex min-h-[calc(100vh-270px)] items-center justify-center bg-[radial-gradient(ellipse_at_70%_3%,rgba(220,235,204,0.34),transparent_28%),#fbfcf9] px-[clamp(17px,6vw,92px)] py-9 sm:px-9 sm:py-[42px] lg:min-h-screen">
        <div ref={formRef} className="w-full max-w-[480px]">
          <div data-form-item className="mb-[22px] sm:mb-[27px]">
            <span className="mb-[11px] inline-block text-[11px] font-extrabold text-[#64836f]">{i18n.t(heading.eyebrow)}</span>
            <h2 className="m-0 text-[29px] font-black tracking-tight text-[#183b30] sm:text-[clamp(28px,3.4vw,39px)]">{i18n.t(heading.title)}</h2>
            <p className="mt-[11px] text-xs leading-[1.9] text-[#829087]">{i18n.t(heading.description)}</p>
          </div>

          {(mode === 'login' || mode === 'signup') && <AuthModeTabs mode={mode} />}

          {children}

          {status?.message && (
            <p
              ref={statusRef}
              className={`mt-[15px] rounded-xl border px-3.5 py-3 text-[11px] leading-[1.9] ${status.type === 'success' ? 'border-[#d6e9ce] bg-[#f0f7eb] text-[#426c4a]' : 'border-[#f0d5ce] bg-[#fff4f0] text-[#9d4b40]'}`}
              role="status"
            >
              {i18n.t(status.message)}
            </p>
          )}

          <p data-form-item className="mt-[25px] text-[9px] leading-[2] text-[#9aa49e]">{i18n.t("با ادامه،")}{' '}<a href="#terms" className="text-[#587b64] hover:underline">{i18n.t("شرایط استفاده")}</a>{' '}{i18n.t("و")}{' '}<a href="#privacy" className="text-[#587b64] hover:underline">{i18n.t("حریم خصوصی")}</a>{' '}{i18n.t("راه را می‌پذیرید.")}</p>
        </div>
      </section>
    </main>
  )
}

export default AuthShell
