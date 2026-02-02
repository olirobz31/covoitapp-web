import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.email)
      );
      const snapshot = await getDocs(q);
      const notifs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      // Trier par timestamp décroissant
      notifs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setNotifications(notifs);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
      setNotifications(notifications.map(n =>
        n.id === notifId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2>Connexion requise</h2>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/login')}>
            🔑 Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '700px' }}>
      <h2 className="page-title">🔔 Notifications</h2>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3>⏳ Chargement...</h3>
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-gray)' }}>Aucune notification</p>
        </div>
      ) : (
        notifications.map(notif => (
          <div
            key={notif.id}
            className="card"
            style={{
              marginBottom: '12px',
              background: notif.read ? 'var(--bg-white)' : 'var(--bg-light)',
              borderLeft: notif.read ? 'none' : '4px solid var(--primary)',
              cursor: notif.read ? 'default' : 'pointer'
            }}
            onClick={() => !notif.read && markAsRead(notif.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{notif.title}</h3>
                <p style={{ color: 'var(--text-gray)', fontSize: '14px' }}>{notif.body}</p>
                <p style={{ color: 'var(--text-light)', fontSize: '12px', marginTop: '8px' }}>
                  {formatDate(notif.timestamp)}
                </p>
              </div>
              {!notif.read && (
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: 'var(--primary)', flexShrink: 0
                }} />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;