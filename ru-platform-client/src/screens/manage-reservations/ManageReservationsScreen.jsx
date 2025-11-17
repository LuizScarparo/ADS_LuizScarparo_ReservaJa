import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import "./ManageReservationsScreen.css";
import magnifyingGlass from '../../assets/MagnifyingGlass.svg';
import check from '../../assets/Check.svg';


const BR = new Intl.DateTimeFormat("pt-BR");
const fmtDate = (iso) => {
  try {
    const [y, m, d] = String(iso).split("-");
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
  } catch {
    return iso;
  }
};
const contains = (hay, needle) =>
  String(hay || "").toLowerCase().includes(String(needle || "").toLowerCase());


function getMonday(d = new Date()) {
  const day = d.getDay(); 
  const diff = (day === 0 ? -6 : 1 - day);
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(d.getDate() + diff);
  return m;
}

function getFriday(d = new Date()) {
  const mon = getMonday(d);
  const f = new Date(mon);
  f.setDate(mon.getDate() + 4);
  f.setHours(23, 59, 59, 999);
  return f;
}

function isISOWithinWeek(iso, ref = new Date()) {
  const dt = new Date(iso + "T00:00:00");
  return dt >= getMonday(ref) && dt <= getFriday(ref);
}

function formatWeekLabel(ref = new Date()) {
  const s = fmtDate(getMonday(ref).toISOString());
  const e = fmtDate(getFriday(ref).toISOString());
  return `Semana ${s.split("/").slice(0, 2).join("/")} até ${e.split("/").slice(0, 2).join("/")}`;
}

const roleToPt = (r) => {
  switch (String(r || "").toLowerCase()) {
    case "student": return "Aluno";
    case "teacher": return "Professor";
    case "employee": return "Servidor";
    case "admin": return "Admin";
    default: return r || "-";
  }
};

const apiMealToUi = (m) => (m === "lunch" ? "Almoço" : "Jantar");
const uiMealToApi = (m) => (m === "Almoço" ? "lunch" : "dinner");

function isPresent(status) {
  if (!status) return null;
  const s = String(status).toUpperCase();
  if (["CONSUMED", "PRESENT", "CHECKED", "DONE", "OK", "TRUE"].includes(s)) return true;
  if (["NO_SHOW", "ABSENT", "CANCELED", "CANCELLED", "NOK", "FALSE"].includes(s)) return false;
  return null;
}


function flattenReservations(payload) {
  const list = Array.isArray(payload?.reservations) ? payload.reservations : [];
  const rows = [];

  for (const item of list) {
    const id = item.reservationId || item.id;
    const u = item.user || {};
    const name = u.name || "";
    const reg = u.enrollmentNumber || item.enrollmentNumber || item.registration;
    const type = roleToPt(u.role || item.type);

    const reserved = item.reservedDates || {};
    for (const [date, meals] of Object.entries(reserved)) {
      if (meals?.lunch?.isReserved) {
        rows.push({
          key: `${id}-${date}-l`,
          reservationId: id,
          date,
          mealUi: "Almoço",
          mealApi: "lunch",
          status: meals.lunch.status, // pending | consumed | no_show
          name,
          registration: reg,
          type
        });
      }
      if (meals?.dinner?.isReserved) {
        rows.push({
          key: `${id}-${date}-d`,
          reservationId: id,
          date,
          mealUi: "Jantar",
          mealApi: "dinner",
          status: meals.dinner.status,
          name,
          registration: reg,
          type
        });
      }
    }
  }

  rows.sort((a, b) => {
    const t = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (t !== 0) return t;
    return a.mealApi.localeCompare(b.mealApi);
  });

  return rows;
}

