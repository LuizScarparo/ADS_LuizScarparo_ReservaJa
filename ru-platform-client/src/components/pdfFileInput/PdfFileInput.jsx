import React, { useRef, useState } from 'react'
import { FiPaperclip } from 'react-icons/fi'
import './PdfFileInput.css'

export default function PdfFileInput({
  id = 'pdf-upload',
  label = 'Anexar comprovante',
  onChange,
  placeholder = 'Nenhum arquivo selecionado',
}) {
  const [fileName, setFileName] = useState('')
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFileName(file.name)
      onChange?.(file)
    }
  }

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  return (
    <div className="pdf-file-input-container">
      {label && (
        <label htmlFor={id} className="pdf-file-input-label">
          {label}
        </label>
      )}
      <div
        className="pdf-file-input-display"
        onClick={openFileDialog}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && openFileDialog()}
      >
        <span className="pdf-file-input-text">
          {fileName || placeholder}
        </span>
        <FiPaperclip className="pdf-file-input-icon" size={20} />
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="pdf-file-input-hidden"
      />
    </div>
  )
}
