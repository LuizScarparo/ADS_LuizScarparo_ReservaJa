import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import './header.css';
import { useAuth } from '../../context/authContext.jsx';

export default function Header() {
  const { user } = useAuth();
  const userRole = user.role;

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <div className="logo-area">
            <img src="/src/assets/ru-logo-header.svg" alt="RU Logo" className="logo-image" />
            <div className="logo-text">
              <span className="logo-title">Restaurante Universitário</span>
              <span className="logo-subtitle">Universidade de Passo Fundo - UPF</span>
            </div>
          </div>

          <button className="menu-toggle-btn" onClick={toggleMenu} aria-label="Abrir menu">
            <FiMenu size={25} />
          </button>

          <nav className="nav-area desktop-nav">
            <NavLink to="/home" className="nav-link">Home</NavLink>
            <NavLink to="/about" className="nav-link">Sobre Nós</NavLink>
            <NavLink to="/my-reservations" className="nav-link" activeClassName="active">Meus Agendamentos</NavLink>
            {userRole === 'admin' && (
              <NavLink to="/manage-reservations" className="nav-link">Gerenciar Reservas</NavLink>
            )}
          </nav>
        </div>
      </header>

      {/* Menu Lateral (mobile) */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={closeMenu} aria-label="Fechar menu">
          <FiX size={24} />
        </button>
        <NavLink to="/home" className="nav-link" onClick={closeMenu}>Home</NavLink>
        <NavLink to="/about" className="nav-link" onClick={closeMenu}>Sobre Nós</NavLink>
        <NavLink to="/my-reservations" className="nav-link" onClick={closeMenu}>Meus Agendamentos</NavLink>
        {userRole === 'admin' && (
          <NavLink to="/manage-reservations" className="nav-link" onClick={closeMenu}>Gerenciar Reservas</NavLink>
        )}
      </div>

      {/* Overlay */}
      {menuOpen && <div className="overlay" onClick={closeMenu}></div>}
    </>
  );
}
