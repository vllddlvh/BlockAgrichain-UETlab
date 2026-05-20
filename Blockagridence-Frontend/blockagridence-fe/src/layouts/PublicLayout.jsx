import './PublicLayout.css';

export default function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="container header-content">
          <div className="logo-section">
            <div className="logo-icon">BA</div>
            <h2>BlockAgridence</h2>
          </div>
          <div className="system-status">
            <span className="pulse-dot"></span>
            <span>Blockchain Verified</span>
          </div>
        </div>
      </header>
      
      <main className="public-main">
        <div className="container">
          {children}
        </div>
      </main>

      <footer className="public-footer">
        <div className="container">
          <p>© 2026 BlockAgridence. Nền tảng truy xuất nguồn gốc nông sản minh bạch.</p>
        </div>
      </footer>
    </div>
  );
}
