/* eslint-disable @next/next/no-img-element */
"use client";
import { captureCameraImage, deleteCamera, updateCamera } from "@/services/apis";
import { faCircleNotch, faCameraAlt, faPen, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import toast from "react-hot-toast";

interface Camera {
    name: string;
    url: string;
    location: string;
    username?: string;
    password?: string;
    authType?: "basic" | "digest";
}

export default function CaptureSection({ camera, cameraId }: { camera: Camera; cameraId: string }) {
    const [isCapturing, setIsCapturing] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [isConfiguring, setIsConfiguring] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [message, setMessage] = useState<string>('');
    const [isAuth, setIsAuth] = useState<boolean>((camera.username && camera.password) ? true : false);
    const [formData, setFormData] = useState({
        name: camera.name,
        location: camera.location,
        url: camera.url,
        username: camera.username || '',
        password: camera.password || '',
        authType: camera.authType || 'basic'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

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

    const handleDeleteCamera = async () => {
        const isDeleted = await deleteCamera(cameraId);
        if (isDeleted) {
            window.location.href = '/ipcam';
        }
    };

    const handleUpdateCamera = async () => {
        if (!formData.name || !formData.url || !formData.location) {
            setMessage('Please fill all fields');
            return;
        }

        const newCameraData = {
            name: formData.name,
            url: formData.url,
            location: formData.location,
            username: formData.username,
            password: formData.password,
            authType: formData.authType
        }

        const updatedCamera = await updateCamera(cameraId, newCameraData.name, newCameraData.url, newCameraData.location, newCameraData.username, newCameraData.password, newCameraData.authType);
        if (updatedCamera) {
            window.location.reload();
        }
    }

    return (
        <>
            <div className="w-[90%] max-w-[800px] mx-auto my-3 bg-white z-10 border rounded-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between p-3">
                    <h2 className="text-lg font-bold ml-2 mb-2 lg:mb-0">{camera.name}</h2>
                    <div className="flex gap-2">
                        {
                            !isConfiguring && (
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
                            )
                        }
                        <button
                            className="bg-gray-500 text-white px-3 py-2 rounded-md disabled:opacity-70"
                            onClick={() => {
                                setIsConfiguring(!isConfiguring)
                                if (!isConfiguring) {
                                    setFormData({
                                        name: camera.name,
                                        location: camera.location,
                                        url: camera.url,
                                        username: camera.username || '',
                                        password: camera.password || '',
                                        authType: camera.authType || 'basic'
                                    });
                                }
                            }}
                        >
                            {
                                isConfiguring ? (
                                    <>
                                        <FontAwesomeIcon icon={faXmark} className="mr-2" />
                                        Cancel
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faPen} className="mr-2" />
                                        Configuration
                                    </>
                                )
                            }
                        </button>
                        <button className="bg-red-400 text-white px-3 py-2 rounded-md disabled:opacity-70" onClick={handleDeleteCamera}>
                            <FontAwesomeIcon icon={faXmark} className="mr-2" />
                            Delete
                        </button>
                    </div>
                </div>
                {
                    isConfiguring && (
                        <form className="w-[90%] mx-auto mb-10"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateCamera();
                            }}
                        >
                            <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="name">Camera Name</label>
                            <input
                                className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="name"
                                type="text"
                                placeholder="Name for new camera"
                                value={formData.name}
                                onChange={handleInputChange}
                            />


                            <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="location">Location</label>
                            <input
                                className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="location"
                                type="text"
                                placeholder="Location of camera"
                                value={formData.location}
                                onChange={handleInputChange}
                            />
                            <p className="text-gray-600 font-semibold mt-6">
                                Camera Configuration
                            </p>

                            <label className="block text-gray-500 text-sm mb-1 mt-2 ml-1" htmlFor="cameraUrl">Camera URL</label>
                            <input
                                className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="cameraUrl"
                                type="text"
                                placeholder="Camera URL or IP"
                                value={formData.url}
                                onChange={handleInputChange}
                            />

                            <div className="flex items-center mt-4 ml-1 mb-4 gap-2">
                                <input type="checkbox" id="auth" name="auth" value="auth" onChange={() => setIsAuth(!isAuth)} checked={isAuth} />
                                <label htmlFor="auth" className="text-gray-500 select-none"> Camera Authentication</label>
                            </div>

                            {
                                isAuth &&
                                <>
                                    <label className="block text-gray-500 text-sm mb-1 ml-1" htmlFor="location">Username</label>
                                    <input
                                        className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="username"
                                        type="text"
                                        placeholder="Camera Username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        disabled={!isAuth}
                                    />

                                    <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="location">Password</label>
                                    <input
                                        className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="password"
                                        type="password"
                                        placeholder="Camera Password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        disabled={!isAuth}
                                    />

                                    <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="location">Auth Type</label>
                                    <select
                                        className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-6"
                                        id="authType"
                                        value={formData.authType}
                                        onChange={handleInputChange}
                                        disabled={!isAuth}
                                    >
                                        <option value="basic">Basic</option>
                                        <option value="digest">Digest</option>
                                    </select>
                                </>
                            }

                            <p className="text-red-500 text-sm mb-2">{message}</p>
                            <button className="bg-blue-500 text-white w-full px-3 py-2 rounded-md hover:bg-blue-600 transition-all disabled:opacity-70">
                                <FontAwesomeIcon icon={faCheck} className="mr-2 h-3" />
                                Done
                            </button>
                        </form>
                    )
                }
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