'use client'
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItemProps {
  href: string;
  icon: IconProp;
  label: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ href, icon, label }) => {
  const currentPath = usePathname();
  
  return (
    <Link
      href={href}
      className={`block py-2 px-4 rounded-lg box-content ${currentPath === href ? "bg-white text-gray-600 border" : "text-gray-500 border border-gray-100 hover:bg-white hover:bg-opacity-90 transition-all"}`}
    >
      <FontAwesomeIcon icon={icon} className="mr-2 w-6" />
      {label}
    </Link>
  );
};

export default MenuItem;
