import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faXmark } from "@fortawesome/free-solid-svg-icons";

interface SidebarHeaderProps {
  showCloseButton?: boolean;
  onClose?: () => void;
}

export default function SidebarHeader({ showCloseButton = false, onClose }: SidebarHeaderProps) {
  return (
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
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="ml-auto"
        >
          <FontAwesomeIcon icon={faXmark} className="text-2xl text-gray-500" />
        </button>
      )}
    </div>
  );
}