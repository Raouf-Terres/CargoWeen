//src/components/fileupload.js
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

const FileUpload = ({ onFileSelect }) => {
  const [fileName, setFileName] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setFileName(file.name)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
  })

  return (
    <div {...getRootProps()} className="file-upload">
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Déposez le fichier PDF ici...</p>
      ) : fileName ? (
        <p>Fichier sélectionné : <strong>{fileName}</strong></p>
      ) : (
        <p>Glissez-déposez un fichier PDF ici, ou cliquez pour sélectionner</p>
      )}
     <style jsx>{`
  .file-upload {
    border: 2px dashed #d1d5db;
    border-radius: 0.375rem;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f9fafb;
  }
  .file-upload:hover {
    border-color: #3b82f6;
    background-color: #f0f4f8;
  }
  p {
    margin: 0;
    color: #4b5563;
    font-size: 0.875rem;
    text-align: center;
    line-height: 1.25rem;
  }
`}</style>
    </div>
  )
}

export default FileUpload