import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface UploadAreaProps {
  onUpload: (file: File, onProgress?: (progress: number) => void) => Promise<void>;
  isUploading?: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onUpload, isUploading = false }) => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    try {
      setUploadProgress(0);
      await onUpload(file, (progress) => {
        setUploadProgress(progress);
      });
      setUploadProgress(100);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress(0);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.webm', '.mov']
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} disabled={isUploading} />
      <div className="flex flex-col items-center gap-4">
        <Upload className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        <div className="text-lg font-medium">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <span>Uploading...</span>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
          ) : isDragActive ? (
            "Drop your file here"
          ) : (
            "Drag and drop a file here, or click to select"
          )}
        </div>
        <p className="text-sm text-gray-500">
          Supported formats: JPG, PNG, GIF, MP4, WebM, MOV (max 500MB)
        </p>
      </div>
    </div>
  );
};

export default UploadArea;