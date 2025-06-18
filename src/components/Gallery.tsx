import { useState, useEffect, useCallback } from "react";
import MediaItem from "./MediaItem";
import UploadArea from "./UploadArea";
import { useAuth } from "../contexts/useAuth";
import { MediaItem as MediaItemType } from "../types";
import { Loader2 } from "lucide-react";

interface GalleryProps {
  type: 'photo' | 'video';
  onItemClick?: (item: MediaItemType) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ type }) => {
  const [items, setItems] = useState<MediaItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:3001/api/items");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch items");
      }
      const data = await response.json();
      // Filter items based on type
      const filteredItems = data.filter((item: MediaItemType) => 
        type === 'photo' ? item.type === 'image' : item.type === 'video'
      );
      setItems(filteredItems);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]); // Refetch when type changes

  const handleFileUpload = async (file: File, onProgress?: (progress: number) => void) => {
    if (!isAuthenticated) {
      setError("Please log in to upload files");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      
      // Create a promise to handle the upload
      const uploadPromise = new Promise<MediaItemType>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            onProgress?.(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText) as MediaItemType;
              resolve(data);
            } catch {
              reject(new Error("Invalid server response"));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error || "Upload failed"));
            } catch {
              reject(new Error(xhr.responseText || "Upload failed"));
            }
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error occurred during upload"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload was cancelled"));
        });

        xhr.addEventListener("timeout", () => {
          reject(new Error("Upload timed out"));
        });
      });

      xhr.open("POST", "http://localhost:3001/api/upload");
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      
      // Set a longer timeout for large files
      xhr.timeout = 300000; // 5 minutes
      
      // Start the upload
      xhr.send(formData);

      // Wait for the upload to complete
      const data = await uploadPromise;

      if ((type === 'photo' && data.type === 'image') || 
          (type === 'video' && data.type === 'video')) {
        setItems(prevItems => [...prevItems, data]);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      onProgress?.(0); // Reset progress on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (item: MediaItemType) => {
    if (!isAuthenticated) {
      setError("Please log in to delete files");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`http://localhost:3001/api/items/${item.filename}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete item");
      }

      setItems((prevItems) => prevItems.filter((i) => i.filename !== item.filename));
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const handleUpdateDate = async (item: MediaItemType, newDate: string) => {
    if (!isAuthenticated) {
      setError("Please log in to update files");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`http://localhost:3001/api/items/${item.filename}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: newDate }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update date");
      }

      const data = await response.json();
      setItems((prevItems) =>
        prevItems.map((i) =>
          i.filename === item.filename ? data : i
        )
      );
    } catch (err) {
      console.error("Error updating date:", err);
      setError(err instanceof Error ? err.message : "Failed to update date");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isAuthenticated && (
        <div className="mb-8">
          <UploadArea onUpload={handleFileUpload} isUploading={isUploading} />
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {isAuthenticated 
            ? `No ${type === 'photo' ? 'photos' : 'videos'} found. Upload some to get started!`
            : `No ${type === 'photo' ? 'photos' : 'videos'} found. Log in to upload.`
          }
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <MediaItem
              key={item.filename}
              item={item}
              onDelete={handleDelete}
              canEdit={isAuthenticated}
              onDateChange={(updatedItem) => handleUpdateDate(updatedItem, updatedItem.uploadDate)}
            />
          ))}
        </div>
      )}
    </div>
  );
};