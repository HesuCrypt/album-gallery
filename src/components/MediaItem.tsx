import React, { useState } from 'react';
import { Trash2, Calendar, Edit2, X } from 'lucide-react';
import { MediaItem as MediaItemType } from '../types';

interface MediaItemProps {
  item: MediaItemType;
  onDelete: (item: MediaItemType) => void;
  canEdit: boolean;
  onDateChange?: (item: MediaItemType) => void;
}

const MediaItem: React.FC<MediaItemProps> = ({ item, onDelete, canEdit, onDateChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(item.uploadDate.split('T')[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateChange = () => {
    if (onDateChange) {
      onDateChange({
        ...item,
        uploadDate: new Date(tempDate).toISOString()
      });
    }
    setIsEditingDate(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this item?')) {
      setIsDeleting(true);
      try {
        await onDelete(item);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't expand if clicking on delete button or date controls
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input')
    ) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative group">
      <div
        onClick={handleClick}
        className="relative aspect-square overflow-hidden rounded-lg cursor-pointer bg-gray-100 hover:opacity-90 transition-opacity"
      >
        {item.type === 'image' ? (
          <img
            src={item.url}
            alt={item.filename}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={item.url}
            className="w-full h-full object-cover"
            controls
            playsInline
          />
        )}
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={() => setIsExpanded(false)}>
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={() => setIsExpanded(false)}
          >
            <X size={24} />
          </button>
          <div className="relative max-w-[90vw] max-h-[90vh] w-auto h-auto" onClick={e => e.stopPropagation()}>
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.filename}
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
              />
            ) : (
              <video
                src={item.url}
                className="max-w-full max-h-[90vh] w-auto h-auto"
                controls
                playsInline
                autoPlay
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <p className="text-sm">{formatDate(item.uploadDate)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Calendar size={16} />
            {isEditingDate ? (
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="text-sm bg-white text-black px-2 py-1 rounded"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDateChange();
                  }}
                  className="text-sm bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingDate(false);
                  }}
                  className="text-sm bg-gray-500 hover:bg-gray-600 px-2 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <span className="text-sm">
                {formatDate(item.uploadDate)}
                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingDate(true);
                    }}
                    className="ml-2 text-gray-300 hover:text-white"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </span>
            )}
          </div>
          {canEdit && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaItem;