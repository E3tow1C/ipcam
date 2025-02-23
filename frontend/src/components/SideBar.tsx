'use client'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faImage, faUpload, faVideoCamera } from "@fortawesome/free-solid-svg-icons";
import MenuItem from "./MenuItem";

const Sidebar: React.FC = () => {
  return (
    <aside className="w-[300px] bg-gray-100 p-6">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faChartPie} className="w-11 h-11 text-blue-600" />
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold leading-none text-blue-600 flex items-center">
            CoE KKU
          </h1>
          <p className="text-sm text-gray-500 leading-none">
            Access control system
          </p>
        </div>
      </div>
      <div className="mt-9 flex flex-col gap-1">
        <MenuItem href="/" icon={faChartPie} label="Dashboard" />
        <MenuItem href="/images" icon={faImage} label="Images" />
        <div className="w-[90%] mx-auto my-3 h-[1px] bg-gray-200"></div>
        <MenuItem href="/upload" icon={faUpload} label="Upload" />
        <MenuItem href="/ipcam" icon={faVideoCamera} label="IP Camera" />
      </div>
    </aside>
  );
};

export default Sidebar;
