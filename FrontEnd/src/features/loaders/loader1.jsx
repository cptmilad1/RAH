import { localizeText } from '../settings/locals/localizedText.js'
import { ClipLoader } from "react-spinners"

function Loader() {
  return (
    <div className='flex flex-col w-full h-screen justify-center items-center gap-10'>
        <div>{<ClipLoader size={35}/>}</div>
        <div className='flex gap-1'>
            <span>...</span>
            <span>{localizeText("در حال بارگذاری اطلاعات")}</span>
        </div>
    </div>
  )
}

export default Loader