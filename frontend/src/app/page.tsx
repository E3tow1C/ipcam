'use client'

import Sidebar from "@/components/SideBar";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 px-12 py-7 md:py-9 h-svh overflow-scroll">
          <nav className="w-full flex items-center">
            <h1 className="text-2xl ml-8 md:ml-0 font-bold text-gray-700 flex items-center">
              Dashboard
            </h1>
          </nav>
          <main className="mt-8">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-500">Total Users</p>
                <h2 className="mt-2 text-xl font-bold">1,234</h2>
              </div>
              <div className="p-6 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-500">New Signups</p>
                <h2 className="mt-2 text-xl font-bold">567</h2>
              </div>
              <div className="p-6 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-500">Revenue</p>
                <h2 className="mt-2 text-xl font-bold">$12,345</h2>
              </div>
              <div className="p-6 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-500">Active Sessions</p>
                <h2 className="mt-2 text-xl font-bold">89</h2>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-10">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Recent Activity
              </h3>
              <ul className="divide-y divide-gray-200">
                <li className="py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      User John Doe signed up
                    </span>
                    <span className="text-sm text-gray-400">10 mins ago</span>
                  </div>
                </li>
                <li className="py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      User Jane Doe purchased a subscription
                    </span>
                    <span className="text-sm text-gray-400">30 mins ago</span>
                  </div>
                </li>
                <li className="py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      Server status updated: All systems go
                    </span>
                    <span className="text-sm text-gray-400">1 hour ago</span>
                  </div>
                </li>
              </ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
