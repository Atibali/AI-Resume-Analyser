import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  accept?: Record<string, string[]>
}

export function FileUploader({ onFileSelect, accept = { 'application/pdf': ['.pdf'] } }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        <div className="text-3xl">📄</div>
        {isDragActive ? (
          <>
            <p className="text-lg font-semibold text-blue-600">Drop your PDF here</p>
            <p className="text-sm text-gray-600">Release to upload</p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-gray-900">
              Drag and drop your resume
            </p>
            <p className="text-sm text-gray-600">or click to select a file</p>
            <p className="text-xs text-gray-500 mt-2">PDF files only (Max 10MB)</p>
          </>
        )}
      </div>
      {acceptedFiles.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">✓ {acceptedFiles[0].name}</p>
        </div>
      )}
    </div>
  )
}
