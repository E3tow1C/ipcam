'use client'
import { useState, useEffect } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/components/SideBar";
import { CameraData, getCameraById } from "@/services/apis";
import toast, { Toaster } from "react-hot-toast";
import CaptureSection from "./CaptureSection";
import Link from "next/link";

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const view = params?.view as string;
  const [camera, setCamera] = useState<CameraData | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!view) router.push("/ipcam");
    if (view.length < 24) return notFound();

    async function fetchCamera() {
      try {
        const response = await getCameraById(view);
        console.log(response);
        setCamera(response);
      } catch {
        return notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchCamera();
  }, [router, view]);

  useEffect(() => {
    async function fetchImage() {
      try {
        if (!camera) return;

        const proxyUrl = new URL('/api/stream', window.location.origin);
        proxyUrl.searchParams.set('url', camera.url);
        
        if (camera.username && camera.password) {
          proxyUrl.searchParams.set('username', camera.username);
          proxyUrl.searchParams.set('password', camera.password);
          proxyUrl.searchParams.set('authType', camera.authType || 'basic');
        } else {
          setImageSrc(camera.url);
          return;
        }

        const response = await fetch(proxyUrl);

        if (!response.ok) {
          toast.dismiss();
          toast.error(`Camera feed not available (${response.status})`);
          return;
        }

        const blob = await response.blob();
        const dataUrl = URL.createObjectURL(blob);
        setImageSrc(dataUrl);
      } catch (error) {
        toast.dismiss();
        toast.error("Camera feed not available");
      }
    }

    fetchImage();
  }, [camera]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <p>Loading camera...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!camera) return null;

  return (
    <div className="h-screen flex flex-col">
      <Toaster />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 relative h-svh overflow-scroll">
          <nav className="w-full bg-gradient-to-br h-52 from-blue-500 to-blue-400">
            <h1 className="text-2xl px-12 ml-8 md:ml-0 py-7 md:py-9 font-bold text-white flex items-center">
              <Link href={`/ipcam`}>
                <FontAwesomeIcon icon={faAngleLeft} className="h-6 w-6 mr-1" />
                IP Cameras
              </Link>
              <span className="text-gray-200 ml-2 font-normal">
                <span>/</span> {camera.name}
              </span>
            </h1>
          </nav>
          <div className="absolute left-0 right-0 top-32">
            <div className="bg-gray-800 rounded-xl w-[90%] max-w-[800px] h-[450px] mx-auto shadow-xl flex items-center justify-center text-white text-center">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={camera.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <>
                  {
                    camera.authType ? (
                      <h4 className="block">Trying to authenticate camera access with {camera.authType} method...</h4>
                    ) : (
                      <p>Loading Camera...</p>
                    )
                  }
                </>
              )}
            </div>
            <CaptureSection camera={camera} cameraId={view} />
          </div>
        </div>
      </div>
    </div>
  );
}
