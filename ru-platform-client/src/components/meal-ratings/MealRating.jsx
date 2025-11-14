import { useEffect, useState } from "react";
import api from "../../api/api";
import "./MealRating.css";

export default function MealRating({ date, mealType }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const mealLabel = mealType === "lunch" ? "Almoço" : "Jantar";

  useEffect(() => {
    async function loadRating() {
      try {
        const res = await api.get("/ratings/me", {
          params: { date, mealType },
        });

        if (res.data?.data) {
          setRating(res.data.data.rating || 0);
          setComment(res.data.data.comment || "");
        }
      } catch (err) {
        console.log("Nenhuma avaliação existente");
      } finally {
        setLoading(false);
      }
    }

    if (date && mealType) loadRating();
  }, [date, mealType]);

  async function submitRating() {
    if (rating === 0) {
      setMessage("Por favor, selecione uma nota.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await api.post("/ratings", {
        date,
        mealType,
        rating,
        comment,
      });

      setMessage("Avaliação registrada com sucesso!");
    } catch (err) {
      console.error(err);
      setMessage(
        err?.response?.data?.message || "Erro ao salvar avaliação."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="mr-loading">
        Carregando avaliação...
      </p>
    );
  }

  return (
    <div className="mr-container">
      <div className="mr-header">
        <div>
          <span className="mr-label-top">Data da refeição</span>
          <div className="mr-date">{date}</div>
        </div>

        <div>
          <span className="mr-label-top">Refeição</span>
          <div className="mr-meal">{mealLabel}</div>
        </div>
      </div>

      <div className="mr-stars-row">
        <span className="mr-stars-label">Sua avaliação</span>
        <div className="mr-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={
                star <= (hover || rating)
                  ? "mr-star mr-star-selected"
                  : "mr-star"
              }
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <label className="mr-comment-label">
        Comentário (opcional)
        <textarea
          className="mr-textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </label>

      <div className="mr-footer-row">
        {message && <span className="mr-message">{message}</span>}

        <button
          type="button"
          onClick={submitRating}
          disabled={saving}
          className="mr-button"
        >
          {saving ? "Salvando..." : "Salvar avaliação"}
        </button>
      </div>
    </div>
  );
}