export default function ManageReservationsScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const [q, setQ] = useState("");
  const [onlyMeal, setOnlyMeal] = useState("");
  const [onlyType, setOnlyType] = useState("");

  const weekLabel = formatWeekLabel();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await api.get("/reservations");
        const flat = flattenReservations(res.data);
        const thisWeek = flat.filter((r) => isISOWithinWeek(r.date));
        setRows(thisWeek);
      } catch (e) {
        console.error(e);
        setErr(e?.response?.data?.error || e?.message || "Erro ao carregar reservas.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim();
    return rows
      .filter((r) => (onlyMeal ? r.mealUi === onlyMeal : true))
      .filter((r) => (onlyType ? String(r.type || "").toLowerCase() === String(onlyType).toLowerCase() : true))
      .filter((r) => {
        if (!needle) return true;
        const base = `${r.name || ""} ${r.registration || ""}`;
        return contains(base, needle);
      });
  }, [rows, q, onlyMeal, onlyType]);

  const total = filtered.length;

  async function setStatus(rowKey, newState) {
    const idx = rows.findIndex((r) => r.key === rowKey);
    if (idx === -1) return;

    const row = rows[idx];
    const desiredStatus = newState === "present" ? "consumed" : "no_show";
    const payload = { day: row.date, meal: row.mealApi, status: desiredStatus };

    const prev = [...rows];
    const next = [...rows];
    next[idx] = { ...row, status: desiredStatus };
    setRows(next);

    try {
      await api.patch(`/reservations/status/${row.reservationId}`, payload);
    } catch (e) {
      setRows(prev);
      alert("Falha ao atualizar status.");
    }
  }

  return (
    <div className="res-admin-page">
      <header className="res-admin-header">
        <h1>RESERVAS DA SEMANA</h1>
        <p className="res-week-sub">{weekLabel}</p>
      </header>

      <section className="res-admin-toolbar">
        <div className="res-search">
          <input
            type="text"
            placeholder="Buscar por nome ou matrícula"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="icon-button" aria-label="Buscar">
            <img src={magnifyingGlass} alt="Lupa" className="icon" />
          </button>
        </div>

        <div className="res-filters">
          <select value={onlyMeal} onChange={(e) => setOnlyMeal(e.target.value)}>
            <option value="">Todas as refeições</option>
            <option value="Almoço">Almoço</option>
            <option value="Jantar">Jantar</option>
          </select>
          <select value={onlyType} onChange={(e) => setOnlyType(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="Aluno">Aluno</option>
            <option value="Professor">Professor</option>
            <option value="Servidor">Servidor</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="res-total">
          TOTAL DE RESERVAS: <span className="res-total-number">{total}</span>
        </div>
      </section>

      <section className="res-table-wrap">
        <table className="res-table">
          <thead>
            <tr>
              <th>DATA</th>
              <th>MATRÍCULA</th>
              <th>NOME</th>
              <th>TIPO</th>
              <th>REFEIÇÃO</th>
              <th>SITUAÇÃO</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="center muted">Carregando…</td></tr>
            )}
            {err && !loading && (
              <tr><td colSpan={6} className="center error">{err}</td></tr>
            )}
            {!loading && !err && filtered.length === 0 && (
              <tr><td colSpan={6} className="center muted">Nenhuma reserva encontrada.</td></tr>
            )}

            {!loading && !err && filtered.map((r) => {
              const present = isPresent(r.status);
              return (
                <tr key={r.key}>
                  <td>{fmtDate(r.date)}</td>
                  <td>{r.registration || "-"}</td>
                  <td className="res-name">{String(r.name || "").toUpperCase()}</td>
                  <td>{r.type || "-"}</td>
                  <td>{r.mealUi}</td>
                  <td>
                    <div className="res-status-actions">
                      <button
                        className={`chip ${present === true ? "ok" : ""}`}
                        title="Presente"
                        onClick={() => setStatus(r.key, "present")}
                      >
                        <img src={check} alt="Check" className="icon" />
                      </button>
                      <button
                        className={`chip ${present === false ? "cancel" : ""}`}
                        title="Ausente"
                        onClick={() => setStatus(r.key, "absent")}
                      >✕</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
