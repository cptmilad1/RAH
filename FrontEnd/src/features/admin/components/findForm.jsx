function FindForm({searchInput, setSearchInput, cityFilter, setCityFilter, dateFilter, setDateFilter, sortOrder, setSortOrder, submitSearch}) {
    return (
        <div className="border-b border-[#edf0eb] p-4 sm:p-6">
            <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
              <label className="min-w-0 flex-1">
                <span className="sr-only">جست‌وجو در کاربران</span>
                <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} className="min-h-12 w-full rounded-xl border border-[#dfe7dd] bg-[#fbfcf9] px-4 text-sm outline-none transition focus:border-[#9dbb87] focus:ring-4 focus:ring-[#82aa85]/[0.12]" placeholder="جست‌وجو با نام، ایمیل، شماره تماس، نام کاربری یا پلیت…" />
              </label>
              <button type="submit" className="min-h-12 rounded-xl bg-[#174c3c] px-7 text-sm font-extrabold text-white transition hover:bg-[#103b30]">جست‌وجو</button>
            </form>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1.5 text-[11px] font-bold text-[#66776d]">فیلتر شهر یا ولایت
                <input value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} className="min-h-10 rounded-xl border border-[#e2e8de] bg-white px-3 text-sm font-normal" placeholder="نام شهر یا ولایت" />
              </label>
              <label className="grid gap-1.5 text-[11px] font-bold text-[#66776d]">تاریخ عضویت یا درخواست
                <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="min-h-10 rounded-xl border border-[#e2e8de] bg-white px-3 text-sm font-normal" />
              </label>
              <label className="grid gap-1.5 text-[11px] font-bold text-[#66776d]">ترتیب نمایش
                <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="min-h-10 rounded-xl border border-[#e2e8de] bg-white px-3 text-sm font-normal">
                  <option value="newest">جدیدترین ابتدا</option>
                  <option value="oldest">قدیمی‌ترین ابتدا</option>
                  <option value="name-asc">نام (الف تا ی)</option>
                </select>
              </label>
            </div>
          </div>
    )
}
export default FindForm