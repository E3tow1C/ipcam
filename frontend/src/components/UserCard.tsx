import { faArrowRightFromBracket, faUserAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

function UserCard() {
  return (
    <div className='mt-auto flex gap-2 items-center justify-between w-[90%] mx-auto pt-6'>
        <div className='flex items-center gap-2'>
            <div className='bg-white rounded-full flex items-start p-2 justify-center w-11 h-11 border'>
                <FontAwesomeIcon icon={faUserAlt} className='h-5 w-5 text-blue-500' />
            </div>
            <h3 className='text-xl font-semibold text-gray-600'>Pirapat</h3>
        </div>
        <FontAwesomeIcon icon={faArrowRightFromBracket} className='h-5 w-5 text-gray-500 hover:scale-105 cursor-pointer' />
    </div>
  )
}

export default UserCard