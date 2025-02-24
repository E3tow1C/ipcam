"use client";
import { captureCameraImage, captureImage } from "@/services/apis";
import { faCircleNotch, faCameraAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import toast from "react-hot-toast";

interface Camera {
    name: string;
    url: string;
}

export default function CaptureSection({ camera, cameraId }: { camera: Camera; cameraId: string }) {
    const [isCapturing, setIsCapturing] = useState(false);
    const [images, setImages] = useState<string[]>([]);

    const handleCapture = async () => {
        if (isCapturing) return;
        setIsCapturing(true);
        toast.promise(
            captureCameraImage(cameraId),
            {
                loading: "Capturing image...",
                success: (data) => {
                    setIsCapturing(false);
                    setImages((prev) => [data, ...prev]);
                    return "Image captured successfully";
                },
                error: (error) => {
                    setIsCapturing(false);
                    return error.message;
                },
            },
            { position: "bottom-right" }
        );
    };

    return (
        <>
            <div className="w-[90%] max-w-[800px] mx-auto my-3 bg-white z-10 border rounded-xl">
                <div className="flex items-center justify-between p-3">
                    <h2 className="text-lg font-bold ml-2">{camera.name}</h2>
                    <button
                        className="bg-blue-500 text-white px-3 py-2 rounded-md disabled:opacity-70"
                        onClick={handleCapture}
                        disabled={isCapturing}
                    >
                        {isCapturing ? (
                            <FontAwesomeIcon icon={faCircleNotch} className="animate-spin mr-2" />
                        ) : (
                            <FontAwesomeIcon icon={faCameraAlt} className="mr-2" />
                        )}
                        Take Picture
                    </button>
                </div>
            </div>
            <div className="w-[90%] max-w-[800px] mx-auto my-5 bg-white z-10">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.reverse().map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt="captured-image"
                      className="object-cover border rounded-xl animate-slide-up"
                    />
                  </div>
                ))}
              </div>
            </div>
        </>
    );
}