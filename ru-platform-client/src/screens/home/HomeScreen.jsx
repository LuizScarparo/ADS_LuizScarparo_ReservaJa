import { useState } from 'react';
import CarouselMenu from '../../components/carousel-menu/CarouselMenu';
import { useAuth } from '../../context/authContext.jsx';
import EditMenuDialog from '../../components/edit-menu-dialog/EditMenuDialog.jsx';
import './HomeScreen.css';
import ScheduleDialog from '../schedule-reservations/ScheduleDialog.jsx';

export default function HomeScreen() {
  const [open, setOpen] = useState(false);
  const { user, getToken } = useAuth();
  const userRole = user?.role || 'visitor';
  const userName = user?.name || '';
  const userFirstName = userName ? userName.split(' ')[0] : '';

  const [editOpen, setEditOpen] = useState(false);
  const [menuVersion, setMenuVersion] = useState(0);

  function reloadAfterSuccess() {
  }

  return (
    <>
      <div className="home-content">
        <div className="home-greeting">
          <h1 className="home-greeting-title">Bem vindo de volta, {userFirstName}!</h1>
        </div>
        <div className="home-meal-reservation-content">
          <div className="title-edit-wrapper">
            <h1 className="home-title">Cardápio da Semana</h1>
            {userRole === 'admin' && (
              <button
                type="button"
                className="edit-menu-btn"
                onClick={() => setEditOpen(true)}
              >
                Editar Cardápio
              </button>
            )}
            <button
              type="button"
              className="scheduler-btn-top"
              onClick={() => setOpen(true)}
            >
              Agendar
            </button>
          </div>

          <div className="home-carousel">
            <CarouselMenu key={menuVersion} />
          </div>

          <div className="btn-wrapper">
            <button
              type="button"
              className="scheduler-btn"
              onClick={() => setOpen(true)}
            >
              Agendar
            </button>
          </div>
        </div>
      </div>

      <ScheduleDialog
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={reloadAfterSuccess}
      />

      <EditMenuDialog
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setMenuVersion((v) => v + 1);
        }}
        getToken={getToken}
      />
    </>
  );
}
