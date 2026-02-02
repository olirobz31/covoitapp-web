import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.email));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile(data);
        setNom(data.nom || '');
        setPrenom(data.prenom || '');
        setTelephone(data.telephone || '');
        setBio(data.bio || '');
        setPhotoUrl(data.photoUrl || '');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.email), {
        nom, prenom, telephone, bio
      });
      setMessage('✅ Profil mis à jour !');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `photos/${user.email}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.email), { photoUrl: url });
      setPhotoUrl(url);
      setMessage('✅ Photo mise à jour !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Erreur upload photo.');
    }
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

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h3>⏳ Chargement...</h3>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '700px' }}>
      <h2 className="page-title">👤 Mon profil</h2>

      {message && <div className="success-message">{message}</div>}

      <div className="card" style={{ marginBottom: '20px' }}>
        {/* Photo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Photo de profil"
              style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%', background: 'var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '48px', margin: '0 auto'
            }}>
              👤
            </div>
          )}
          <div style={{ marginTop: '12px' }}>
            <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
              📷 Changer la photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Infos */}
        <div style={{ marginBottom: '12px', color: 'var(--text-gray)', textAlign: 'center' }}>
          📧 {user.email}
        </div>

        {isEditing ? (
          <>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Nom</label>
                <input type="text" className="form-control" value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Prénom</label>
                <input type="text" className="form-control" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input type="tel" className="form-control" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea className="form-control" rows="3" value={bio} onChange={(e) => setBio(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary btn-full" onClick={handleSave} disabled={isSaving}>
                {isSaving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
              </button>
              <button className="btn btn-outline" onClick={() => setIsEditing(false)}>
                Annuler
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '16px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
              <p><strong>Nom :</strong> {nom || 'Non renseigné'}</p>
              <p><strong>Prénom :</strong> {prenom || 'Non renseigné'}</p>
              <p><strong>Téléphone :</strong> {telephone || 'Non renseigné'}</p>
              <p><strong>Bio :</strong> {bio || 'Non renseigné'}</p>
            </div>
            <button className="btn btn-primary btn-full" onClick={() => setIsEditing(true)}>
              ✏️ Modifier mon profil
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;