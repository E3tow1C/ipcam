'use client';
import Sidebar from "@/components/SideBar";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import { createNewCredential } from "@/services/apis";
import { useState } from "react";

export default function Home() {
  const [noExp, setNoExp] = useState<boolean>(false);

  const handleAddCredential = async () => {
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const host = (document.getElementById('url') as HTMLInputElement).value;
    const expire = (document.getElementById('exp') as HTMLInputElement).value;

    if (!name || !host) {
      toast.error('Please fill all fields');
      return;
    }

    if (!noExp && !expire) {
      toast.error('Please select expiry date');
      return;
    }

    const newCredential = await createNewCredential(name, host, noExp ? undefined : new Date(expire));
    if (newCredential) {
      window.location.href = '/credentials';
    } else {
      toast.error('Failed to add credential');
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
              <Link href={`/credentials`}><FontAwesomeIcon icon={faAngleLeft} className="h-6 w-6 mr-1"/>Credentials</Link> 
              <span className="text-gray-200 ml-2 font-normal"><span>/</span> New Credentials</span>
            </h1>
          </nav>
          <div className="absolute left-0 right-0 top-32">
            <div className="bg-white rounded-xl border w-[90%] max-w-[800px] py-10 mx-auto flex items-center justify-center text-white text-start">
                <form className="w-[90%] mx-auto" onSubmit={(e) => { e.preventDefault(); handleAddCredential(); }}>
                    <h1 className="text-xl text-gray-700 font-bold ml-1">New Credentials</h1>
                    <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="name">Service Name</label>
                    <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    id="name" type="text" placeholder="Name for service" />

                    <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="url">Service URL/IP Address</label>
                    <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    id="url" type="text" placeholder="example: https://example.com" />
                    <p className="text-xs text-gray-400 ml-1 mt-2">
                      Note: The URL/IP address will be used to configure Cross-Origin Resource Sharing (CORS) policies for secure API access
                    </p>

                    <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor="exp">Credentials Expiry Date</label>
                    <input className="bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:opacity-50"
                    id="exp" type="date" placeholder="Expiry Date" min={new Date().toISOString().split('T')[0]} disabled={noExp} />
                    <div className="flex items-center mt-2 ml-1 gap-2">
                      <input type="checkbox" id="no-exp" name="no-exp" value="no-exp" onChange={() => setNoExp(!noExp)} />
                      <label htmlFor="no-exp" className="text-gray-500 select-none"> No Expiry</label>
                    </div>

                    <button className="bg-blue-500 text-white w-full mt-6 px-3 py-2 rounded-md hover:bg-blue-600 transition-all disabled:opacity-70">
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
