import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import "./header.css";
import { useAuth } from "../../context/authContext.jsx";
import signOut from '../../assets/SignOut.svg'


export default function Header() {
  const { user, logout  } = useAuth();
  const userRole = user?.role; // evita erro se user ainda não existir

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          {/* Logo */}
          <div className="logo-area">
            <img
              src="/src/assets/ru-logo-header.svg"
              alt="RU Logo"
              className="logo-image"
            />
            <div className="logo-text">
              <span className="logo-title">Restaurante Universitário</span>
              <span className="logo-subtitle">
                Universidade de Passo Fundo - UPF
              </span>
            </div>
          </div>

          {/* Navegação desktop */}
          <nav className="nav-area">
            <NavLink
              to="/home"
              className="nav-link"
            >
              Início
            </NavLink>
            <NavLink
              to="/my-reservations"
              className="nav-link"
            >
              Minhas Reservas
            </NavLink>
            <NavLink
              to="/rating"
              className="nav-link"
            >
              Avaliações
            </NavLink>
            {userRole === "admin" && (
              <NavLink
                to="/manage-reservations"
                className="nav-link"
              >
                Gerenciar Reservas
              </NavLink>
            )}
            {userRole === "admin" && (
              <NavLink
                to="/admin/ratings"
                className="nav-link"
              >
                Dashboard
              </NavLink>
            )}
            <button className="logout-btn" onClick={logout} aria-label="Sair">
              <img src={signOut} alt="Sign Out" className="logout-icon" />
            </button>
          </nav>

          {/* Botão menu (mobile) */}
          <button
            className="menu-toggle-btn"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </header>

      {/* Menu Lateral (mobile) */}
      <div className={`side-menu ${menuOpen ? "open" : ""}`}>
        <button
          className="close-btn"
          onClick={closeMenu}
          aria-label="Fechar menu"
        >
          <FiX size={24} />
        </button>

        <NavLink to="/home" className="side-nav-link" onClick={closeMenu}>
          Início
        </NavLink>
        <NavLink to="/about" className="side-nav-link" onClick={closeMenu}>
          Quem Somos
        </NavLink>
        <NavLink
          to="/my-reservations"
          className="side-nav-link"
          onClick={closeMenu}
        >
          Minhas Reservas
        </NavLink>
        <NavLink
          to="/rating"
          className="side-nav-link"
          onClick={closeMenu}
        >
          Avaliações
        </NavLink>
        {userRole === "admin" && (
          <NavLink
            to="/manage-reservations"
            className="side-nav-link"
            onClick={closeMenu}
          >
            Gerenciar Reservas
          </NavLink>
        )}
        {userRole === "admin" && (
          <NavLink
            to="/admin/ratings"
            className="side-nav-link"
            onClick={closeMenu}
          >
            Gerenciar Avaliações
          </NavLink>
        )}
      </div>

      {/* Overlay */}
      {menuOpen && <div className="overlay" onClick={closeMenu} />}
    </>
  );
}
