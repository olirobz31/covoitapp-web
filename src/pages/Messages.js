import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, doc, getDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [profiles, setProfiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadConversations = async () => {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.email)
      );
      const snapshot = await getDocs(q);
      const convs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      convs.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
      setConversations(convs);

      // Charger les profils des participants
      const allEmails = new Set();
      convs.forEach(c => c.participants?.forEach(p => allEmails.add(p)));
      const profilesMap = {};
      for (const email of allEmails) {
        if (email !== user.email) {
          const userDoc = await getDoc(doc(db, 'users', email));
          if (userDoc.exists()) {
            profilesMap[email] = userDoc.data();
          }
        }
      }
      setProfiles(profilesMap);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = (conv) => {
    setSelectedConv(conv);

    // Ecouter les messages en temps reel
    const q = query(
      collection(db, 'conversations', conv.id, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return;

    try {
      await addDoc(collection(db, 'conversations', selectedConv.id, 'messages'), {
        text: newMessage.trim(),
        sender: user.email,
        timestamp: Date.now()
      });

      // Mettre a jour le dernier message
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'conversations', selectedConv.id), {
        lastMessage: newMessage.trim(),
        lastMessageTime: Date.now(),
        lastMessageSender: user.email
      });

      setNewMessage('');
    } catch (error) {
      console.error('Erreur envoi:', error);
    }
  };

  const getOtherParticipant = (conv) => {
    const other = conv.participants?.find(p => p !== user.email);
    return other || 'Inconnu';
  };

  const getProfileName = (email) => {
    const profile = profiles[email];
    if (profile) return `${profile.prenom || ''} ${profile.nom || ''}`.trim();
    return email?.split('@')[0] || 'Inconnu';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (isAuthLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h3>Chargement...</h3>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2>Connexion requise</h2>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/login')}>
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <h2 className="page-title">Messages</h2>

      <div style={{ display: 'flex', gap: '16px', height: '500px' }}>
        {/* Liste des conversations */}
        <div style={{
          width: '300px', borderRight: '1px solid var(--border)',
          overflowY: 'auto', paddingRight: '16px', flexShrink: 0
        }}>
          {isLoading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-gray)' }}>Chargement...</p>
          ) : conversations.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-gray)' }}>Aucune conversation</p>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                style={{
                  padding: '12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  marginBottom: '8px',
                  background: selectedConv?.id === conv.id ? 'var(--primary)' : 'var(--bg-white)',
                  color: selectedConv?.id === conv.id ? 'white' : 'inherit',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '15px' }}>
                  {getProfileName(getOtherParticipant(conv))}
                </div>
                <div style={{
                  fontSize: '13px', marginTop: '4px',
                  color: selectedConv?.id === conv.id ? 'rgba(255,255,255,0.8)' : 'var(--text-gray)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {conv.lastMessage || 'Pas de messages'}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Zone de chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!selectedConv ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-gray)'
            }}>
              Selectionnez une conversation
            </div>
          ) : (
            <>
              {/* En-tete */}
              <div style={{
                padding: '12px', borderBottom: '1px solid var(--border)',
                fontWeight: '600', fontSize: '17px'
              }}>
                {getProfileName(getOtherParticipant(selectedConv))}
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.sender === user.email ? 'flex-end' : 'flex-start',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%', padding: '10px 14px',
                      borderRadius: '16px',
                      background: msg.sender === user.email ? 'var(--primary)' : 'var(--bg-light)',
                      color: msg.sender === user.email ? 'white' : 'var(--text-dark)'
                    }}>
                      <div>{msg.text}</div>
                      <div style={{
                        fontSize: '11px', marginTop: '4px',
                        color: msg.sender === user.email ? 'rgba(255,255,255,0.7)' : 'var(--text-light)'
                      }}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <div style={{
                display: 'flex', gap: '8px', padding: '12px',
                borderTop: '1px solid var(--border)'
              }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={sendMessage}>
                  Envoyer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;