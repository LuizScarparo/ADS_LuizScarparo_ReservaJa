import { useState } from "react";
import "./EditMenuDialog.css";

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSaved?: () => void
 * - getToken: () => string | undefined
 */
export default function EditMenuDialog({ isOpen, onClose, onSaved, getToken }) {
  if (!isOpen) return null;

  const initialItems = [
    { id: 1, ptLabel: "Segunda-feira", open: false, day: "Monday", file: null },
    { id: 2, ptLabel: "Terça-feira",   open: false, day: "Tuesday", file: null },
    { id: 3, ptLabel: "Quarta-feira",  open: false, day: "Wednesday", file: null },
    { id: 4, ptLabel: "Quinta-feira",  open: false, day: "Thursday", file: null },
    { id: 5, ptLabel: "Sexta-feira",   open: false, day: "Friday", file: null },
  ];

  const [items, setItems] = useState(initialItems);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const toggleOpen = (id) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, open: !it.open } : it))
    );
  };

  const updateDay = (id, value) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, day: value } : it)));
  };

  const updateFile = (id, file) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, file } : it)));
  };

  const handleSave = async () => {
    setSubmitting(true);
    setErrorMsg("");

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
      const rawToken = getToken ? getToken() : undefined;

      // normaliza Authorization
      const authHeader =
        rawToken && (rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`);

      const toUpload = items.filter((i) => i.file);

      for (const it of toUpload) {
        const fd = new FormData();
        fd.append("day", it.day);   // Monday | ... | Friday
        fd.append("file", it.file); // imagem

        const headers = {};
        if (authHeader) headers["Authorization"] = authHeader;

        const res = await fetch(`${API_BASE}/menu/upload`, {
          method: "POST",
          headers,
          body: fd,
        });

        if (!res.ok) {
          let detail = "";
          try {
            const j = await res.json();
            detail = j?.message || j?.error || "";
          } catch {
            // ignore
          }
          throw new Error(
            `Falha ao enviar ${it.ptLabel} (${it.day}). ${detail || `HTTP ${res.status}`}`
          );
        }
      }

      setSubmitting(false);
      onSaved?.();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar cardápio:", err);
      setSubmitting(false);
      setErrorMsg(err.message || "Erro ao salvar cardápio.");
    }
  };

  return (
    <div className="emd-backdrop" role="dialog" aria-modal="true">
      <div className="emd-modal">
        <div className="emd-header">
          <h2>Editar cardápio da semana</h2>
          <button
            type="button"
            className="emd-close"
            aria-label="Fechar"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <hr className="emd-sep" />

        <div className="emd-list">
          {items.map((it) => (
            <div key={it.id} className="emd-item">
              <button
                type="button"
                className="emd-item-head"
                onClick={() => toggleOpen(it.id)}
                aria-expanded={it.open}
              >
                <span className="emd-icon" aria-hidden>📅</span>
                <span className="emd-label">{it.ptLabel}</span>
                <span className={`emd-caret ${it.open ? "open" : ""}`} aria-hidden>▾</span>
              </button>

              {it.open && (
                <div className="emd-item-body">
                  <div className="emd-field">
                    <label>Dia (enum)</label>
                    <select
                      value={it.day}
                      onChange={(e) => updateDay(it.id, e.target.value)}
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                    </select>
                    <small>A API espera o dia em inglês (Monday–Friday).</small>
                  </div>

                  <div className="emd-field">
                    <label>Imagem do cardápio</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => updateFile(it.id, e.target.files?.[0] || null)}
                    />
                    {it.file && <small>Selecionado: {it.file.name}</small>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {errorMsg && <div className="emd-error">{errorMsg}</div>}

        <div className="emd-footer">
          <button type="button" className="emd-btn ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button
            type="button"
            className="emd-btn primary"
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
