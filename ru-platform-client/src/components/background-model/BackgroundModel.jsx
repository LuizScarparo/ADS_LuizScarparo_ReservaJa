import { use, useEffect, useState } from 'react';
import ruImageDesktop from '../../assets/restaurante-universitario-upf-desktop.svg';
import ruImageMobile from '../../assets/restaurante-universitario-upf-mobile.svg';
import './BackgroundModel.css';

export default function BackgroundModel({ children }) {
    const [isMobile, setIsMobile] = useState(false);
    const [imageSrc, setImageSrc] = useState(isMobile ? ruImageMobile : ruImageDesktop);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            setImageSrc(mobile ? ruImageMobile : ruImageDesktop);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    return (
        <div className="background-model-container">
            <div className={`ru-divider-container ${isMobile ? 'mobile' : ''}`}>
                <div className="ru-divider-image">
                    <img src={imageSrc} alt="RU Presentation" className='ru-divider-image' />
                </div>
            </div>
            <div className="ru-model-content">
                {children}
            </div>
        </div>
    )
}