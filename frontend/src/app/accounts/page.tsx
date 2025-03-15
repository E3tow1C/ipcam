'use client'
import Sidebar from '@/components/SideBar'
import { Account, deleteAccount, getAllAccounts } from '@/services/apis'
import { faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Cookies from 'js-cookie';
import Modal from '@/components/Modal'


function Page() {
  const token = Cookies.get('access_token') || '';
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [thisAccount, setThisAccount] = useState<Account | null>(null);

  const handleDeleteAccount = async (id: string) => {
    const isDeleted = await deleteAccount(id, token);
    if (isDeleted) {
      toast.success('Account deleted successfully');
      const updatedAccounts = accounts.filter(account => account._id !== id);
      setAccounts(updatedAccounts);
    }
  }

  useEffect(() => {
    if (toast) {
      toast.dismiss();
    }
    toast.loading('Loading...');
    const fetchAccounts = async () => {
      const accounts = await getAllAccounts(token);
      setAccounts(accounts);
      setTimeout(() => {
        toast.dismiss();
      }, 1000);
    }

    fetchAccounts();
  }, [token])

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {(close) => (
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-600">Delete <span className='text-red-400'>{thisAccount?.username}</span> Account</h2>
            <p className="mt-1 mb-6 text-gray-500">Are you sure you want to delete this account?</p>

            <div className="mt-4 flex justify-center gap-4">
              <button
                className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-all"
                onClick={() => {
                  handleDeleteAccount(thisAccount?._id || '');
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
                Accounts
              </h1>
              <Link className="px-4 py-2 bg-white text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 transition-all" href={"/accounts/new"}>
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Account
              </Link>
            </nav>
            <div className="w-full max-w-[1200px] mx-auto mt-6">
              <div className="flex flex-col gap-4">
                {accounts.length > 0 && accounts.map((account) => (
                  <div key={account._id} className="bg-white flex justify-between items-center p-4 py-2 border rounded-lg transition-all">
                    <div className="flex flex-col">
                      <h3 className="text-lg font-medium text-gray-600">{account.username}</h3>
                      <p className="text-sm text-gray-400">ID: {account._id}</p>
                    </div>
                    <button className="bg-red-400 text-white px-2 py-1 rounded-md hover:bg-red-500 transition-all" onClick={() => {
                      setIsOpen(true);
                      setThisAccount(account);
                    }}>
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page