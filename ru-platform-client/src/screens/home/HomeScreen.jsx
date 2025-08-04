import CarouselMenu from '../../components/carousel-menu/CarouselMenu';
import { useAuth } from '../../context/authContext.jsx';
import './HomeScreen.css';

export default function HomeScreen() {
    const { user } = useAuth();
    const userRole = user.role;
    const userName = user.name;
    const userFirstName = userName.split(' ')[0];
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
                            <button type='button' className='edit-menu-btn'>Editar Cardápio</button>
                        )}
                    </div>
                    <div className="home-carousel">
                        <CarouselMenu />
                    </div>
                    <div className="btn-wrapper">
                        <button type='button' className='scheduler-btn'>Agendar</button>
                    </div>
                </div>
            </div>
        </>
    );
}
