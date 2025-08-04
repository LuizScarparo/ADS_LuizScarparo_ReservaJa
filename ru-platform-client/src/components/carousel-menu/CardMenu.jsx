import React from "react";
import "./CardMenu.css";

export default function CardMenu({image, day}){
    return(
        <div className="card-menu">
            <img src={image} alt={`Cardápio de ${day}`} className="card-image"/>
        </div>
    );
}