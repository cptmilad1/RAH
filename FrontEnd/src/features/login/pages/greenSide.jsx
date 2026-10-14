const GreenSide = ({heroRef}) => {

    return(
        <section
        ref={heroRef}
        aria-label="معرفی راه"
        className="relative isolate flex min-h-[270px] flex-col justify-between overflow-hidden bg-[radial-gradient(ellipse_at_22%_88%,rgba(117,166,113,0.2),transparent_33%),radial-gradient(ellipse_at_90%_13%,rgba(215,243,106,0.12),transparent_28%),linear-gradient(145deg,#174c3c_0%,#103b30_52%,#0e3129_100%)] px-6 py-7 text-[#f4f7ee] sm:min-h-[310px] sm:px-9 sm:py-8 lg:min-h-screen lg:px-[clamp(32px,5vw,72px)] lg:py-[clamp(32px,5vw,72px)]"
      >
        <div className="pointer-events-none absolute -left-40 top-[19%] -z-10 size-[570px] rounded-full border border-white/[0.09] shadow-[0_0_0_46px_rgba(227,244,193,0.025),0_0_0_92px_rgba(227,244,193,0.02)]" />
        <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-px w-[55%] bg-gradient-to-l from-[#d7f36a]/40 to-transparent" />

        <div data-hero-item className="flex items-center gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#d7f36a] text-[25px] font-black text-[#17352e] shadow-[0_8px_24px_rgba(215,243,106,0.16)] sm:size-[50px]">ر</span>
          <div className="grid gap-1">
            <strong className="text-lg font-black sm:text-[22px]">راه</strong>
            <span className="text-[9px] text-[#adc9b9] sm:text-[10px]">همراهِ مسیرهای روزمره</span>
          </div>
        </div>

        <div data-hero-item className="relative z-10 mt-8 max-w-[550px] lg:-mt-5">
          <span className="mb-2.5 inline-flex items-center gap-2 text-[10px] text-[#d3e3c6] sm:mb-6 sm:text-xs">
            <i className="size-[7px] rounded-full bg-[#d7f36a] shadow-[0_0_15px_rgba(215,243,106,0.7)]" />
            شهر، نزدیک‌تر از همیشه
          </span>
          <h1 className="m-0 text-[clamp(28px,5vw,64px)] leading-[1.55] font-extrabold tracking-tight text-[#f5f8ee]">
            هر مسیر تازه،<br />با یک قدم شروع می‌شود.
          </h1>
          <p className="mt-2 max-w-[380px] text-[10px] leading-[1.9] text-[#c1d3c7] sm:mt-[22px] sm:text-sm sm:leading-[2.15]">
            برای سفرها، جابه‌جایی‌ها و لحظه‌هایی که روزتان را پیش می‌برند؛ یک حساب، یک همراه.
          </p>
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute -bottom-5 -right-16 -z-10 h-[185px] w-[340px] opacity-60 sm:right-[2%] sm:opacity-90 lg:bottom-[15%] lg:right-[12%]">
          <svg className="size-full overflow-visible" viewBox="0 0 340 185" fill="none">
            <ellipse data-route-orbit className="origin-center" cx="190" cy="126" rx="166" ry="76" stroke="#d7f36a" strokeOpacity=".12" transform="rotate(-24 190 126)" />
            <ellipse data-route-orbit className="origin-center" cx="180" cy="126" rx="130" ry="58" stroke="#d7f36a" strokeOpacity=".12" transform="rotate(-24 180 126)" />
            <path data-route-path d="M54 112 C116 72 192 119 266 56" stroke="#d7f36a" strokeOpacity=".6" strokeWidth="2" strokeDasharray="5 7" />
            <circle data-route-float cx="54" cy="112" r="8" fill="#d7f36a" fillOpacity=".28" />
            <circle cx="54" cy="112" r="4" fill="#d7f36a" />
            <circle data-route-float cx="266" cy="56" r="14" fill="#d7f36a" fillOpacity=".2" />
            <circle cx="266" cy="56" r="9" fill="#d7f36a" />
            <text x="30" y="145" fill="#a6c3b1" fontSize="9">از همین‌جا</text>
            <text x="252" y="31" fill="#a6c3b1" fontSize="9">به هر کجا</text>
          </svg>
        </div>

        <div data-hero-item className="relative z-10 hidden justify-between text-[10px] text-[#9db9a8] lg:flex">
          <span>راه | همراه شما در شهر</span>
          <span>ساده‌تر برو، بیشتر ببین</span>
        </div>
      </section>
    )
}

export default GreenSide; 