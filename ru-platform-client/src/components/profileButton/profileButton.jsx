// src/components/ProfileButton/ProfileButton.jsx

import React, { useState } from 'react'
import './ProfileButton.css'
import Separator from '../../assets/profile-separator.svg'

export default function ProfileButton({
  onChange,
  firstProfile,
  secondProfile
}) {
  const [selected, setSelected] = useState(firstProfile)

  const handleClick = (profile) => {
    setSelected(profile)
    if (onChange) onChange(profile)
  }

  return (
    <div className="upf-profile">
      <button
        className={`upf-btn ${selected === firstProfile ? 'active' : ''}`}
        onClick={() => handleClick(firstProfile)}
      >
        {firstProfile}
      </button>
      <img src={Separator} alt="separador" className='upf-separator' />
      <button
        className={`upf-btn ${selected === secondProfile ? 'active' : ''}`}
        onClick={() => handleClick(secondProfile)}
      >
        {secondProfile}
      </button>
    </div>
  )
}
