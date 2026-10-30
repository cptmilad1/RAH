const variants = {
  unstyled: '',
  surface: 'rounded-2xl border border-[#e6ebe4] bg-white shadow-[0_8px_24px_rgba(22,57,43,.035)]',
  panel: 'rounded-[24px] border border-[#e5ebe3] bg-white shadow-[0_18px_52px_rgba(22,57,43,.055)]',
  muted: 'rounded-2xl border border-[#e8ede5] bg-[#f7f9f4]',
  highlight: 'rounded-2xl border border-[#dce9c0] bg-[#edf6d8]',
  interactive: 'group rounded-2xl border border-[#ebefea] bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#d8e5cb] hover:shadow-[0_12px_28px_rgba(22,57,43,.07)]',
  dark: 'relative overflow-hidden rounded-[20px] bg-[linear-gradient(145deg,#1d5742,#10382e)] text-white',
  warning: 'rounded-2xl border border-[#e9e4c4] bg-[#fbf9ed] text-[#776d3a]',
  success: 'rounded-2xl border border-[#d5e8ce] bg-[#f3f8ed] text-[#416d43]',
}

function Card({ as: Element = 'div', variant = 'surface', className = '', children, ...props }) {
  return (
    <Element className={`${variants[variant] || variants.surface} ${className}`.trim()} {...props}>
      {children}
    </Element>
  )
}

export default Card
