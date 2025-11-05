import { useEffect, useMemo, useState } from "react";
import api from "../../api/api"; 
import "./ManageReservationsScreen.css";
import React from "react";

/** Tipos (ajuste se o backend retornar campos diferentes) */
type ReservationStatus = "pending" | "consumed" | "no_show" | string;
type MealType = "Almoço" | "Jantar" | string;
type UserType = "Aluno" | "Professor" | "Servidor" | string;

type Reservation = {
  id: string;
  date: string; // ISO
  registration?: string;
  user?: {
    id: string;
    name: string;
    registration?: string;
    type?: UserType;
  };
  name?: string;
  type?: UserType;
  meal: MealType;
  status?: ReservationStatus;
};

type WeekResponse =
  | {
      startDate?: string; // ISO
      endDate?: string;   // ISO
      data?: Reservation[];
    }
  | Reservation[];

const BR = new Intl.DateTimeFormat("pt-BR");
const fmtDate = (iso: string) => {
  try {
    return BR.format(new Date(iso));
  } catch {
    return iso;
  }
};
const contains = (hay: string, needle: string) =>
  (hay || "").toLowerCase().includes((needle || "").toLowerCase());

export default function AdminReservationsPage() {
  const [all, setAll] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [onlyMeal, setOnlyMeal] = useState<"" | MealType>("");
  const [onlyType, setOnlyType] = useState<"" | UserType>("");

  const [weekLabel, setWeekLabel] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // usa seu api default (baseURL fixa no arquivo)
        const r = await api.get<WeekResponse>("/reservations/week");

        let list: Reservation[] = [];
        if (Array.isArray(r.data)) list = r.data as Reservation[];
        else if (r.data?.data && Array.isArray(r.data.data)) list = r.data.data as Reservation[];

        const norm = list.map((it) => ({
          ...it,
          name: it.user?.name ?? it.name ?? "",
          registration: it.user?.registration ?? it.registration ?? "",
          type: (it.user?.type as UserType) ?? (it.type as UserType) ?? "Aluno",
        }));

        setAll(norm);

        const start =
          (Array.isArray(r.data) ? null : r.data?.startDate) ?? guessStart(norm);
        const end =
          (Array.isArray(r.data) ? null : r.data?.endDate) ?? guessEnd(norm);

        if (start && end) {
          const s = fmtDate(start);
          const e = fmtDate(end);
          setWeekLabel(
            `Semana ${s.split("/").slice(0, 2).join("/")} até ${e
              .split("/")
              .slice(0, 2)
              .join("/")}`
          );
        } else {
          setWeekLabel("");
        }
      } catch (e: any) {
        setErr(e?.response?.data?.error || e?.message || "Erro ao carregar reservas.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim();
    return all
      .filter((r) => (onlyMeal ? r.meal === onlyMeal : true))
      .filter((r) => (onlyType ? r.type === onlyType : true))
      .filter((r) => {
        if (!needle) return true;
        const base = `${r.name ?? ""} ${r.registration ?? ""}`;
        return contains(base, needle);
      })
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }, [all, q, onlyMeal, onlyType]);

  const total = filtered.length;

  async function setStatus(id: string, newState: "present" | "absent") {
    // UI otimista
    const prev = [...all];
    setAll((curr) =>
      curr.map((r) =>
        r.id === id
          ? { ...r, status: newState === "present" ? "CONFIRMED" : "ABSENT" }
          : r
      )
    );
    try {
      // PATCH /reservations/status/{id}
      // Primeiro tenta payload { status: "present" | "absent" }
      try {
        await api.patch(`/reservations/status/${id}`, { status: newState });
      } catch {
        // Se a sua API espera outro formato, tenta um booleano comum
        await api.patch(`/reservations/status/${id}`, {
          attended: newState === "present",
        });
      }
    } catch (e) {
      // desfaz mudanças se falhar
      setAll(prev);
      alert("Falha ao atualizar status.");
    }
  }

  return (
    <div className="res-admin-page">
      <header className="res-admin-header">
        <h1>RESERVAS DA SEMANA</h1>
        {weekLabel && <p className="res-week-sub">{weekLabel}</p>}
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
            🔎
          </button>
        </div>

        <div className="res-filters">
          <select
            value={onlyMeal}
            onChange={(e) => setOnlyMeal(e.target.value as MealType | "")}
          >
            <option value="">Todas as refeições</option>
            <option value="Almoço">Almoço</option>
            <option value="Jantar">Jantar</option>
          </select>

        <select
            value={onlyType}
            onChange={(e) => setOnlyType(e.target.value as UserType | "")}
          >
            <option value="">Todos os tipos</option>
            <option value="Aluno">Aluno</option>
            <option value="Professor">Professor</option>
            <option value="Servidor">Servidor</option>
          </select>
        </div>

        <div className="res-total">
          TOTAL DE RESERVAS:{" "}
          <span className="res-total-number">{total}</span>
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
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="center muted">
                  Carregando…
                </td>
              </tr>
            )}
            {err && !loading && (
              <tr>
                <td colSpan={6} className="center error">
                  {err}
                </td>
              </tr>
            )}
            {!loading && !err && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="center muted">
                  Nenhuma reserva encontrada.
                </td>
              </tr>
            )}

            {!loading &&
              !err &&
              filtered.map((r) => {
                const present = isPresent(r.status);
                return (
                  <tr key={r.id}>
                    <td>{fmtDate(r.date)}</td>
                    <td>{r.registration ?? "-"}</td>
                    <td className="res-name">{(r.name ?? "").toUpperCase()}</td>
                    <td>{r.type ?? "-"}</td>
                    <td>{r.meal}</td>
                    <td>
                      <div className="res-status-actions">
                        <button
                          className={`chip ${present === true ? "ok" : ""}`}
                          title="Presente"
                          onClick={() => setStatus(r.id, "present")}
                        >
                          ✓
                        </button>
                        <button
                          className={`chip ${present === false ? "cancel" : ""}`}
                          title="Ausente"
                          onClick={() => setStatus(r.id, "absent")}
                        >
                          ✕
                        </button>
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

/** Interpreta status recebido da API como presente/ausente */
function isPresent(status?: ReservationStatus): boolean | null {
  if (!status) return null;
  const s = String(status).toUpperCase();
  if (["CONFIRMED", "CHECKED", "DONE", "PRESENT", "OK", "TRUE"].includes(s))
    return true;
  if (["ABSENT", "CANCELED", "CANCELLED", "NO_SHOW", "NOK", "FALSE"].includes(s))
    return false;
  return null;
}

/** Se a /week não trouxer começo/fim, deduz pela menor/maior data */
function guessStart(list: Reservation[]) {
  if (!list.length) return null;
  return new Date(
    Math.min(...list.map((r) => new Date(r.date).getTime()))
  ).toISOString();
}
function guessEnd(list: Reservation[]) {
  if (!list.length) return null;
  return new Date(
    Math.max(...list.map((r) => new Date(r.date).getTime()))
  ).toISOString();
}
