import "./WelcomeHero.css";

function WelcomeHero() {
  return (
    <section className="welcome-hero">
      <img
        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop"
        alt="hero"
        className="welcome-hero-image"
      />

      <div className="welcome-hero-overlay">
        <span className="welcome-tag">OPERATIVE: JAYDEN_X</span>
        <h2>SYSTEMS READY FOR STUDY PROTOCOL</h2>
        <p>
          Your focus sessions today have accumulated 2,450 XP.
          You are 15% away from Level 42.
        </p>
      </div>
    </section>
  );
}

export default WelcomeHero;
