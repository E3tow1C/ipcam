'use client';
import Sidebar from '@/components/SideBar'
import { getAllCredentials, Credential, deleteCredential } from '@/services/apis';
import { faCopy, faEye, faEyeSlash, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React, { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Cookies from 'js-cookie';
import Modal from '@/components/Modal';

function Page() {
  const [credentials, setCredentials] = React.useState<Credential[]>([]);
  const [showSecret, setShowSecret] = React.useState<{ [key: string]: boolean }>({});
  const [isOpen, setIsOpen] = React.useState(false);
  const [thisCredential, setThisCredential] = React.useState<Credential | null>(null);
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

  const handleDeleteCredential = async (id: string) => {
    const token = Cookies.get('access_token') || '';
    const res = await deleteCredential(id, token);
    if (res) {
      fetchCredentials();
      toast.success('Credential deleted');
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {(close) => (
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-600">Delete <span className='text-red-400'>{thisCredential?.name}</span> Credential</h2>
            <p className="mt-1 mb-6 text-gray-500">Are you sure you want to delete this credential?</p>

            <div className="mt-4 flex justify-center gap-4">
              <button
                className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-all"
                onClick={() => {
                  handleDeleteCredential(thisCredential?._id || '');
                  close();
                }}
              >
                Delete
              </button>
              <button
                className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all"
                onClick={close}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
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
            <div className="w-full max-w-[1200px] mx-auto mt-6">
              <div className="flex flex-col gap-4 w-full">
                {
                  credentials.length > 0 && credentials.map((credential) => (
                    <div key={credential._id} className="bg-white w-full p-4 border rounded-lg transition-all">
                      <div className="flex flex-col mb-2">
                        <div className='flex justify-between items-center'>
                          <h3 className="text-lg font-semibold text-gray-600">{credential.name}</h3>
                          <button className="bg-red-400 text-white px-2 py-1 rounded-md hover:bg-red-500 transition-all" onClick={() => {
                            setIsOpen(true);
                            setThisCredential(credential);
                          }}>
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        </div>
                        <p className="text-gray-500">Host: {credential.host}</p>
                        <p className="bg-gray-100 text-gray-500 w-max px-2 py-1 rounded-md text-sm my-2">{credential.expire ? 'Expires on ' + new Date(credential.expire).toLocaleDateString() : 'No expiry'}</p>
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="px-2 py-2 w-full bg-gray-100 text-blue-500 text-sm rounded-lg overflow-hidden">
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
                        <button className="bg-blue-400 ml-2 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-all"
                          onClick={() => {
                            navigator.clipboard.writeText(credential.secret)
                            toast.success('Copied to clipboard');
                          }}>
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
    </>
  )
}

export default Page