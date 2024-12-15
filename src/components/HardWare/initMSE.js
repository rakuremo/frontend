/**
 * @author Hiếu đẹp trai vl
 */

import { toast } from "react-toastify";

// Queue này cho buffer
let mseQueue = [];

const MEDIA_HANDSHAKE_FLAG_INT = 9

// Default flag, ai maintain nên làm lại đoạn này
let mseSourceBuffer, mseStreamingStarted = false;

export function initializeMSEWebSocket(videoElement, cameraUrl) {
    let wsURL = ""
    // Convert https sang url socket có ssl
    try {
        if (cameraUrl.startsWith("https")) {
            // https://camera.rakuremo.jp/stream/5572b5fb-b818-4c08-b1d0-cf9e21d68411/channel/0/mse
            // -> wss://camera.rakuremo.jp/stream/5572b5fb-b818-4c08-b1d0-cf9e21d68411/channel/0/mse
            wsURL = "wss".concat(cameraUrl.substring(5))
        } else if ((cameraUrl.startsWith("https"))) {
            wsURL = "ws".concat(cameraUrl.substring(4))
        } else throw new Error("[Debug] Camera link does not start with https or http")
    } catch (e) {
        toast.error("Camera link may not in right format, please contact adminstrator (must start with https or http)")
        return;
    }
    // Gắn object vào src 
    const mse = new MediaSource();
    videoElement.src = URL.createObjectURL(mse);
    // Event khi video element đã nhận mse
    mse.addEventListener('sourceopen', () => {
        const ws = new WebSocket(wsURL);
        ws.binaryType = "arraybuffer";
        ws.onopen = () => {
            console.log('Đã mở kết nối thành công với nguồn camera');
        }
        ws.onmessage = (event) => {
            let data = new Uint8Array(event.data);
            let mimeCodec
            if (data[0] == MEDIA_HANDSHAKE_FLAG_INT) {
                let decoded_arr = data.slice(1);
                if (window.TextDecoder) {
                    mimeCodec = new TextDecoder("utf-8").decode(decoded_arr);
                } else {
                    mimeCodec = Utf8ArrayToStr(decoded_arr);
                }
                if (mimeCodec.indexOf(',') > 0) {
                    videoSound = true;
                }
                // Đảm bảo là mse open trước khi đẩy buffer
                let attempts = 0;
                const maxAttempts = 3;
                const checkAndAddSourceBuffer = () => {
                    if (mse.readyState === 'open') {
                        mseSourceBuffer = mse.addSourceBuffer('video/mp4; codecs="' + mimeCodec + '"');
                        mseSourceBuffer.mode = "segments";
                        mseSourceBuffer.addEventListener("updateend", pushPacket);
                    } else if (attempts < maxAttempts) {
                        console.log("current state: ", mse.readyState)
                        attempts++;
                        setTimeout(checkAndAddSourceBuffer, 100);
                    } else {
                        console.error("MediaSource is not open yet after multiple attempts.");
                    }
                };
                checkAndAddSourceBuffer();
            } else {
                readPacket(event.data);
            }
        };
    }, false);
    videoElement.addEventListener('loadeddata', () => {
        videoElement.play();
    });

    videoElement.addEventListener('pause', () => {
        if (videoElement.currentTime > videoElement.buffered.end((videoElement.buffered.length - 1))) {
            videoElement.currentTime = videoElement.buffered.end((videoElement.buffered.length - 1)) - 0.1;
            videoElement.play();
        }
    });

    videoElement.addEventListener('error', () => {
        console.log('video_error');
    });
}

// Process packet từ source buffer
function readPacket(packet) {
    if (!mseSourceBuffer) {
        console.error("mseSourceBuffer is not initialized.");
        return;
    }
    if (!mseStreamingStarted) {
        mseSourceBuffer.appendBuffer(packet);
        mseStreamingStarted = true;
        return;
    }
    mseQueue.push(packet);
    if (!mseSourceBuffer.updating) {
        pushPacket();
    }
}

// Push từ queue sang source buffer
function pushPacket() {
    if (!mseSourceBuffer) {
        console.error("mseSourceBuffer is not initialized.");
        return;
    }
    if (!mseSourceBuffer.updating) {
        if (mseQueue.length > 0) {
            let packet = mseQueue.shift();
            mseSourceBuffer.appendBuffer(packet);
        } else {
            mseStreamingStarted = false;
        }
    }

    // TODO: maintain phần sound
    // if (videoElement.buffered.length > 0) {
    //     if (typeof document.hidden !== "undefined" && document.hidden && !videoSound) {
    //         videoElement.currentTime = videoElement.buffered.end((videoElement.buffered.length - 1)) - 0.5;
    //     }
    // }
}
