import React, { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const togglePlayback = () => {
    if (iframeRef.current) {
      const message = isPlaying ? 'pauseVideo' : 'playVideo';
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: message, args: [] }),
        '*'
      );
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [newVolume * 100] }),
        '*'
      );
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlayback}
          className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-gray-600" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16"
          />
        </div>
      </div>
      
      <div className="text-xs text-gray-600 mt-1 text-center">
        Your Universe
      </div>
      
      <iframe
        ref={iframeRef}
        width="0"
        height="0"
        src="https://www.youtube.com/embed/-aTIk86XW1E?enablejsapi=1&autoplay=0&controls=0"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default MusicPlayer;