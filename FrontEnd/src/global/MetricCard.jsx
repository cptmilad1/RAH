import Card from './Card'

const layouts = {
  stacked: {
    card: 'rounded-2xl border p-5',
    label: 'm-0 text-xs',
    icon: 'hidden',
    value: 'mt-3 block text-3xl font-black',
    caption: 'mt-2 block text-[11px]',
  },
  header: {
    card: 'p-4 sm:p-5',
    label: 'text-[11px] font-semibold text-[#829188]',
    icon: 'grid size-9 place-items-center rounded-xl text-base',
    value: 'mt-3 block text-2xl font-black text-[#193e31]',
    caption: 'hidden',
  },
  dashboard: {
    card: "group relative grid min-h-[150px] justify-items-start gap-[11px] overflow-hidden rounded-[19px] border p-[19px_17px] shadow-[0_10px_32px_rgba(22,57,43,0.035)] transition-shadow duration-300 hover:shadow-[0_18px_38px_rgba(22,57,43,0.12)] before:absolute before:-bottom-[45px] before:-left-[27px] before:size-28 before:rounded-full before:border before:border-[#1a4c3b]/[0.055] before:shadow-[0_0_0_16px_rgba(26,76,59,0.025),0_0_0_32px_rgba(26,76,59,0.018)] before:content-[''] lg:min-h-[178px] lg:p-[22px_23px]",
    label: 'text-[11px] font-semibold',
    icon: 'grid size-[34px] place-items-center rounded-[11px] bg-white/55 text-[15px] font-black',
    value: 'max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[17px] font-extrabold',
    caption: 'text-[10px]',
  },
}

const tones = {
  account: {
    card: 'border-[#d9eaa3] bg-gradient-to-br from-[#e5f5b3] to-[#d8ef83]',
    text: 'text-[#193e31]',
    label: 'text-[#597347]',
    caption: 'text-[#617a4b]',
    icon: 'bg-white/55 text-[#477244]',
  },
  default: {
    card: 'border-[#e5ebe3] bg-white/85 shadow-[0_8px_24px_rgba(22,57,43,.035)]',
    text: 'text-[#193e31]',
    label: 'text-[#7b8982]',
    caption: 'text-[#95a098]',
    icon: 'bg-[#eff3ea] text-[#547460]',
  },
  highlight: {
    card: 'border-[#dce9c0] bg-[#edf6d8]',
    text: 'text-[#315638]',
    label: 'text-[#627a4d]',
    caption: 'text-[#71845e]',
    icon: 'bg-white/55 text-[#477244]',
  },
  white: {
    card: 'border-[#e6ebe4] bg-white shadow-[0_8px_24px_rgba(22,57,43,.035)]',
    text: 'text-[#193e31]',
    label: 'text-[#829188]',
    caption: 'text-[#84918a]',
    icon: 'bg-[#f0f4eb] text-[#547460]',
  },
}

function MetricCard({
  label,
  value,
  caption,
  icon,
  iconClassName = '',
  valueClassName = '',
  layout = 'stacked',
  variant = 'default',
  className = '',
  ...props
}) {
  const layoutStyles = layouts[layout] || layouts.stacked
  const tone = tones[variant] || tones.default
  const isHeader = layout === 'header'
  const isDashboard = layout === 'dashboard'
  const Label = layout === 'stacked' ? 'p' : 'span'
  const Caption = isDashboard ? 'small' : 'span'
  return (
    <Card
      as="article"
      variant={isHeader ? 'surface' : 'unstyled'}
      className={`${layoutStyles.card} ${isHeader ? '' : tone.card} ${className}`}
      {...props}
    >
      {isHeader ? (
        <div className="flex items-center justify-between gap-2">
          <Label className={layoutStyles.label}>{label}</Label>
          {icon != null && <span className={`${layoutStyles.icon} ${tone.icon} ${iconClassName}`}>{icon}</span>}
        </div>
      ) : (
        <>
          {icon != null && <span className={`${layoutStyles.icon} ${tone.icon} ${iconClassName}`}>{icon}</span>}
          <Label className={`${layoutStyles.label} ${tone.label}`}>{label}</Label>
        </>
      )}
      <strong className={`${layoutStyles.value} ${tone.text} ${valueClassName}`}>{value}</strong>
      {caption && <Caption className={`${layoutStyles.caption} ${tone.caption}`}>{caption}</Caption>}
    </Card>
  )
}

export default MetricCard
