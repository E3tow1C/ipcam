import Sidebar from '@/components/SideBar'
import { faAngleLeft, faChartPie, faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React from 'react'
import { Toaster } from 'react-hot-toast'

function page() {
    return (
        <div className="h-screen flex flex-col">
            <Toaster />
            <div className="flex flex-1">
                <div className="flex-1 relative h-svh overflow-scroll">
                    <nav className="w-full flex items-center justify-center bg-gradient-to-br h-64 from-blue-500 to-blue-400">
                        <div className="flex items-center gap-2 mb-20">
                            <FontAwesomeIcon icon={faChartPie} className="w-16 h-16 text-white" />
                            <div className="flex flex-col gap-1">
                                <h1 className="text-2xl font-bold leading-none text-gray-100 flex items-center">
                                    CoE KKU
                                </h1>
                                <p className="text-base text-gray-50 leading-none">
                                    Access control system
                                </p>
                            </div>
                        </div>
                    </nav>
                    <div className="absolute left-0 right-0 top-44">
                        <div className="bg-white rounded-xl border w-[90%] max-w-[600px] py-10 mx-auto flex items-center justify-center text-white text-start">
                            <form className="w-[90%] mx-auto">
                                <h1 className="text-xl text-gray-700 font-bold ml-1 mb-6">Login</h1>
                                <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="name">Username</label>
                                <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="username" type="text" />

                                <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="password">Password</label>
                                <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="password" type="password" />

                                <button className="bg-blue-500 text-white w-full mt-6 px-3 py-2 flex items-center justify-center rounded-md hover:bg-blue-600 transition-all disabled:opacity-70">
                                    <FontAwesomeIcon icon={faCheck} className="mr-2 h-4" />
                                    Login
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page