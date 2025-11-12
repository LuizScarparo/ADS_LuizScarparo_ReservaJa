import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './footer.css';
import { useAuth } from '../../context/authContext.jsx';

export default function Footer() {
  const { user } = useAuth();
  const userRole = user.role;
  const [showNav, setShowNav] = useState(true);

  useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth;
      setShowNav(width > 900);
    };

    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-logos">
          <img src="/src/assets/ru-logo-footer.svg" alt="RU Logo" className="footer-logo-image" />
          <img src="/src/assets/upf-logo-footer.svg" alt="UPF Logo" className="footer-upf-image" />
        </div>

        {showNav && (
          <nav className="footer-nav">
            <NavLink to="/home" className="footer-link" activeClassName="active">Home</NavLink>
            <NavLink to="/about" className="footer-link" activeClassName="active">Sobre Nós</NavLink>
            <NavLink to="/my-reservations" className="footer-link" activeClassName="active">Meus Agendamentos</NavLink>
            {userRole === 'admin' && (
              <NavLink to="/manage-reservations" className="footer-link" activeClassName="active">Gerenciar Reservas
              </NavLink>
            )}
          </nav>
        )}
      </div>
    </footer>
  );
}
