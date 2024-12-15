import { useEffect } from "react";
import Hls from "hls.js";
import { initializeMSEWebSocket } from "./initMSE";
import { toast } from "react-toastify";

const getGridClass = (camerasPerPage) => {
    switch (camerasPerPage || 1) {
        case 1:
            return "grid-cols-1";
        case 2:
            return "grid-cols-2";
        case 4:
            return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"; // Split into 4 cameras
        case 6:
            return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3"; // Split into 6 cameras
        default:
            return "grid-cols-1";
    }
};

export default function CameraGrid({ selectedCameras, camerasPerPage }) {
    useEffect(() => {
        selectedCameras.forEach((camera, index) => {
            const video = document.getElementById(`video-${index}`);

            if (camera.camera_url.endsWith("/mse")) {
                initializeMSEWebSocket(video, camera.camera_url);
            } else if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(camera.camera_url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play();
                });
            } else if (video) {
                video.src = camera.camera_url;
                video.addEventListener("loadedmetadata", () => {
                    video.play();
                });
            }
        });

        return () => {
            selectedCameras.forEach((camera, index) => {
                const video = document.getElementById(`video-${index}`);
                if (video) {
                    video.pause();
                }
            });
        };
    }, [selectedCameras]);

    return (
        <div className={`grid gap-4 ${getGridClass(camerasPerPage)}`}>
            {selectedCameras.map((camera, index) => (
                <div key={index} className="relative w-full" style={{ paddingBottom: `${(9 / 16) * 100}%` }}>
                    <video
                        id={`video-${index}`}
                        className="absolute left-0 top-0 w-full h-full"
                        controls
                        onError={() => toast.error("Error playing stream")}
                    />
                </div>
            ))}
        </div>
    );
}
