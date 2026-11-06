import { localizeText } from '../settings/locals/localizedText.js'
import { Link } from "react-router-dom";

function LinkBtn({link, title}) {
    return (
        <Link to={`/${link}`} className="group inline-flex items-center gap-2 text-xs font-bold text-[#587366] transition hover:text-[#17352e]">
            <span className="grid size-9 place-items-center rounded-xl border border-[#e0e8dc] bg-white text-base transition group-hover:-translate-x-0.5" aria-hidden="true">→</span>
            {localizeText(title)}
        </Link>
    )
}
export default LinkBtn