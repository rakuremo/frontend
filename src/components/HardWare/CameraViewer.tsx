import React, { useState, useEffect } from "react";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import { getCameras } from "@/api/index";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CameraGrid from "./CustomMSE"; // Import the CameraGrid component

interface Camera {
  camera_name: string;
  camera_url: string;
}

interface HardWareId {
  hardwareId: number;
}

const CameraViewer: React.FC<HardWareId> = ({ hardwareId }) => {
  const [cameras, setCameras] = useState<Camera[]>([] as Camera[]);
  const [name, setName] = useState<string>("");
  const [selectedCameras, setSelectedCameras] = useState<Camera[]>([]);
  const [page, setPage] = useState<number>(1);
  const [camerasPerPage, setCamerasPerPage] = useState<number>(1); // Default is 1 camera per page

  const fetchCameras = async () => {
    try {
      const response = await getCameras(hardwareId);
      setCameras(response.data.cameras);
      setName(response.data.hardware_name);

      if (response.data.cameras.length > 0) {
        const start = (page - 1) * camerasPerPage;
        const end = start + camerasPerPage;
        setSelectedCameras(response.data.cameras.slice(start, end));
      }
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
      toast.error("Failed to fetch cameras");
    }
  };

  useEffect(() => {
    fetchCameras();
  }, [hardwareId, camerasPerPage, page]);

  const handleCamerasPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const perPage = parseInt(e.target.value);
    setCamerasPerPage(perPage);
    setPage(1); // Reset to first page when cameras per page changes
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const start = (newPage - 1) * camerasPerPage;
    const end = start + camerasPerPage;
    setSelectedCameras(cameras.slice(start, end));
  };

  return (
    <>
      <Breadcrumb pageName="Hardwares" subPageName={name} />
      <div className="bg-white p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
        <div className="mb-4 w-1/2">
          <label
            htmlFor="cameras-per-page"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Số lượng camera hiển thị cùng lúc
          </label>
          <select
            id="cameras-per-page"
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-300 py-2 pl-3 pr-10 text-base text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
            value={camerasPerPage}
            onChange={handleCamerasPerPageChange}
          >
            <option value={1}>1 camera</option>
            <option value={2}>2 camera</option>
            <option value={4}>4 camera</option>
            <option value={6}>6 camera</option>
          </select>
        </div>

        {/* Use the CameraGrid component to display the selected cameras */}
        <CameraGrid selectedCameras={selectedCameras} camerasPerPage={camerasPerPage}/>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md"
          >
            Trang trước
          </button>
          <span>
            Trang {page} / {Math.ceil(cameras.length / camerasPerPage)}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === Math.ceil(cameras.length / camerasPerPage)}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md"
          >
            Trang sau
          </button>
        </div>
      </div>
    </>
  );
};

export default CameraViewer;
