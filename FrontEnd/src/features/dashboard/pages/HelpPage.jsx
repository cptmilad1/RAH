import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoChatbubbleEllipsesOutline,
  IoCheckmarkCircleOutline,
  IoHelpCircleOutline,
  IoPeopleOutline,
  IoSparklesOutline,
} from 'react-icons/io5'
import Card from '../../../global/Card'

const guides = [
  { title: 'راهنمای پیگیری مرسوله', description: 'از صفحهٔ مرسوله‌ها، وضعیت و جزئیات ارسال را ببینید.', to: '/shipments', icon: IoCheckmarkCircleOutline },
  { title: 'پیام‌های مربوط به مرسوله', description: 'پیام‌های دریافتی و گفت‌وگوهای ارسال را در صندوق ورودی دنبال کنید.', to: '/inbox', icon: IoChatbubbleEllipsesOutline },
  { title: 'تنظیمات و حساب کاربری', description: 'اطلاعات حساب، زبان و ظاهر برنامه را مدیریت کنید.', to: '/settings', icon: IoPeopleOutline },
]

function HelpPage() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'
  const ContinueIcon = isRtl ? IoArrowBackOutline : IoArrowForwardOutline

  return (
    <main className="min-h-screen bg-[var(--app-page-bg)] px-4 py-6 text-[var(--app-ink)] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#1d5742,#10382e)] p-6 text-white shadow-[0_20px_50px_rgba(23,63,50,.14)] sm:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute -end-10 -top-20 size-64 rounded-full border border-white/10 shadow-[0_0_0_24px_rgba(255,255,255,.025),0_0_0_48px_rgba(255,255,255,.02)]" />
          <div className="relative max-w-2xl">
            <span className="mb-5 inline-grid size-12 place-items-center rounded-2xl border border-white/15 bg-white/10 text-2xl text-[#d7f36a]">
              <IoHelpCircleOutline aria-hidden="true" />
            </span>
            <p className="mb-2 text-xs font-bold tracking-wide text-[#d7f36a]">{t('help.eyebrow')}</p>
            <h1 className="m-0 text-3xl font-black sm:text-4xl">{t('help.title')}</h1>
            <p className="mb-0 mt-3 max-w-xl text-sm leading-7 text-[#d3e2d7]">{t('help.description')}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#help-ai" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#d7f36a] px-4 text-sm font-extrabold text-[#17352e] no-underline transition hover:-translate-y-0.5 hover:bg-[#e2f88c]">
                <IoSparklesOutline aria-hidden="true" className="text-lg" />
                {t('help.aiButton')}
              </a>
              <a href="#help-team" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-bold text-white no-underline transition hover:bg-white/15">
                <IoPeopleOutline aria-hidden="true" className="text-lg" />
                {t('help.teamButton')}
              </a>
            </div>
          </div>
        </header>

        <section aria-label={t('help.contactOptions')} className="mt-5 grid gap-4 md:grid-cols-2">
          <Card id="help-ai" as="article" variant="unstyled" className="scroll-mt-5 rounded-[24px] border border-[#e5ebe3] bg-white p-5 shadow-[0_12px_36px_rgba(22,57,43,.045)] sm:p-7">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eff5e8] text-2xl text-[#315d49]"><IoSparklesOutline aria-hidden="true" /></span>
              <div>
                <span className="inline-flex rounded-full bg-[#f2f4ee] px-2.5 py-1 text-[10px] font-bold text-[#7b8980]">{t('help.comingSoon')}</span>
                <h2 className="mb-0 mt-2 text-lg font-extrabold">{t('help.aiTitle')}</h2>
                <p className="mb-0 mt-2 text-sm leading-7 text-[#74847d]">{t('help.aiDescription')}</p>
              </div>
            </div>
          </Card>

          <Card id="help-team" as="article" variant="unstyled" className="scroll-mt-5 rounded-[24px] border border-[#e5ebe3] bg-white p-5 shadow-[0_12px_36px_rgba(22,57,43,.045)] sm:p-7">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eff5e8] text-2xl text-[#315d49]"><IoPeopleOutline aria-hidden="true" /></span>
              <div>
                <span className="inline-flex rounded-full bg-[#f2f4ee] px-2.5 py-1 text-[10px] font-bold text-[#7b8980]">{t('help.comingSoon')}</span>
                <h2 className="mb-0 mt-2 text-lg font-extrabold">{t('help.teamTitle')}</h2>
                <p className="mb-0 mt-2 text-sm leading-7 text-[#74847d]">{t('help.teamDescription')}</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-9">
          <div className="mb-4">
            <p className="mb-1 text-xs font-bold text-[#71867c]">{t('help.guidesEyebrow')}</p>
            <h2 className="m-0 text-xl font-extrabold">{t('help.guidesTitle')}</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {guides.map(({ title, description, to, icon: Icon }) => (
              <Link key={to} to={to} className="group flex min-h-36 items-start gap-3 rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface)] p-4 text-[var(--app-ink)] no-underline transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(22,57,43,.07)]">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--app-surface-muted)] text-xl text-[var(--app-brand)]"><Icon aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-sm">{t(title)}</strong>
                  <span className="mt-1 block text-xs leading-6 text-[var(--app-muted)]">{t(description)}</span>
                </span>
                <ContinueIcon aria-hidden="true" className="mt-1 shrink-0 text-[var(--app-muted)] transition group-hover:translate-x-[-2px]" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default HelpPage
