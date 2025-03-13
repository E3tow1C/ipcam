/* eslint-disable @next/next/no-img-element */
import Sidebar from "@/components/SideBar";
import { getAllCameras } from "@/services/apis";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";

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
            <Link className="px-4 py-2 bg-white text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 transition-all" href={"/ipcam/new"}>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Camera
            </Link>
          </nav>
          <div className="w-full mx-auto mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {
              cameras.map((camera, index) => (
                <Link key={index} className="bg-gray-50 border rounded-xl hover:bg-gray-100 transition-all p-4" href={`/ipcam/${camera._id}`}>
                  <div className="bg-gray-800 rounded-xl shadow-xl flex items-center justify-center text-white text-center relative">
                    <img
                      src={camera.url}
                      alt="ipcam"
                      className="w-full h-56 object-cover rounded-lg"
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
