import Card from './Card'

const tones = {
  default: 'text-[#244738]',
  success: 'text-[#3c754d]',
  warning: 'text-[#9a7540]',
}

function InfoCard({ title, value, icon, dir, tone = 'default', className = '', ...props }) {
  return (
    <Card
      as="article"
      variant="interactive"
      className={`relative flex min-h-[126px] min-w-0 items-start gap-4 overflow-hidden rounded-[16px] border-[#e5ebe2] bg-white/[0.88] p-4 shadow-[0_8px_26px_rgba(22,57,43,0.035)] transition duration-300 hover:-translate-y-0.5 hover:border-[#d7e3d1] hover:shadow-[0_14px_32px_rgba(22,57,43,0.08)] sm:min-h-[140px] sm:p-5 ${className}`}
      {...props}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-[#eff4e9] text-lg font-bold text-[#547460] transition group-hover:bg-[#e8f2d0]" aria-hidden="true">{icon}</span>
      <div className="grid min-w-0 flex-1 gap-3 pt-0.5">
        <h3 className="m-0 text-[11px] font-bold text-[#829087]">{title}</h3>
        <p dir={dir} className={`m-0 min-h-5 max-w-full break-words font-bold ${tones[tone] || tones.default} ${dir === 'ltr' ? 'text-left text-[12px] sm:text-[13px]' : 'text-right text-[13px] sm:text-sm'}`}>
          {value || 'ثبت نشده'}
        </p>
      </div>
      <span className="absolute bottom-0 right-0 h-[2px] w-0 bg-[#d7f36a] transition-all duration-300 group-hover:w-full" />
    </Card>
  )
}

export default InfoCard
