import Card from "../../../global/Card";
import accountDetailItems from "../utils/accountDetails";

function UserInfo({user}){
    const accountDetails = accountDetailItems.map(({ label, key, dir }) => ({ label, value: user?.[key] || '—', dir }))
    return (
        <Card data-dashboard-lower variant="unstyled" className="rounded-[19px] border border-[#e6ebe4] bg-white/[0.86] p-5 shadow-[0_10px_32px_rgba(22,57,43,0.035)] sm:p-[27px_28px]">
            <div className="mb-[21px] flex items-center justify-between">
              <div><span className="text-[10px] text-[#8a9a91]">اطلاعات شما</span><h2 className="mt-[5px] mb-0 text-[19px] font-extrabold text-[#1a3d32]">نمای کلی حساب</h2></div>
              <span className="grid size-[38px] place-items-center rounded-[13px] bg-[#f0f4eb] text-xl text-[#74936e]">◈</span>
            </div>
            <ul className="m-0 grid list-none p-0">
              {accountDetails.map(({ label, value, dir }) => <li key={label} className="flex items-center justify-between gap-5 border-b border-[#edf0eb] py-[15px] text-[11px] text-[#85928b] last:border-0 last:pb-[3px]"><span>{label}</span><strong dir={dir} className="max-w-[65%] wrap-anywhere text-xs font-bold text-[#365347]">{value}</strong></li>)}
            </ul>
        </Card>
    )
}
export default UserInfo