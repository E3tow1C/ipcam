'use client'

import Sidebar from "@/components/SideBar";
import { getDashboardData } from "@/services/apis";
import { faCamera, faExternalLinkAlt, faImages, faKey, faUpload, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export type MetricData = {
  total_cameras: number;
  total_credentials: number;
  total_users: number;
  total_images: number;
  total_images_uploaded: number;
  total_images_captured: number;
  today_images: number;
};

export default function Home() {
  const [metrics, setMetrics] = useState<MetricData>({
    total_cameras: 0,
    total_credentials: 0,
    total_users: 0,
    total_images: 0,
    total_images_uploaded: 0,
    total_images_captured: 0,
    today_images: 0,
  });

  useEffect(() => {
    if (toast) {
      toast.dismiss();
    }
    toast.loading('Loading...');
    async function fetchMetrics() {
      const res = await getDashboardData();
      setMetrics(res);
      toast.dismiss();
    }
    fetchMetrics();
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Toaster />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 px-12 py-7 md:py-9 h-svh overflow-scroll">
          <nav className="w-full flex items-center">
            <h1 className="text-2xl ml-8 md:ml-0 font-bold text-gray-700 flex items-center">
              Dashboard
            </h1>
          </nav>
          <main className="mt-8 max-w-[1200px] mx-auto">
            <h1 className="mb-3 font-semibold text-gray-700">API Endpoint : 
              <span className="bg-gray-100 px-2 py-1 font-normal text-blue-600 rounded-md">{process.env.NEXT_PUBLIC_API_URL}</span>
              <Link href={process.env.NEXT_PUBLIC_API_URL + "/docs" || ''} target="_blank" className="text-blue-500 cursor-pointer text-xs ml-2"><FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1 h-3 w-3" /> Docs</Link>
            </h1>
            <h1 className="text-xl mb-3 mt-12 font-bold text-gray-700">Images & Cameras</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-gray-100">
                <FontAwesomeIcon icon={faCamera} className="text-blue-500 text-3xl mb-2" />
                <p className="text-sm text-gray-500">IP Cameras</p>
                <h2 className="mt-2 text-2xl font-bold">{metrics.total_cameras}</h2>
              </div>
              <div className="p-6 rounded-lg bg-gray-100">
                <FontAwesomeIcon icon={faImages} className="text-green-500 text-3xl mb-2" />
                <p className="text-sm text-gray-500">Total Images</p>
                <h2 className="mt-2 text-2xl font-bold">{metrics.total_images}</h2>
              </div>
              <div className="p-6 rounded-lg bg-gray-100">
                <FontAwesomeIcon icon={faUpload} className="text-orange-500 text-3xl mb-2" />
                <p className="text-sm text-gray-500">Total Uploaded Images</p>
                <h2 className="mt-2 text-2xl font-bold">{metrics.total_images_uploaded}</h2>
              </div>
              <div className="p-6 rounded-lg bg-gray-100">
                <FontAwesomeIcon icon={faImages} className="text-purple-500 text-3xl mb-2" />
                <p className="text-sm text-gray-500">Total Captured Images</p>
                <h2 className="mt-2 text-2xl font-bold">{metrics.total_images_captured}</h2>
              </div>
              <div className="p-6 rounded-lg bg-gray-100">
                <FontAwesomeIcon icon={faImages} className="text-blue-500 text-3xl mb-2" />
                <p className="text-sm text-gray-500">Today Images</p>
                <h2 className="mt-2 text-2xl font-bold">{metrics.today_images}</h2>
              </div>
            </div>

            <h1 className="text-xl mb-3 mt-12 font-bold text-gray-700">Credentials & Users</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-gray-100">
                <FontAwesomeIcon icon={faKey} className="text-sky-500 text-3xl mb-2" />
                <p className="text-sm text-gray-500">Total Credentials</p>
                <h2 className="mt-2 text-2xl font-bold">{metrics.total_credentials}</h2>
              </div>
              <div className="p-6 rounded-lg bg-gray-100">
                <FontAwesomeIcon icon={faUser} className="text-orange-400 text-3xl mb-2" />
                <p className="text-sm text-gray-500">Total Users</p>
                <h2 className="mt-2 text-2xl font-bold">{metrics.total_users}</h2>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
