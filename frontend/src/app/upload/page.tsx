'use client'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCircleCheck, faImage, faUpload } from "@fortawesome/free-solid-svg-icons";
import Sidebar from "@/components/SideBar";
import { useState } from "react";
import { uploadImage } from "@/services/apis";
import { Toaster, toast } from "react-hot-toast";

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      setFileName(file.name);

      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      setFileName(file.name);

      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleCancel = () => {
    setImagePreview(null);
    setFileName(null);
  };

  const handleUpload = async () => {
    if (!imagePreview) return;
    const imageBlob = await fetch(imagePreview).then(res => res.blob());
    const imageFile = new File([imageBlob], fileName ?? "noname", { type: imageBlob.type });

    toast.promise(
      uploadImage(imageFile),
      {
        loading: 'Uploading...',
        success: 'Image uploaded successfully!',
        error: (err) => `Upload failed: ${err.message}`,
      },
      {
        position: "bottom-right",
      }
    );

    setImagePreview(null);
  };

  return (
    <div className="h-screen flex flex-col">
      <Toaster /> {/* ✅ Add Toaster component */}
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 relative h-svh overflow-scroll">
          <nav className="w-full bg-gradient-to-br h-52 from-blue-500 to-blue-400">
            <h1 className="text-2xl px-12 ml-8 md:ml-0 py-7 md:py-9 font-bold text-white flex items-center">
              Upload Image
            </h1>
          </nav>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`absolute left-0 right-0 top-32 bg-gray-800 rounded-xl 
            w-[90%] max-w-[800px] h-[500px] mx-auto
            shadow-xl
            flex items-center justify-center text-white text-center
            ${isDragging ? 'bg-gray-900 border-4 border-gray-600' : ''}`}
            style={{
              backgroundImage: imagePreview ? `url(${imagePreview})` : 'url(/grid-pattern.webp)',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {imagePreview ? (
              <div className="w-full h-full flex items-end justify-center bg-gradient-to-t from-black to-transparent p-6 rounded-xl">
                <div className="flex justify-between w-full gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-white text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 transition-all"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    className="px-4 py-2 bg-white text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 transition-all"
                  >
                    <FontAwesomeIcon icon={faCircleCheck} className="mr-2" />
                    Upload this image
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <FontAwesomeIcon icon={faImage} className="w-24 h-24 mb-4 text-gray-300" />
                <h2 className="text-xl mb-16 text-gray-300">
                  Drag and drop your image here
                  <span className="block text-lg text-gray-400 mt-2">
                    you can also browse your file
                  </span>
                </h2>
                <label
                  htmlFor="fileInput"
                  className="px-6 py-3 bg-white text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 transition-all"
                >
                  <FontAwesomeIcon icon={faUpload} className="mr-2" />
                  Browse file
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
