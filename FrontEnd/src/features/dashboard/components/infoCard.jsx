import Card from "../../../global/Card"

function InfoCard(){
    return (
        <Card as="aside" data-dashboard-lower variant="dark" className="min-h-[230px] p-[27px] lg:min-h-[260px]">
            <div data-journey-glow className="absolute -top-[92px] -left-[54px] size-[220px] rounded-full bg-[#d7f36a]/[0.14] blur-[2px]" />
            <span className="relative grid size-[37px] place-items-center rounded-[13px] bg-[#d7f36a]/[0.16] text-[#d7f36a]">✦</span>
            <p className="relative mt-6 mb-2 text-[10px] text-[#b9d1c2]">هر روز، یک مسیر تازه</p>
            <h2 className="relative m-0 text-[23px] leading-[1.65] font-extrabold text-[#f5f7ef]">شهر منتظر<br />قدم‌های توست.</h2>
            <span aria-hidden="true" className="absolute -bottom-[35px] left-[18px] -rotate-12 text-[115px] font-black text-[#d7f36a]/[0.09]">راه</span>
        </Card>
    )
}
export default InfoCard