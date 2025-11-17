// src/pages/AdminRatingsDashboard/AdminRatingsDashboard.jsx

import { useState, useEffect } from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import { getRatingSummary, getRatingsList, getLast7Summary } from "../../services/ratingService";
import { getReservationStats } from "../../services/reservationServices";
import "./AdminRatingsDashboard.css";

export default function AdminRatingsDashboard() {
  const [date, setDate] = useState("");
  const [mealType, setMealType] = useState("lunch");

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");

  const [last7, setLast7] = useState([]);
  const [loadingLast7, setLoadingLast7] = useState(true);
  const [errorLast7, setErrorLast7] = useState("");

  const [reservationStats, setReservationStats] = useState(null);

  const hasSelection = Boolean(date && mealType);
  const mealLabel = mealType === "lunch" ? "Almoço" : "Jantar";

  async function loadData() {
    if (!hasSelection) return;

    setLoading(true);
    setError("");
    setReservationStats(null);

    try {
      const [s, l, rStats] = await Promise.all([
        getRatingSummary(date, mealType),
        getRatingsList(date, mealType),
        getReservationStats(date, mealType),
      ]);

      setSummary(s);
      setList(l);
      setReservationStats(rStats);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados de avaliação.");
      setSummary(null);
      setList([]);
      setReservationStats(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadLast7() {
    try {
      setLoadingLast7(true);
      setErrorLast7("");
      const data = await getLast7Summary();
      setLast7(data);
    } catch (err) {
      console.error(err);
      setErrorLast7("Erro ao carregar resumo dos últimos 7 dias.");
    } finally {
      setLoadingLast7(false);
    }
  }

  useEffect(() => {
    loadLast7();
  }, []);

  return (
    <div className="ard-wrapper">
      <Header />

      <main className="ard-main">
        <section className="ard-card">
          {/* Cabeçalho principal */}
          <header className="ard-header">
            <h1 className="ard-title">PAINEL DE AVALIAÇÕES</h1>
            <p className="ard-subtitle">
              Acompanhe as avaliações e o consumo das refeições do Restaurante
              Universitário.
            </p>
          </header>

          {/* BLOCO: Últimos 7 dias (visão geral rápida) */}
          <section className="ard-last7">
            <div className="ard-last7-header">
              <h2 className="ard-last7-title">Últimos 7 dias</h2>
              {loadingLast7 && (
                <span className="ard-last7-status">Carregando...</span>
              )}
              {errorLast7 && (
                <span className="ard-last7-status ard-last7-error">
                  {errorLast7}
                </span>
              )}
            </div>

            {!loadingLast7 && !errorLast7 && last7.length === 0 && (
              <p className="ard-last7-empty">
                Ainda não há avaliações registradas nos últimos 7 dias.
              </p>
            )}

            {!loadingLast7 && last7.length > 0 && (
              <table className="ard-last7-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Almoço</th>
                    <th>Jantar</th>
                  </tr>
                </thead>
                <tbody>
                  {last7.map((item) => (
                    <tr key={item.date}>
                      <td>{item.date}</td>
                      <td>
                        {item.lunch.count > 0 ? (
                          <>
                            <span className="ard-last7-avg">
                              {item.lunch.average.toFixed(1)}★
                            </span>
                            <span className="ard-last7-count">
                              ({item.lunch.count})
                            </span>
                          </>
                        ) : (
                          <span className="ard-last7-none">-</span>
                        )}
                      </td>
                      <td>
                        {item.dinner.count > 0 ? (
                          <>
                            <span className="ard-last7-avg">
                              {item.dinner.average.toFixed(1)}★
                            </span>
                            <span className="ard-last7-count">
                              ({item.dinner.count})
                            </span>
                          </>
                        ) : (
                          <span className="ard-last7-none">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* BLOCO: Filtro detalhado + resumo do dia/refeição */}
          <section className="ard-daily">
            {/* Filtros */}
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
              <div className="card-button">
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
            </div>

            {error && <p className="ard-error">{error}</p>}

            {/* Resumo do dia/refeição selecionados */}
            {summary && (
              <>
                <div className="ard-summary">
                  <div className="ard-summary-header">
                    <span>
                      {mealLabel} • {date}
                    </span>
                  </div>

                  <div className="ard-summary-grid">
                    {/* Card: média */}
                    <div className="ard-summary-card">
                      <span className="ard-summary-label">Média</span>
                      <div className="ard-summary-main">
                        <span className="ard-summary-value">
                          {summary.average.toFixed(1)}
                        </span>
                        <span className="ard-summary-stars">★</span>
                      </div>
                    </div>

                    {/* Card: total de avaliações */}
                    <div className="ard-summary-card">
                      <span className="ard-summary-label">
                        Total de avaliações
                      </span>
                      <span className="ard-summary-value">
                        {summary.count}
                      </span>
                    </div>

                    {/* Card: Reservas x consumo (se disponível) */}
                    {reservationStats && (
                      <div className="ard-summary-card">
                        <span className="ard-summary-label">
                          Reservas x consumo
                        </span>
                        <div className="ard-reservations-info">
                          <div>
                            <span className="ard-res-label">Reservas:</span>{" "}
                            <span className="ard-res-value">
                              {reservationStats.totalReserved}
                            </span>
                          </div>
                          <div>
                            <span className="ard-res-label">Consumidas:</span>{" "}
                            <span className="ard-res-value">
                              {reservationStats.consumed}
                            </span>
                          </div>
                          <div>
                            <span className="ard-res-label">
                              Não consumidas:
                            </span>{" "}
                            <span className="ard-res-value ard-res-value-warn">
                              {reservationStats.notConsumed}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card: distribuição de notas */}
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
                              <span className="ard-bar-label">{star}★</span>
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

                {/* Lista de usuários que não consumiram */}
                {reservationStats?.notConsumedUsers &&
                  reservationStats.notConsumedUsers.length > 0 && (
                    <div className="ard-no-consumed-wrapper">
                      <h3 className="ard-no-consumed-title">
                        Usuários que NÃO consumiram esta refeição
                      </h3>

                      <table className="ard-no-consumed-table">
                        <thead>
                          <tr>
                            <th>Nome</th>
                            <th>Matrícula</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservationStats.notConsumedUsers.map((u) => (
                            <tr key={u.userId}>
                              <td>{u.name}</td>
                              <td>{u.enrollmentNumber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </>
            )}

            {/* Tabela de avaliações individuais */}
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
        </section>
      </main>

      <Footer />
    </div>
  );
}