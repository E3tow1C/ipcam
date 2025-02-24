import Sidebar from "@/components/SideBar";
import { getAllImages } from "@/services/apis";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default async function Home() {
  const images = await getAllImages();

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 px-12 py-7 md:py-9 h-svh overflow-scroll">
          <nav className="w-full flex items-center">
            <h1 className="text-2xl ml-8 md:ml-0 font-bold text-gray-700 flex items-center">
              Images Gallery
            </h1>
          </nav>
          <main className="mt-8">
            {images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {images.reverse().map((img, index) => (
                  <div key={index} className="overflow-hidden rounded shadow">
                    <img
                      src={img}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 rounded-xl">
               <FontAwesomeIcon icon={faImage} className="h-16 w-16 text-gray-500" />
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
