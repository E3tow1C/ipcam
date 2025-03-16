/* eslint-disable @next/next/no-img-element */
"use client";

import Sidebar from "@/components/SideBar";
import { CameraData, getAllCameras } from "@/services/apis";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

export default function Home() {
  const [cameras, setCameras] = useState<CameraData[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  useEffect(() => {
    async function fetchCameras() {
      const cameras: CameraData[] = await getAllCameras();
      setCameras(cameras);
      setIsLoaded(true);
    }
    fetchCameras();
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Toaster />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 px-12 py-7 md:py-9 h-svh overflow-scroll">
          <nav className="w-full flex items-center justify-between">
            <h1 className="text-2xl ml-8 md:ml-0 font-bold text-gray-700 flex items-center">
              IP Cameras
            </h1>
            <Link className="px-4 py-2 bg-white text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 transition-all" href={"/ipcam/new"}>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Camera
            </Link>
          </nav>
          <div className="w-full max-w-[1200px] mx-auto mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {
                cameras.map((camera, index) => (
                  <Link key={index} className="bg-gray-50 border rounded-xl hover:bg-gray-100 transition-all p-4" href={`/ipcam/${camera._id}`}>
                    <div className="bg-gray-800 rounded-xl shadow-xl flex items-center justify-center text-white text-center relative">
                      {
                        camera.authType ? (
                          <div className="w-full h-56 flex items-center text-gray-300 justify-center">
                            <FontAwesomeIcon icon={faCamera} className="text-4xl" />
                            <p className="ml-2">Protected Camera</p>
                          </div>
                        ) : (
                          <img
                            src={
                              camera.url.includes('@')
                                ? process.env.NEXT_PUBLIC_API_URL + '/stream?url=' + encodeURIComponent(camera.url)
                                : camera.url
                            }
                            alt="ipcam"
                            className="w-full h-56 object-cover rounded-lg"
                          />
                        )
                      }
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
              {
                (cameras.length === 0 && isLoaded) && (
                  <button className="w-full bg-white rounded-xl border h-48 flex flex-col items-center justify-center text-gray-400 text-center hover:bg-gray-100 hover:text-gray-700 transition-all cursor-pointer" onClick={() => window.location.href = '/ipcam/new'}>
                    <FontAwesomeIcon icon={faPlus} className="text-4xl mb-2" />
                    <p>Add a new camera</p>
                  </button>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
