
import { CgSpinnerTwo } from "react-icons/cg";



const Loader = () => {
  return (
    <div className='flex flex-center h-screen justify-center'>
    <CgSpinnerTwo size={40} className='animate-spin text-indigo-600' />
    </div>
  )
}

export default Loader