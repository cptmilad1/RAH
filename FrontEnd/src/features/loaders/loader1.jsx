import { Spinner } from "react-spinner"

function Loader() {
  return (
    <div className='flex flex-col w-full h-screen justify-center items-center gap-10'>
        <div>{'fff'}</div>
        <div className='flex gap-1'>
            <span>...</span>
            <span>در حال بارگذاری اطلاعات</span>
        </div>
    </div>
  )
}

export default Loader