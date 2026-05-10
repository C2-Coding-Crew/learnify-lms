"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Settings, Maximize } from "lucide-react";

interface CustomVideoPlayerProps {
  videoUrl: string;
  lessonId: number;
}

export default function CustomVideoPlayer({ videoUrl, lessonId }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // Check if it's a YouTube URL
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  const getEmbedUrl = (url: string) => {
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("embed/")) {
      return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  // 1. Load saved position from localStorage
  useEffect(() => {
    if (isYouTube) return;
    
    const savedTime = localStorage.getItem(`lesson_progress_${lessonId}`);
    if (savedTime && videoRef.current) {
      videoRef.current.currentTime = parseFloat(savedTime);
    }
  }, [lessonId, isYouTube]);

  // 2. Save position to localStorage on timeupdate
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    
    if (duration > 0) {
      setProgress((current / duration) * 100);
      localStorage.setItem(`lesson_progress_${lessonId}`, current.toString());
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const value = parseFloat(e.target.value);
    const newTime = (value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(value);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const value = parseFloat(e.target.value);
    videoRef.current.volume = value;
    setVolume(value);
    if (value === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const changeSpeed = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const toggleFullScreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  if (isYouTube) {
    return (
      <iframe
        src={getEmbedUrl(videoUrl)}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <div className="relative w-full h-full group bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="w-full h-1 mb-4 appearance-none bg-white/30 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#FF6B4A] [&::-webkit-slider-thumb]:rounded-full"
          style={{
            background: `linear-gradient(to right, #FF6B4A ${progress}%, rgba(255, 255, 255, 0.3) ${progress}%)`
          }}
        />

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-[#FF6B4A] transition-colors">
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            
            <div className="flex items-center gap-2 group/volume relative">
              <button onClick={toggleMute} className="hover:text-[#FF6B4A] transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={changeVolume}
                className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 appearance-none bg-white/30 rounded-full outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="hover:text-[#FF6B4A] transition-colors flex items-center gap-1 text-sm font-bold"
              >
                {playbackRate}x <Settings size={16} />
              </button>
              
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur rounded-lg p-2 flex flex-col gap-1 min-w-[80px]">
                  {[0.5, 1, 1.5, 2].map(rate => (
                    <button
                      key={rate}
                      onClick={() => changeSpeed(rate)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-md text-left transition-colors ${
                        playbackRate === rate ? "bg-[#FF6B4A] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleFullScreen} className="hover:text-[#FF6B4A] transition-colors">
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
