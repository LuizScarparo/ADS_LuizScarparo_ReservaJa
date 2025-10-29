import React from "react";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";
import "./AboutScreen.css"; // <= importa os estilos desta página

export default function AboutScreen() {
  return (
    <>
      <Header />

      <div className="about-page">
        <div className="about-card">
          {/* faixa decorativa bege no topo */}
          <div className="about-card__topbar" />

          {/* bloco 1 */}
          <section className="about-section">
            <div className="about-section__text">
              <h2 className="about-title">O QUE É O RU?</h2>
              <p className="about-paragraph">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed luctus
                dolor dui, non Lorem ut lacus, ex tincidunt orci gravida. Praesent
                non in diam amet, ex quis tincidunt non, dui, quam orci. Nullam odio
                placerat. Ut placerat lorem dignissim, ipsum laoreet non, ac
                tincidunt elit est. Lobortis eget amet, ultrices tincidunt
                dignissim, ipsum ac placerat. Lacus, vel felis, sed ultrices quam id.
                Nam ipsum tortor, tortor. Vestibulum varius nulla, commodo odio leo,
                convallis vitae lorem. Nunc ac tincidunt amet, ac elit volutpat luctus.
              </p>
            </div>

            {/* badge RU à direita (troque pela sua imagem se tiver) */}
            <div className="about-badge">
              {
                  <img src="/src/assets/us.png" alt="Logo RU" className="about-badge__img" />
              }
            </div>
          </section>

          {/* divisória */}
          <div className="about-divider" />

          {/* bloco 2 */}
          <section className="about-section about-section--single">
            <h2 className="about-title">QUAL NOSSO OBJETIVO?</h2>
            <p className="about-paragraph">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed luctus
              dolor dui, non Lorem ut lacus, ex tincidunt orci gravida. Praesent non
              in diam amet, ex quis tincidunt non, dui, quam orci. Nullam odio
              placerat. Ut placerat lorem dignissim, ipsum laoreet non, ac tincidunt
              elit est. Lobortis eget amet, ultrices tincidunt dignissim, ipsum ac
              placerat. Lacus, vel felis, sed ultrices quam id. Nam ipsum tortor,
              tortor amet. Vestibulum varius nulla, commodo odio leo, convallis vitae
              lorem. Nunc ac tincidunt amet, ac elit volutpat luctus. Sed consectetur
              est, nec faucibus faucibus tortor.
            </p>
          </section>

          {/* faixa verde inferior (imitando o rodapé da área de conteúdo) */}
          <div className="about-card__bottombar" />
        </div>
      </div>

      <Footer />
    </>
  );
}
