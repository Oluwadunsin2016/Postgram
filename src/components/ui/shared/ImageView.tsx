import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertDialog, AlertDialogContent, AlertDialogOverlay } from '../alert-dialog';

type ViewProps={
imageUrl:string;
isOpen:boolean;
setIsOpen:(item:boolean)=>void
}

const ImageView = ({ imageUrl,isOpen,setIsOpen }:ViewProps) => {

  return (
    <>
  <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogOverlay className="fixed inset-0 bg-black bg-opacity-60 z-[60]">
  <img src="/assets/icons/x.svg" className='absolute top-10 right-10 cursor-pointer text-white'  alt="close" width={20} height={20} onClick={()=>setIsOpen(!isOpen)} />
  <AlertDialogContent className='bg-slate-800 p-0 border-none z-[99]'>
   <motion.img
              src={imageUrl}
              alt="Profile Large"
              className="w-full h-full rounded-lg"
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
