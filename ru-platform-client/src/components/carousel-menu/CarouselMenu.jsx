import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './CarouselMenu.css';
import CardMenu from './CardMenu';
import { useEffect, useState } from 'react';
import { getMenu } from '../../services/menuServices';

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const dayMap = {
  Monday: "Segunda",
  Tuesday: "Terça",
  Wednesday: "Quarta",
  Thursday: "Quinta",
  Friday: "Sexta"
};

function CustomPrevArrow({ onClick }) {
    return (
        <div className="custom-arrow left" onClick={onClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--main-green)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
            </svg>
        </div>
    );
}

function CustomNextArrow({ onClick }) {
    return (
        <div className="custom-arrow right" onClick={onClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--main-green)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </div>
    );
}

const currentDate = new Date();
const currentDay = currentDate.getDay(); // 0 (domingo) a 6 (sábado)
const currentDayIndex = (currentDay + 6) % 7; // Ajusta para que segunda-feira seja o primeiro dia (0)

export default function ImageSlider() {
    const [menus, setMenus] = useState([]);

    useEffect(() => {
        async function fetchMenus() {
            try {
                const response = await getMenu();
                const sortedMenus = dayOrder.map(day =>
                    response.data.find(item => item.day === day)
                ).filter(Boolean); // remove dias faltando
                setMenus(sortedMenus);
            } catch (error) {
                console.error("Erro ao carregar cardápios", error);
            }
        }

        fetchMenus();
    }, []);
    const settings = {
        dots: true,
        className: "center",
        centerMode: true,
        infinite: true,
        centerPadding: "0px",
        slidesToShow: 3,
        speed: 500,
        focusOnSelect: true,
        initialSlide: currentDayIndex,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    initialSlide: currentDayIndex
                }
            }
        ]
    };

    return (
        <div className="image-slider-container">
            <Slider {...settings}>
                {menus.map((item, index) => (
                    <CardMenu key={index} image={item.url} day={dayMap[item.day]} />
                ))}
            </Slider>
        </div>
    );
}
