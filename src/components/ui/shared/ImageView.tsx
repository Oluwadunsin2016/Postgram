import { motion } from 'framer-motion'
import { AlertDialog, AlertDialogContent, AlertDialogOverlay } from '../alert-dialog';

type ViewProps={
imageUrl?:string;
isOpen:boolean;
setIsOpen:(item:boolean)=>void
}

const ImageView = ({ imageUrl,isOpen,setIsOpen }:ViewProps) => {
  const displayImage = imageUrl || "/assets/images/default_user_image.png";

  return (
    <>
  <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogOverlay className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm">
  <button type="button" className='absolute right-6 top-6 z-[130] grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20' onClick={()=>setIsOpen(!isOpen)} aria-label="Close image viewer">
    <img src="/assets/icons/x.svg" alt="close" width={18} height={18} />
  </button>
  <AlertDialogContent className='z-[130] max-w-2xl border-none bg-transparent p-0 shadow-none'>
   <motion.img
              src={displayImage}
              alt="Profile Large"
              className="max-h-[82vh] w-full rounded-2xl object-contain"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            />
  </AlertDialogContent>
  </AlertDialogOverlay>
</AlertDialog>



      {/* Thumbnail of the Profile Image */}
      {/* <motion.img
        src={imageUrl}
        alt="Profile"
        className="w-20 h-20 rounded-full cursor-pointer"
         onClick={()=>setIsOpen(!isOpen)}
        initial={{ scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      /> */}

      {/* Enlarged Image and Backdrop */}
     
    </>
  )
}

export default ImageView
