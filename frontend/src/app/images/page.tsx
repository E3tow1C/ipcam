"use client";

import Sidebar from "@/components/SideBar";
import { CameraData, deleteImage, getAllCameras, getFilteredImages } from "@/services/apis";
import { faCamera, faChevronDown, faCopy, faImage, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export type ImageDataProb = {
  id: string;
  timestamp: string;
  type: string;
  image_url: string;
  camera_id: string;
};


export default function Home() {
  const [images, setImages] = useState<ImageDataProb[]>([]);
  const [cameras, setCameras] = useState<CameraData[]>([]);
  const [tomorrow, setTomorrow] = useState<string>("");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const typeName = (type: string) => {
    switch (type) {
      case "upload":
        return "Uploaded Image";
      case "capture":
        return "Camera Capture";
      default:
        return "Unknown";
    }
  }

  useEffect(() => {
    setTomorrow(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));

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

  const handleDeleteImage = async (id: string) => {
    const res = await deleteImage(id);
    if (res) {
      handleFilterImages();
      toast.success('Image deleted');
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <Toaster />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 px-12 py-7 md:py-9 h-svh overflow-scroll">
          <nav className="w-full flex items-center">
            <h1 className="text-2xl ml-8 md:ml-0 font-bold text-gray-700 flex items-center">
              Images Gallery
            </h1>
          </nav>
          <main className="mt-8 max-w-[1200px] mx-auto">
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
                      <option key={index} value={camera._id.toString()}>{camera.name}</option>
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
                  <input type="datetime-local" className="border w-full appearance-none border-gray-300 rounded-md px-2 py-2 cursor-pointer hover:bg-gray-50 transition-all focus:outline-none" max={tomorrow} onChange={(e) => setFromDate(e.target.value)} value={fromDate} />
                </div>

                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 mb-1">To Date</p>
                    <button className="text-blue-500 hover:underline" onClick={() => setToDate("")}>
                      Clear
                    </button>
                  </div>
                  <input type="datetime-local" className="border w-full appearance-none border-gray-300 rounded-md px-2 py-2 cursor-pointer hover:bg-gray-50 transition-all focus:outline-none" max={tomorrow} onChange={(e) => setToDate(e.target.value)} value={toDate} />
                </div>

              </div>
              <h2 className="text-gray-500 font-semibold mb-2 mt-4">Total Images: {images && images.length}</h2>
            </div>
            {images && images.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {images.reverse().map((img, index) => (
                  <div key={index} className="overflow-hidden rounded-lg bg-white border p-2">
                    <img
                      src={img.image_url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-64 rounded-md object-cover cursor-pointer"
                      onClick={() => window.open(img.image_url, '_blank')}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-gray-500 text-sm font-semibold">{typeName(img.type)}</p>
                      <p className="text-gray-500 text-sm">{new Date(img.timestamp).toLocaleString()}</p>
                    </div>
                    {
                      img.type === "capture" && (
                        <div className="flex items-center mt-1 justify-between">
                          <p className="text-gray-500 text-sm line-clamp-1">
                            <FontAwesomeIcon icon={faCamera} className="text-gray-500 text-sm mr-2" />
                            {(cameras.find((camera) => camera._id.toString() === img.camera_id)?.name) || "Unknown Camera"}
                          </p>
                        </div>
                      )
                    }
                    <div className="flex w-full items-center justify-between mt-3">
                      <button className="bg-gray-100 text-gray-500 px-3 py-2 text-sm rounded-lg hover:bg-gray-200 transition-all"
                        onClick={() => {
                          navigator.clipboard.writeText(img.image_url);
                          toast.success('Copied to clipboard');
                        }}
                      >
                        <FontAwesomeIcon icon={faCopy} className="text-gray-500 text-sm mr-2" />
                        Copy image URL
                      </button>
                      <button className="text-red-400 px-3 py-1 rounded-lg hover:text-red-500 transition-all"
                        onClick={() => handleDeleteImage(img.id)}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} className="text-sm" />
                      </button>
                    </div>
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
