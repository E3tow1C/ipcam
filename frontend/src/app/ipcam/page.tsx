import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCameraAlt, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/components/SideBar";
import { captureImage, getAllCameras } from "@/services/apis";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";

export default async function Home() {
  // Get cameras
  const cameras = await getAllCameras();

  return (
    <div className="h-screen flex flex-col">
      <Toaster />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 px-12 py-7 md:py-9 h-svh overflow-scroll">
          <nav className="w-full flex items-center justify-between">
            <h1 className="text-2xl ml-8 md:ml-0 font-bold text-gray-700 flex items-center">
              IP Camera
            </h1>
          </nav>
          <div className="w-[90%] mx-auto mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {
              cameras.map((camera, index) => (
                <Link key={index} className="bg-gray-50 border rounded-xl hover:bg-gray-100 transition-all p-4" href={`/ipcam/${camera._id}`}>
                  <div className="bg-gray-800 rounded-xl h-80 shadow-xl flex items-center justify-center text-white text-center relative">
                    <img
                      src={camera.url}
                      alt="ipcam"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute top-0 left-0 right-0 flex justify-between p-2">

                    </div>
                  </div>
                  <div>
                    <div className="mt-4">
                      <h2 className="text-lg font-bold">{camera.name}</h2>
                      <p className="text-gray-500">{camera.location}</p>
                    </div>
                  </div>
                </Link>
              ))
            }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
