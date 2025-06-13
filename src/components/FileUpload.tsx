import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { LASFile } from '../types/wellLog';
import { LASParser } from '../utils/lasParser';

interface FileUploadProps {
  onFilesUploaded: (files: LASFile[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesUploaded }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<LASFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await processFiles(files);
    }
  }, []);

  const processFiles = async (files: File[]) => {
    setUploading(true);
    setErrors([]);
    
    const lasFiles: LASFile[] = [];
    const newErrors: string[] = [];

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.las')) {
        newErrors.push(`${file.name}: Not a LAS file`);
        continue;
      }

      try {
        const lasFile = await LASParser.parseLASFile(file);
        lasFiles.push(lasFile);
      } catch (error) {
        newErrors.push(`${file.name}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    }

    setErrors(newErrors);
    setUploadedFiles(prev => [...prev, ...lasFiles]);
    setUploading(false);

    if (lasFiles.length > 0) {
      onFilesUploaded(lasFiles);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".las"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-4">
          <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop your LAS files here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Support for multiple files • Maximum 50MB per file
            </p>
          </div>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Processing files...</p>
            </div>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Upload Errors</h3>
              <ul className="mt-2 text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Successfully Uploaded ({uploadedFiles.length} files)
              </h3>
              <ul className="mt-2 text-sm text-green-700 space-y-1">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    {file.name} - {file.curves.length} curves, {file.data.length} samples
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};