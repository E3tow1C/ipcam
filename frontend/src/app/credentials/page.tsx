import Sidebar from '@/components/SideBar'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React from 'react'
import { Toaster } from 'react-hot-toast'

function page() {
    return (
        <div className="h-screen flex flex-col">
          <Toaster />
          <div className="flex flex-1">
            <Sidebar />
            <div className="flex-1 px-12 py-7 md:py-9 h-svh overflow-scroll">
              <nav className="w-full flex items-center justify-between">
                <h1 className="text-2xl ml-8 md:ml-0 font-bold text-gray-700 flex items-center">
                  Credentials
                </h1>
                <Link className="px-4 py-2 bg-white text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 transition-all" href={"/credentials/new"}>
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add Credential
                </Link>
              </nav>
              <div className="w-[90%] mx-auto mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                </div>
              </div>
            </div>
          </div>
        </div>
    )
}

export default page