import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import calendar from '../../assets/CalendarBlank.svg'

;
import "./ScheduleDialog.css";

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0=dom,1=seg,...6=sab
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekDaysMonToFri(anyDate) {
  const mon = getMonday(anyDate);
  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    days.push(toISO(d));
  }
  return days;
}

export default function ScheduleDialog({
  open,
  onClose,
  onSuccess, // opcional: callback para recarregar lista
}) {
  const [date, setDate] = useState("");
  const [allWeek, setAllWeek] = useState(false);
  const [meal, setMeal] = useState(""); // 'lunch' | 'dinner' | 'both'
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // fecha com ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      // reset quando fecha
      setDate("");
      setAllWeek(false);
      setMeal("");
      setErr("");
      setLoading(false);
    }
  }, [open]);

  const canSubmit = useMemo(() => {
    if (!date) return false;
    if (!meal) return false;
    return true;
  }, [date, meal]);

  function buildReservedDates() {
    const dates = allWeek
      ? getWeekDaysMonToFri(new Date(date))
      : [date];

    const wantLunch = meal === "lunch" || meal === "both";
    const wantDinner = meal === "dinner" || meal === "both";

    const reservedDates = {};
    for (const d of dates) {
      reservedDates[d] = {
        ...(wantLunch
          ? { lunch: { isReserved: true, status: "pending" } }
          : { lunch: { isReserved: false } }),
        ...(wantDinner
          ? { dinner: { isReserved: true, status: "pending" } }
          : { dinner: { isReserved: false } }),
      };
    }
    return reservedDates;
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setErr("");

    if (!canSubmit) {
      setErr("Selecione a data e pelo menos uma refeição.");
      return;
    }

    try {
      setLoading(true);
      const body = { reservedDates: buildReservedDates() };
      await api.post("/reservations", body);
      onSuccess?.();
      onClose?.();
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "Erro ao cadastrar reserva.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="sched-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="sched-modal" role="dialog" aria-modal="true" aria-labelledby="sched-title">
        <header className="sched-header">
          <h2 id="sched-title">Agendar refeição</h2>
          <button
            type="button"
            className="sched-close"
            aria-label="Fechar"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form className="sched-body" onSubmit={handleSubmit}>
          <div className="sched-row">
            <div className="sched-date">
              <span className="sched-ico">
                <img src={calendar} alt="Calendário" className="icon-calendar" />
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <label className="sched-week">
              <input
                type="checkbox"
                checked={allWeek}
                onChange={(e) => setAllWeek(e.target.checked)}
              />
              <span>Agendar para toda a semana</span>
            </label>
          </div>

          <div className="sched-group-title">
            Qual refeição você deseja reservar?
          </div>

          <div className="sched-meals">
            <label className="sched-check">
              <input
                type="checkbox"
                checked={meal === "lunch"}
                onChange={() => setMeal(meal === "lunch" ? "" : "lunch")}
              />
              <span>Almoço</span>
            </label>

            <label className="sched-check">
              <input
                type="checkbox"
                checked={meal === "dinner"}
                onChange={() => setMeal(meal === "dinner" ? "" : "dinner")}
              />
              <span>Jantar</span>
            </label>

            <label className="sched-check">
              <input
                type="checkbox"
                checked={meal === "both"}
                onChange={() => setMeal(meal === "both" ? "" : "both")}
              />
              <span>Ambos</span>
            </label>
          </div>

          {err && <div className="sched-error">{err}</div>}

          <div className="sched-actions">
            <button
              type="submit"
              className="sched-primary"
              disabled={!canSubmit || loading}
            >
              {loading ? "Enviando..." : "CADASTRAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
