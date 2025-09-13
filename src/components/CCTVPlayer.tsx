"use client";

import { useState } from "react";
import HLSVideoPlayer from "@/components/HLSVideoPlayer";
import { Play, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CCTVPlayerProps {
  streamURL: string;
}

export default function CCTVPlayer({ streamURL }: CCTVPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    // Small delay to ensure component is rendered before triggering autoplay
    setTimeout(() => {
      setShouldAutoPlay(true);
    }, 100);
  };

  if (!isPlaying) {
    return (
      <div className="relative bg-black rounded-lg shadow-xl overflow-hidden aspect-video flex items-center justify-center">
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
          <Camera className="h-16 w-16 mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">CCTV Live Stream</h3>
          <p className="text-gray-300 mb-6 text-center px-4">
            Klik tombol play untuk memulai streaming video CCTV
          </p>
          <Button 
            onClick={handlePlay}
            size="lg"
            className="flex items-center gap-2 bg-white text-black hover:bg-gray-100"
          >
            <Play className="h-5 w-5" />
            Mulai Streaming
          </Button>
        </div>
        
        {/* Background placeholder */}
        <div className="w-full h-full bg-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-lg shadow-xl overflow-hidden aspect-video">
      <HLSVideoPlayer
        url={streamURL}
        className="w-full h-full"
        autoPlay={shouldAutoPlay}  // Use delayed autoplay
        muted={true}
        controls={true}
      />
    </div>
  );
}
