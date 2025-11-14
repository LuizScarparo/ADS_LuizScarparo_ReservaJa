// src/pages/AdminRatingsDashboard/AdminRatingsDashboard.jsx

import { useState } from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { getRatingSummary, getRatingsList } from "../../services/ratingService";
import "./AdminRatingsDashboard.css";

export default function AdminRatingsDashboard() {
  const [date, setDate] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");

  const hasSelection = Boolean(date && mealType);

  async function loadData() {
    if (!hasSelection) return;
    setLoading(true);
    setError("");
    try {
      const [s, l] = await Promise.all([
        getRatingSummary(date, mealType),
        getRatingsList(date, mealType),
      ]);
      setSummary(s);
      setList(l);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados de avaliação.");
    } finally {
      setLoading(false);
    }
  }

  const mealLabel = mealType === "lunch" ? "Almoço" : "Jantar";

  return (
    <div className="ard-wrapper">
      <Header />

      <main className="ard-main">
        <section className="ard-card">
          <header className="ard-header">
            <h1 className="ard-title">PAINEL DE AVALIAÇÕES</h1>
            <p className="ard-subtitle">
              Visualize as avaliações das refeições do Restaurante Universitário.
            </p>
          </header>

          <div className="ard-filters">
            <div className="ard-field">
              <span className="ard-field-label">Data</span>
              <input
                type="date"
                className="ard-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="ard-field">
              <span className="ard-field-label">Refeição</span>
              <div className="ard-meal-options">
                <label className="ard-radio">
                  <input
                    type="radio"
                    name="mealType"
                    value="lunch"
                    checked={mealType === "lunch"}
                    onChange={(e) => setMealType(e.target.value)}
                  />
                  <span>Almoço</span>
                </label>
                <label className="ard-radio">
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

            <div className="ard-field ard-field-button">
              <button
                type="button"
                className="ard-load-button"
                onClick={loadData}
                disabled={!hasSelection || loading}
              >
                {loading ? "Carregando..." : "Carregar"}
              </button>
            </div>
          </div>

          {error && <p className="ard-error">{error}</p>}

          {summary && (
            <div className="ard-summary">
              <div className="ard-summary-header">
                <span>
                  {mealLabel} • {date}
                </span>
              </div>

              <div className="ard-summary-grid">
                <div className="ard-summary-card">
                  <span className="ard-summary-label">Média</span>
                  <div className="ard-summary-main">
                    <span className="ard-summary-value">
                      {summary.average.toFixed(1)}
                    </span>
                    <span className="ard-summary-stars">★</span>
                  </div>
                </div>

                <div className="ard-summary-card">
                  <span className="ard-summary-label">Total de avaliações</span>
                  <span className="ard-summary-value">
                    {summary.count}
                  </span>
                </div>

                <div className="ard-summary-card ard-summary-dist">
                  <span className="ard-summary-label">Distribuição</span>
                  <div className="ard-summary-bars">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const value = summary.distribution?.[star] ?? 0;
                      const perc =
                        summary.count > 0
                          ? (value / summary.count) * 100
                          : 0;

                      return (
                        <div key={star} className="ard-bar-row">
                          <span className="ard-bar-label">
                            {star}★
                          </span>
                          <div className="ard-bar-track">
                            <div
                              className="ard-bar-fill"
                              style={{ width: `${perc}%` }}
                            />
                          </div>
                          <span className="ard-bar-count">
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {list.length > 0 && (
            <div className="ard-table-wrapper">
              <h2 className="ard-table-title">Avaliações individuais</h2>
              <table className="ard-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Nota</th>
                    <th>Comentário</th>
                    <th>Data envio</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item) => (
                    <tr key={item.id}>
                      <td>{item.userId}</td>
                      <td>{"★".repeat(item.rating)}</td>
                      <td>{item.comment || "-"}</td>
                      <td>
                        {item.createdAt?.toDate
                          ? item.createdAt.toDate().toLocaleString()
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {summary && list.length === 0 && (
            <p className="ard-no-data">
              Não há avaliações registradas para esta refeição.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
