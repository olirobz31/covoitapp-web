import React, { useState } from 'react';

function Contact() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [sujet, setSujet] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ouvrir le client mail
    const mailtoLink = `mailto:olirobz31@gmail.com?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(`De: ${nom} (${email})\n\n${messageText}`)}`;
    window.location.href = mailtoLink;
    setIsSent(true);
  };

  return (
    <div className="page-container" style={{ maxWidth: '700px' }}>
      <h2 className="page-title">Contactez-nous</h2>

      {isSent ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h3>Merci !</h3>
          <p style={{ color: 'var(--text-gray)', marginTop: '12px' }}>
            Votre client mail va s'ouvrir pour envoyer le message.
          </p>
        </div>
      ) : (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Nom</label>
                <input
                  type="text"
                  className="form-control"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Sujet</label>
              <input
                type="text"
                className="form-control"
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                className="form-control"
                rows="5"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ fontSize: '16px', padding: '14px' }}>
              Envoyer le message
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Contact;