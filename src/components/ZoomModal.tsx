import React from 'react';
import { X } from 'lucide-react';
import { MediaItem } from '../types';

interface ZoomModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

const ZoomModal: React.FC<ZoomModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X size={32} />
        </button>
        
        {item.type === 'photo' ? (
          <img
            src={item.url}
            alt="Zoomed photo"
            className="max-w-full max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <video
            src={item.url}
            controls
            className="max-w-full max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        
        <div className="absolute -bottom-12 left-0 text-white text-sm">
          {item.date}
        </div>
      </div>
    </div>
  );
};

export default ZoomModal;