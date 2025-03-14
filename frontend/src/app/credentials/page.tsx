'use client';
import Sidebar from '@/components/SideBar'
import { getAllCredentials, Credential } from '@/services/apis';
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React, { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Cookies from 'js-cookie';

function page() {
  const [credentials, setCredentials] = React.useState<Credential[]>([]);

  const fetchCredentials = async () => {
    const token = Cookies.get('access_token') || '';
    const res = await getAllCredentials(token);
    if (!credentials) {
      return;
    }
    setCredentials(res);

    setTimeout(() => {
      toast.dismiss();
    }, 1000);
  }

  useEffect(() => {
    if (toast) {
      toast.dismiss();
    }
    toast.loading('Loading...');
    fetchCredentials();
  }, [])

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
              {
                credentials.length > 0 && credentials.map((credential) => (
                  <div key={credential._id} className="bg-white p-6 border rounded-lg transition-all">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-600">{credential.name}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {credential.secret}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-2">{credential.host}</p>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page