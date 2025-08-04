import React, { useState, useRef } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import './inputPassword.css'

export default function PasswordInput({ id, label, ...rest }) {
  const [visible, setVisible] = useState(false)
  const inputRef = useRef(null)

  const toggleVisibility = (e) => {
    e.preventDefault()
    setVisible((v) => !v)
    inputRef.current?.focus()
  }

  return (
    <div className="password-input-container">
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <div className="password-input-wrapper">
        <input
          {...rest}
          id={id}
          ref={inputRef}
          type={visible ? 'text' : 'password'}
          className="password-input"
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={toggleVisibility}
          onMouseDown={(e) => e.preventDefault()} 
          aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}
        >
          {visible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        </button>
      </div>
    </div>
  )
}
