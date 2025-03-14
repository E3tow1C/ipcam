"use client";

import Sidebar from "@/components/SideBar";
import { CameraData, getAllCameras, getAllImages, getFilteredImages } from "@/services/apis";
import { faChevronDown, faImage, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

type ImageData = {
  id: string;
  timestamp: string;
  type: string;
  image_url: string;
  camera_id: string;
};


export default function Home() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [cameras, setCameras] = useState<CameraData[]>([]);
  const [now, setNow] = useState<string>("");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    setNow(new Date().toISOString().split(".")[0]);

    async function fetchCameras() {
      const cameras: CameraData[] = await getAllCameras();
      setCameras(cameras);
    }
    fetchCameras();
  }, []);

  const handleFilterImages = async () => {
    const filteredImages = await getFilteredImages(selectedSource, fromDate, toDate);
    setImages(filteredImages);
  };

  useEffect(() => {
    handleFilterImages();
  }, [fromDate, toDate, selectedSource]);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 px-12 py-7 md:py-9 h-svh overflow-scroll">
          <nav className="w-full flex items-center">
            <h1 className="text-2xl ml-8 md:ml-0 font-bold text-gray-700 flex items-center">
              Images Gallery
            </h1>
          </nav>
          <main className="mt-8">
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                <div className="w-full relative">
                  <p className="text-gray-500 mb-1">Images source</p>
                  <select className="border w-full appearance-none border-gray-300 rounded-md px-2 py-2 pr-8 cursor-pointer hover:bg-gray-50 transition-all focus:outline-none"
                    onChange={(e) => setSelectedSource(e.target.value)}
                  >
                    <option value="all">All Sources</option>
                    <option value="upload">Uploaded Images</option>
                    <option value="capture">All Cameras</option>
                    {cameras.map((camera, index) => (
                      <option key={index} value={camera._id.$oid}>{camera.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-[37px] pointer-events-none text-gray-500">
                    <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4" />
                  </div>
                </div>

                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 mb-1">From Date</p>
                    <button className="text-blue-500 hover:underline" onClick={() => setFromDate("")}>
                      Clear
                    </button>
                  </div>
                  <input type="datetime-local" className="border w-full appearance-none border-gray-300 rounded-md px-2 py-2 cursor-pointer hover:bg-gray-50 transition-all focus:outline-none" max={now} onChange={(e) => setFromDate(e.target.value)} value={fromDate} />
                </div>

                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 mb-1">To Date</p>
                    <button className="text-blue-500 hover:underline" onClick={() => setToDate("")}>
                      Clear
                    </button>
                  </div>
                  <input type="datetime-local" className="border w-full appearance-none border-gray-300 rounded-md px-2 py-2 cursor-pointer hover:bg-gray-50 transition-all focus:outline-none" max={now} onChange={(e) => setToDate(e.target.value)} value={toDate} />
                </div>

              </div>
              <h2 className="text-gray-500 font-semibold mb-2 mt-4">Total Images: {images && images.length}</h2>
            </div>
            {images && images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {images.reverse().map((img, index) => (
                  <div key={index} className="overflow-hidden rounded shadow">
                    <img
                      src={img.image_url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-64 rounded-lg object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-96 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={faImage} className="text-gray-400 text-4xl" />
                  <p className="text-gray-400 text-lg mt-4">No images found</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
