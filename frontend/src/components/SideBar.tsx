'use client'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faChartPie, faImage, faKey, faUpload, faUserAlt, faVideoCamera, faXmark } from "@fortawesome/free-solid-svg-icons";
import MenuItem from "./MenuItem";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";
import jwt from "jsonwebtoken";
import Cookies from "js-cookie";

const Sidebar: React.FC = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [username, setUsername] = useState<string>("");
  const token = Cookies.get("access_token");

  useEffect(() => {
    if (token) {
      const decoded = jwt.decode(token);
      const username = decoded ? decoded["sub"] : "";
      setUsername(username!);
    }
  }, [token]);

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-gray-100 p-6 transition-all duration-300 animate-slide-in-left
        ${isSidebarVisible ? "max-w-[400px] w-full flex flex-col justify-between" : "w-0 hidden"} 
        md:hidden`}
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faChartPie} className="w-11 h-11 text-blue-600" />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold leading-none text-blue-600 flex items-center">
              IPCam Manager
            </h1>
            <p className="text-sm text-gray-500 leading-none">
              Access control system
            </p>
          </div>
          <button
            onClick={() => setIsSidebarVisible(prev => !prev)}
            className="ml-auto"
          >
            <FontAwesomeIcon icon={faXmark} className="text-2xl text-gray-500" />
          </button>

        </div>
        <div className="mt-9 flex flex-col gap-1">
          <MenuItems />
        </div>
        <UserCard />
      </aside>

      <button
        onClick={() => setIsSidebarVisible(prev => !prev)}
        className="fixed top-6 left-6 z-40 p-2 w-10 h-10 bg-gray-100 text-gray-500 rounded-lg md:hidden"
      >
        <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
      </button>

      <aside className="hidden md:flex w-[300px] bg-gray-100 p-6 h-full flex-col justify-between">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faChartPie} className="w-11 h-11 text-blue-600" />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold leading-none text-blue-600 flex items-center">
              IPCam Manager
            </h1>
            <p className="text-sm text-gray-500 leading-none">
              Access control system
            </p>
          </div>
        </div>
        <div className="mt-9 flex flex-col gap-1">
          <MenuItems />
        </div>
        <UserCard username={username} />
      </aside>
    </>
  );
};

export default Sidebar;

function MenuItems() {
  return (
    <>
      <MenuItem href="/" icon={faChartPie} label="Dashboard" />
      <MenuItem href="/images" icon={faImage} label="Gallery" />
      <MenuItem href="/upload" icon={faUpload} label="Upload" />
      <MenuItem href="/ipcam" icon={faVideoCamera} label="IP Cameras" />
      <div className="w-[90%] mx-auto my-3 h-[1px] bg-gray-200"></div>
      <MenuItem href="/accounts" icon={faUserAlt} label="Accounts" />
      <MenuItem href="/credentials" icon={faKey} label="Credentials" />
    </>
  )
}