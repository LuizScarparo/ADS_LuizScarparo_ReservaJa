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
                O Restaurante Universitário (RU) da Universidade de Passo Fundo é um espaço voltado à alimentação saudável, acessível e de qualidade para toda a comunidade.
                Nosso objetivo é oferecer refeições equilibradas e nutricionalmente adequadas a estudantes, professores, técnicos administrativos e visitantes,
                promovendo o bem-estar e contribuindo para o desempenho nas atividades de ensino, pesquisa e extensão.
                Agora, com o novo aplicativo de agendamento, é possível planejar suas refeições com mais praticidade, escolhendo o horário e garantindo seu acesso ao restaurante de forma rápida e prática.
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
              Nosso principal objetivo é facilitar o acesso ao Restaurante Universitário e otimizar a gestão das refeições por meio da tecnologia.
              O aplicativo foi desenvolvido para tornar o processo de agendamento mais simples, evitar filas e desperdícios de alimentos, além de melhorar a experiência de todos os usuários.
              Com isso, buscamos integrar inovação e sustentabilidade, reforçando o compromisso da UPF em oferecer soluções que beneficiem a comunidade universitária e promovam uma alimentação consciente.
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
