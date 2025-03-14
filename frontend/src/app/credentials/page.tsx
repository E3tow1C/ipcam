'use client';
import Sidebar from '@/components/SideBar'
import { getAllCredentials, Credential } from '@/services/apis';
import { faCopy, faEarDeaf, faEye, faEyeSlash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React, { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Cookies from 'js-cookie';

function page() {
  const [credentials, setCredentials] = React.useState<Credential[]>([]);
  const [showSecret, setShowSecret] = React.useState<{ [key: string]: boolean }>({});

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

  const toggleSecret = (credentialId: string) => {
    setShowSecret(prev => ({
      ...prev,
      [credentialId]: !prev[credentialId]
    }));
  };

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
          <div className="w-full mt-6">
            <div className="flex gap-2 w-full">
              {
                credentials.length > 0 && credentials.map((credential) => (
                  <div key={credential._id} className="bg-white w-full p-4 border rounded-lg transition-all">
                    <div className="flex flex-col mb-2">
                      <h3 className="text-lg font-semibold text-gray-600">{credential.name}</h3>
                      <p className="text-gray-500">Host: {credential.host}</p>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="px-2 py-2 w-full bg-gray-100 text-blue-500 text-sm rounded-lg">
                        {showSecret[credential._id] ? credential.secret : credential.secret.replace(/./g, '•')}
                      </div>
                      <button
                        className="bg-gray-100 ml-2 text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-200 transition-all"
                        onClick={() => toggleSecret(credential._id)}
                        aria-label={showSecret[credential._id] ? "Hide secret" : "Show secret"}
                      >
                        {
                          showSecret[credential._id] ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />
                        }
                      </button>
                      <button className="bg-blue-400 ml-2 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-all" onClick={() => navigator.clipboard.writeText(credential.secret)}>
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                    </div>
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