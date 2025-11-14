// src/pages/RatingsPage/RatingsPage.jsx

import { useState } from "react";
import MealRating from "../../components/meal-ratings/MealRating";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import "./MealRatingPage.css";

export default function RatingsPage() {
  const [date, setDate] = useState("");
  const [mealType, setMealType] = useState("");

  const hasSelection = Boolean(date && mealType);

  return (
    <div className="ratings-wrapper">
      <Header />

      <main className="ratings-main">
        <section className="ratings-container">
          <header className="ratings-header">
            <h1 className="ratings-title">AVALIAÇÕES</h1>
            <p className="ratings-subtitle">
              Selecione a data e o tipo de refeição para registrar sua opinião
              sobre o Restaurante Universitário.
            </p>
          </header>

          <div className="ratings-filter-card">
            <div className="ratings-filter-grid">
              <div className="ratings-field">
                <label className="ratings-label" htmlFor="rating-date">
                  DATA
                </label>
                <input
                  id="rating-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="ratings-input"
                />
              </div>

              <div className="ratings-field">
                <span className="ratings-label">REFEIÇÃO</span>
                <div className="ratings-meal-options">
                  <label className={`ratings-chip ${mealType === "lunch" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="mealType"
                      value="lunch"
                      checked={mealType === "lunch"}
                      onChange={(e) => setMealType(e.target.value)}
                    />
                    <span>Almoço</span>
                  </label>

                  <label className={`ratings-chip ${mealType === "dinner" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="mealType"
                      value="dinner"
                      checked={mealType === "dinner"}
                      onChange={(e) => setMealType(e.target.value)}
                    />
                    <span>Jantar</span>
                  </label>
                </div>
              </div>
            </div>

            {!hasSelection && (
              <p className="ratings-hint">
                Escolha uma data e uma refeição para iniciar a avaliação.
              </p>
            )}
          </div>

          {hasSelection && (
            <div className="ratings-meal-card">
              <MealRating date={date} mealType={mealType} />
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}