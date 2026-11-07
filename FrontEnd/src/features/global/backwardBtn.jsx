import i18n from '../settings/locals/i18n.js'
import LinkBtn from "./linkBtn";

function HeaderBackward(){
    return (
        <header className="mb-5 flex items-center justify-between sm:mb-7">
          <LinkBtn link="dashboard" title={i18n.t("بازگشت به داشبورد")}/>
          <span className="flex items-center gap-2 text-sm font-black text-[#234a39]">
            <span className="grid size-8 place-items-center rounded-[11px] bg-[#d7f36a] text-base text-[#17352e]">{i18n.t("ر")}</span>{i18n.t("راه")}</span>
        </header>
    )
}
export default HeaderBackward