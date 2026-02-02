import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          © 2025 CovoitApp - Toulouse, France
        </div>
        <div className="footer-links">
          <Link to="/cgu">CGU</Link>
          <Link to="/privacy">Confidentialite</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;