'use client';
import Sidebar from "@/components/SideBar";
import { addCamera } from "@/services/apis";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function Home() {
    const [message, setMessage] = useState<string>('');
    const [isAuth, setIsAuth] = useState<boolean>(false);

    const handleAddCamera = async () => {
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const cameraUrl = (document.getElementById('cameraUrl') as HTMLInputElement).value;
        const location = (document.getElementById('location') as HTMLInputElement).value;

        let username = '';
        let password = '';
        let authType = '';

        if (isAuth) {
            username = (document.getElementById('username') as HTMLInputElement).value;
            password = (document.getElementById('password') as HTMLInputElement).value;
            authType = (document.getElementById('authType') as HTMLSelectElement).value;
        }

        if (!name || !cameraUrl || !location) {
            setMessage('Please fill all fields');
            return;
        }

        const camera = {
            name,
            url: cameraUrl,
            location,
            username,
            password,
            authType
        };

        const newCamera = await addCamera(camera.name, camera.url, camera.location, camera.username, camera.password, camera.authType);
        if (newCamera) {
            window.location.href = '/ipcam';
        } else {
            setMessage('Failed to add camera');
        }
    }

    return (
        <div className="h-screen flex flex-col">
            <Toaster />
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1 relative h-svh overflow-scroll">
                    <nav className="w-full bg-gradient-to-br h-52 from-blue-500 to-blue-400">
                        <h1 className="text-2xl px-12 ml-8 md:ml-0 py-7 md:py-9 font-bold text-white flex items-center">
                            <Link href={`/ipcam`}><FontAwesomeIcon icon={faAngleLeft} className="h-6 w-6 mr-1" />IP Cameras</Link>
                            <span className="text-gray-200 ml-2 font-normal"><span>/</span> New Camera</span>
                        </h1>
                    </nav>
                    <div className="absolute left-0 right-0 top-32">
                        <div className="bg-white rounded-xl border w-[90%] max-w-[800px] py-10 mx-auto flex mb-10 items-center justify-center text-white text-start">
                            <form className="w-[90%] mx-auto"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleAddCamera();
                                }}
                            >
                                <h1 className="text-xl text-gray-700 font-bold ml-1">New Camera</h1>
                                <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="name">Camera Name</label>
                                <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="name" type="text" placeholder="Name for new camera" />


                                <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="location">Location</label>
                                <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="location" type="text" placeholder="Location of camera" />

                                <p className="text-gray-600 font-semibold mt-6">
                                    Camera Configuration
                                </p>

                                <label className="block text-gray-500 text-sm mb-1 mt-2 ml-1" htmlFor="cameraUrl">Camera URL</label>
                                <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="cameraUrl" type="text" placeholder="Camera URL or IP" />

                                <div className="flex items-center mt-4 ml-1 mb-4 gap-2">
                                    <input type="checkbox" id="auth" name="auth" value="auth" onChange={() => setIsAuth(!isAuth)} checked={isAuth} />
                                    <label htmlFor="auth" className="text-gray-500 select-none"> Camera Authentication</label>
                                </div>

                                {
                                    isAuth && 
                                    <>
                                        <label className="block text-gray-500 text-sm mb-1 ml-1" htmlFor="username">Username</label>
                                        <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="username" type="text" placeholder="Camera Username"/>
                                        
                                        <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="password">Password</label>
                                        <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            id="password" type="password" placeholder="Camera Password"/>

                                        <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="authType">Auth Type</label>
                                        <select className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-6"
                                            id="authType"
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
