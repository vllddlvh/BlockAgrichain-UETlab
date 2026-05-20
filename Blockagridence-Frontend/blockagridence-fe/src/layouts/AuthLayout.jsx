import './AuthLayout.css';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-icon">BA</div>
            <h2>BlockAgridence</h2>
          </div>
          {children}
        </div>
      </div>
      <div className="auth-background">
        <div className="bg-pattern"></div>
      </div>
    </div>
  );
}
