import { faArrowRightFromBracket, faUserAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { useRouter } from 'next/navigation';
import { authLogout } from '@/services/apis';
import toast, { Toaster } from 'react-hot-toast';

function UserCard({ username = "User X" }: { username?: string }) {
  const router = useRouter();
  const handleLogout = async () => {
   try {
        const isLogOutSuccess = await authLogout();
        if (isLogOutSuccess) {
          router.push('/auth');
        } else {
          toast.error('Something went wrong', {
            position: "bottom-right",
          });
        }
   } catch {
      toast.error('Failed to logout', {
        position: "bottom-right",
      });
   }
  }

  return (
    <div className='mt-auto flex gap-2 items-center justify-between w-[90%] mx-auto pt-6'>
      <Toaster />
        <div className='flex items-center gap-2'>
            <div className='bg-white rounded-full flex items-start p-2 justify-center w-11 h-11 border'>
                <FontAwesomeIcon icon={faUserAlt} className='h-5 w-5 text-blue-500' />
            </div>
            <h3 className='text-xl font-semibold text-gray-600'>{username}</h3>
        </div>
        <button className='flex items-center gap-1' onClick={handleLogout}>
          <FontAwesomeIcon icon={faArrowRightFromBracket} className='h-5 w-5 text-gray-500 hover:scale-105 cursor-pointer' />
        </button>
    </div>
  )
}

export default UserCard