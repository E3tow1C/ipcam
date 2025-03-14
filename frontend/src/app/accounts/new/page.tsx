"use client";

import Sidebar from "@/components/SideBar";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import { createAccount } from "./CreateAccount";
import { useActionState } from "react";

const initialState = {
  message: '',
  errors: {}
};

export default function Home() {
  const [state, formAction] = useActionState(createAccount, initialState);

  return (
    <div className="h-screen flex flex-col">
      <Toaster />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 relative h-svh overflow-scroll">
          <nav className="w-full bg-gradient-to-br h-52 from-blue-500 to-blue-400">
            <h1 className="text-2xl px-12 ml-8 md:ml-0 py-7 md:py-9 font-bold text-white flex items-center">
              <Link href={`/accounts`}><FontAwesomeIcon icon={faAngleLeft} className="h-6 w-6 mr-1"/>Accounts</Link> 
              <span className="text-gray-200 ml-2 font-normal"><span>/</span> New Account</span>
            </h1>
          </nav>
          <div className="absolute left-0 right-0 top-32">
            <div className="bg-white rounded-xl border w-[90%] max-w-[800px] py-10 mx-auto flex items-center justify-center text-white text-start">
                <form className="w-[90%] mx-auto" action={formAction}>
                    <h1 className="text-xl text-gray-700 font-bold ml-1">New Account</h1>
                    <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="name">Username</label>
                    <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    id="name" name="username" type="text" placeholder="Name for new camera" />
                    {state.errors?.username && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{state.errors.username.join(', ')}</p>
                      )}

                    <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="password">Password</label>
                    <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="password" name="password" type="password" placeholder="Password" />
                    {state.errors?.password && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{state.errors.password.join(', ')}</p>
                      )}

                    <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="confirmPassword">Confirm Password</label>
                    <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm Password" />
                    {state.errors?.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{state.errors.confirmPassword.join(', ')}</p>
                      )}

                    <p className="text-red-500 text-xs mt-1 ml-1">{state.message}</p>

                    <button type="submit" className="bg-blue-500 text-white w-full mt-6 px-3 py-2 rounded-md hover:bg-blue-600 transition-all disabled:opacity-70">
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
