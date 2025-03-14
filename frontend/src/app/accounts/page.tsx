import Sidebar from '@/components/SideBar'
import { getAllAccounts } from '@/services/apis'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import { cookies } from 'next/headers';

async function page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || "";
  const accounts = await getAllAccounts(token);

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
              <div className="w-[90%] mx-auto mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* display list of accounts */}
                {accounts.length > 0 ? accounts.map((account) => (
                <div key={account._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-all">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800">{account.username}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      User
                    </span>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <Link 
                      href={`/accounts/${account._id}/edit`}
                      className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-all"
                    >
                      Edit
                    </Link>
                    <Link 
                      href={`/accounts/${account._id}`}
                      className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-all"
                    >
                      View
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-500">No accounts found</p>
                  <Link 
                    href="/accounts/new" 
                    className="mt-3 inline-block text-blue-600 hover:text-blue-800"
                  >
                    Create your first account
                  </Link>
                </div>
              )}
                </div>
              </div>
            </div>
          </div>
        </div>
    )
}

export default page