import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function HLSPlayer({ src, poster, autoPlay = true }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !src) return;

        let hls;

        if (Hls.isSupported()) {
            hls = new Hls({
                xhrSetup: (xhr) => {
                    // Some providers might need specific headers, 
                    // but usually browser handles basic HLS fine if CORS is okay.
                }
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (autoPlay) video.play().catch(e => console.log("Autoplay blocked", e));
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error("Fatal network error encountered, trying to recover");
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error("Fatal media error encountered, trying to recover");
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error("Fatal error, destroying HLS instance");
                            hls.destroy();
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = src;
            video.addEventListener('loadedmetadata', () => {
                if (autoPlay) video.play().catch(e => console.log("Autoplay blocked", e));
            });
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [src, autoPlay]);

    return (
        <video
            ref={videoRef}
            poster={poster}
            className="w-full h-full bg-black"
            controls
            playsInline
            crossOrigin="anonymous"
        />
    );
}