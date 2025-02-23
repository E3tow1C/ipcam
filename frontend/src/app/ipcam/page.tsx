'use client'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCameraAlt, faChartPie, faLock } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/SideBar";

export default function Home() {

  const handleUpload = () => {
    // Logic for upload action
    console.log("Uploading image...");
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 relative">
          <nav className="w-full bg-gradient-to-br h-52 from-blue-500 to-blue-400">
            <h1 className="text-2xl px-12 ml-8 md:ml-0 py-7 md:py-9 font-bold text-white flex items-center">
              IP Camera
            </h1>
          </nav>
          <div className="absolute left-0 right-0 top-32">
            <div className="bg-gray-800 rounded-xl 
              w-[90%] max-w-[800px] h-[450px] mx-auto
              shadow-xl
              flex items-center justify-center text-white text-center
            ">
              <img
                src="http://218.219.195.24/nphMotionJpeg?Resolution=640x480"
                alt="IP Camera Stream"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="w-[90%] max-w-[800px] mx-auto my-3 bg-white z-10 border rounded-xl">
              <div className="flex items-center justify-between p-3">
                <h2 className="text-lg font-bold">IP Camera</h2>
                <button className="bg-blue-500 text-white px-3 py-2 rounded-md" onClick={handleUpload}>
                  <FontAwesomeIcon icon={faCameraAlt} className="mr-2" />
                  Take Picture
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
