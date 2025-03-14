'use client'
import Sidebar from '@/components/SideBar'
import { Account, deleteAccount, getAllAccounts } from '@/services/apis'
import { faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Cookies from 'js-cookie';


function page() {
  const token = Cookies.get('access_token') || '';
  const [accounts, setAccounts] = useState<Account[]>([]);

  const handleDeleteAccount = async (id: string) => {
    const isDeleted = await deleteAccount(id, token);
    if (isDeleted) {
      window.location.reload();
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
  }, [])

  return (
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
          <div className="w-full mt-6">
            <div className="flex flex-col gap-4">
              {accounts.length > 0 && accounts.map((account) => (
                <div key={account._id} className="bg-white flex justify-between items-center p-4 py-2 border rounded-lg transition-all">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium text-gray-600">{account.username}</h3>
                    <p className="text-sm text-gray-400">ID: {account._id}</p>
                  </div>
                  <button className="bg-red-400 text-white px-2 py-1 rounded-md hover:bg-red-500 transition-all" onClick={() => handleDeleteAccount(account._id)}>
                    <FontAwesomeIcon icon={faTrashAlt}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page