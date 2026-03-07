import { Link } from "wouter";

export default function Home() {
  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome to Selfmail</h1>
        <p className="subtitle">Your personal email management solution</p>
      </div>

      <div className="features">
        <div className="feature-card">
          <h2>Secure</h2>
          <p>End-to-end encrypted email with privacy in mind</p>
        </div>
        <div className="feature-card">
          <h2>Fast</h2>
          <p>Lightning-fast email delivery and retrieval</p>
        </div>
        <div className="feature-card">
          <h2>Simple</h2>
          <p>Clean, intuitive interface for seamless workflow</p>
        </div>
      </div>

      <div className="cta">
        <Link className="btn-primary" href="/inbox">
          Go to Inbox
        </Link>
      </div>
    </div>
  );
}
