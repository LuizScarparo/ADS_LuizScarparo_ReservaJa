import React, { useEffect, useMemo, useState } from "react";
import Footer from '../../components/footer/footer';
import Header from '../../components/header/header';
import api from "../../api/api";
import "./MyReservationsScreen.css";
import bin from '../../assets/bin.svg';



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
function getMonday(d = new Date()) {
    const day = d.getDay(); // 0=Dom,1=Seg,...6=Sab
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
function weekLabel(ref = new Date()) {
    const mondayISO = getMonday(ref).toISOString().split("T")[0];
    const fridayISO = getFriday(ref).toISOString().split("T")[0];

    const s = fmtDate(mondayISO);
    const e = fmtDate(fridayISO);

    const sLabel = s.split("/").slice(0, 2).join("/");
    const eLabel = e.split("/").slice(0, 2).join("/");

    return `Semana ${sLabel} até ${eLabel}`;
}

function statusPt(s) {
    const x = String(s || "").toLowerCase();
    if (x === "pending") return "Pendente";
    if (x === "consumed") return "Consumido";
    if (x === "no_show") return "Não compareceu";
    return s || "-";
}

/** Normaliza o /reservations/me (pode vir objeto único ou array) em linhas por dia */
function flattenMe(payload) {
    const items = Array.isArray(payload) ? payload : [payload];
    const rows = [];
    for (const res of items.filter(Boolean)) {
        const id = res.reservationId || res.id;
        const reserved = res.reservedDates || {};
        for (const [date, meals] of Object.entries(reserved)) {
            const L = meals?.lunch?.isReserved === true;
            const D = meals?.dinner?.isReserved === true;

            if (!L && !D) continue;

            const mealLabel = L && D ? "Almoço/Janta" : L ? "Almoço" : "Jantar";
            const stLunch = L ? statusPt(meals.lunch?.status) : null;
            const stDinner = D ? statusPt(meals.dinner?.status) : null;
            const statusCombined =
                L && D
                    ? `${stLunch || "Pendente"}/${stDinner || "Pendente"}`
                    : (stLunch || stDinner || "Pendente");

            rows.push({
                key: `${id}-${date}`,
                reservationId: id,
                date,
                lunch: L,
                dinner: D,
                mealLabel,
                statusCombined,
            });
        }
    }
    // ordena mais recente pra cima? mock parece crescente — vamos crescente:
    rows.sort((a, b) => new Date(a.date) - new Date(b.date));
    return rows;
}

export default function MyReservationsScreen() {

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const r = await api.get("/reservations/me");
                const flat = flattenMe(r.data?.reservations ?? r.data);
                const onlyWeek = flat.filter((it) => isISOWithinWeek(it.date));
                setRows(onlyWeek);
            } catch (e) {
                setErr(e?.response?.data?.error || e?.message || "Erro ao carregar agendamentos.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const total = rows.length;

    async function handleDelete(row) {
        if (!window.confirm("Cancelar as reservas deste dia?")) return;
        try {
            const meals = [];
            if (row.lunch) meals.push("lunch");
            if (row.dinner) meals.push("dinner");
            await api.delete(`/reservations/${row.reservationId}`, {
                data: { day: row.date, meals },
            });
            // remove da UI
            setRows((prev) => prev.filter((r) => r.key !== row.key));
        } catch (e) {
            alert(e?.response?.data?.error || e?.message || "Falha ao cancelar.");
        }
    }


    const label = weekLabel();

    return (
        <>
            <Header />
            <div className="myres-page">
                <header className="myres-header">
                    <h1>RESERVAS</h1>
                    <p className="myres-sub">{label}</p>
                </header>

                <section className="myres-table-wrap">
                    <table className="myres-table">
                        <thead>
                            <tr>
                                <th>DATA</th>
                                <th>REFEIÇÃO</th>
                                <th>SITUAÇÃO</th>
                                <th>CANCELAR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={4} className="center muted">Carregando…</td></tr>
                            )}
                            {err && !loading && (
                                <tr><td colSpan={4} className="center error">{err}</td></tr>
                            )}
                            {!loading && !err && rows.length === 0 && (
                                <tr><td colSpan={4} className="center muted">Nenhum agendamento localizado.</td></tr>
                            )}

                            {!loading && !err && rows.map((r) => (
                                <tr key={r.key}>
                                    <td>{fmtDate(r.date)}</td>
                                    <td>{r.mealLabel}</td>
                                    <td>{r.statusCombined}</td>
                                    <td>
                                        <div className="myres-actions">
                                            <button className="icon-btn" title="Excluir" onClick={() => handleDelete(r)}>
                                                <img src={bin} alt="Excluir" className="trash-icon" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
            <Footer />
        </>
    );
}
