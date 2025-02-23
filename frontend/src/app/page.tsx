'use client'

import Sidebar from "@/components/SideBar";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 px-12 py-7 md:py-9">
          <nav className="w-full flex items-center">
            <h1 className="text-2xl ml-8 md:ml-0 font-bold text-gray-700 flex items-center">
              Dashboard
            </h1>
          </nav>
          <main>
            
          </main>
        </div>
      </div>
    </div>
  );
}
