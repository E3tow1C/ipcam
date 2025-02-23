'use client'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faLock } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/SideBar";

export default function Home() {
  const currentPath = usePathname();

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 px-12 my-7 md:py-9">
          <nav className="w-full flex items-center">
          <h1 className="text-2xl ml-8 md:ml-0 font-bold text-gray-700 flex items-center">
              Images
            </h1>
          </nav>
          <main>
            
          </main>
        </div>
      </div>
    </div>
  );
}
