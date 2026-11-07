import i18n from '../../settings/locals/i18n.js'
function FindForm({searchInput, setSearchInput, cityFilter, setCityFilter, dateFilter, setDateFilter, sortOrder, setSortOrder, submitSearch}) {
    return (
        <div className="border-b border-[#edf0eb] p-4 sm:p-6">
            <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
              <label className="min-w-0 flex-1">
                <span className="sr-only">{i18n.t("جست‌وجو در کاربران")}</span>
                <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="min-h-12 w-full rounded-xl border border-[#dfe7dd] bg-[#fbfcf9] px-4 text-sm outline-none transition focus:border-[#9dbb87] focus:ring-4 focus:ring-[#82aa85]/[0.12]" placeholder={i18n.t("جست‌وجو با نام، ایمیل، شماره تماس، نام کاربری یا پلیت…")} />
              </label>
              <button type="submit" className="min-h-12 rounded-xl bg-[#174c3c] px-7 text-sm font-extrabold text-white transition hover:bg-[#103b30]">{i18n.t("جست‌وجو")}</button>
            </form>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1.5 text-[11px] font-bold text-[#66776d]">{i18n.t("فیلتر شهر یا ولایت")}<input value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} className="min-h-10 rounded-xl border border-[#e2e8de] bg-white px-3 text-sm font-normal" placeholder={i18n.t("نام شهر یا ولایت")} />
              </label>
              <label className="grid gap-1.5 text-[11px] font-bold text-[#66776d]">{i18n.t("تاریخ عضویت یا درخواست")}<input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="min-h-10 rounded-xl border border-[#e2e8de] bg-white px-3 text-sm font-normal" />
              </label>
              <label className="grid gap-1.5 text-[11px] font-bold text-[#66776d]">{i18n.t("ترتیب نمایش")}<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="min-h-10 rounded-xl border border-[#e2e8de] bg-white px-3 text-sm font-normal">
                  <option value="newest">{i18n.t("جدیدترین ابتدا")}</option>
                  <option value="oldest">{i18n.t("قدیمی‌ترین ابتدا")}</option>
                  <option value="name-asc">{i18n.t("نام (الف تا ی)")}</option>
                </select>
              </label>
            </div>
          </div>
    )
}
export default FindForm