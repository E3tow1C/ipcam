"use client";

import { authLogin, loginResponse, userCredential } from '@/services/apis';
import { faChartPie, faCheck, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/navigation';
import{ useState } from 'react'
import { Toaster } from 'react-hot-toast'

function Page() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const router = useRouter();

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const handleLogin = async () => {
        setIsLoading(true);
        setError("");

        try {
            const userCredential: userCredential = {
                username: username,
                password: password,
            };

            const response: loginResponse = await authLogin(userCredential);

            if (response.success) {
                await delay(3000);
                router.push("/");
            }
            
            if (!response.success && response.message) {
                await delay(3000);
                setError(response.message);
            }
           
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(String(error));
            }
        }

        setIsLoading(false);
    };

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    return (
        <div className="h-screen flex flex-col">
            <Toaster />
            <div className="flex flex-1">
                <div className="flex-1 relative h-svh overflow-scroll">
                    <nav className="w-full flex items-center justify-center bg-gradient-to-br h-64 from-blue-500 to-blue-400">
                        <div className="flex items-center gap-2 mb-20">
                            <FontAwesomeIcon icon={faChartPie} className="w-16 h-16 text-white" />
                            <div className="flex flex-col gap-1">
                                <h1 className="text-2xl font-bold leading-none text-gray-100 flex items-center">
                                    CoE KKU
                                </h1>
                                <p className="text-base text-gray-50 leading-none">
                                    Access control system
                                </p>
                            </div>
                        </div>
                    </nav>
                    <div className="absolute left-0 right-0 top-44">
                        <div className="bg-white rounded-xl border w-[90%] max-w-[600px] py-10 mx-auto flex items-center justify-center text-white text-start">
                            <form className="w-[90%] mx-auto">
                                <h1 className="text-xl text-gray-700 font-bold ml-1 mb-6">Login</h1>
                                <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="name">Username</label>
                                <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="username" type="text" onChange={handleUsernameChange} />

                                <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="password">Password</label>
                                <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="password" type="password" onChange={handlePasswordChange}/>

                                <button className={`${isLoading ? "bg-blue-600" : "bg-blue-500"} text-white w-full mt-6 px-3 py-2 flex items-center justify-center rounded-md hover:bg-blue-600 transition-all disabled:opacity-70`} disabled={isLoading} onClick={handleLogin}>
                                    <FontAwesomeIcon icon={isLoading ? faCircleNotch : faCheck} spin={isLoading} className="mr-2 h-4" />
                                    Login
                                </button>
                                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page