'use client'

import Sidebar from "@/components/SideBar";
import { getDashboardData } from "@/services/apis";
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-500">Total Cameras</p>
                <h2 className="mt-2 text-2xl font-bold">{metrics.total_cameras}</h2>
              </div>
              <div className="p-6 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-500">Total Images</p>
                <h2 className="mt-2 text-2xl font-bold">{metrics.total_images}</h2>
              </div>
              <div className="p-6 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-500">Total Images Uploaded</p>
                <h2 className="mt-2 text-2xl font-bold">{metrics.total_images_uploaded}</h2>
              </div>
              <div className="p-6 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-500">Total Images Captured</p>
                <h2 className="mt-2 text-2xl font-bold">{metrics.total_images_captured}</h2>
              </div>
              <div className="p-6 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-500">Today Images</p>
                <h2 className="mt-2 text-2xl font-bold">{metrics.today_images}</h2>
              </div>
            </div>
            
            <h1 className="text-xl mb-3 mt-12 font-bold text-gray-700">Credentials & Users</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-500">Total Credentials</p>
                <h2 className="mt-2 text-2xl font-bold">{metrics.total_credentials}</h2>
              </div>
              <div className="p-6 rounded-lg bg-gray-100">
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
