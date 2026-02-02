import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

function CreateTrip() {
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [date, setDate] = useState('');
  const [horaire, setHoraire] = useState('');
  const [prix, setPrix] = useState('');
  const [places, setPlaces] = useState('3');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Vous devez etre connecte.');
      return;
    }

    if (!depart || !arrivee || !date || !horaire || !prix || !places) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsLoading(true);

    try {
      const dateParts = date.split('-');
      const dateFormatted = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

      await addDoc(collection(db, 'trajets'), {
        depart: depart,
        arrivee: arrivee,
        date: dateFormatted,
        horaire: horaire,
        prix: parseFloat(prix),
        placesDisponibles: parseInt(places),
        placesTotal: parseInt(places),
        conducteur: user.email,
        description: description,
        timestamp: Date.now(),
        departLat: 0.0,
        departLon: 0.0,
        arriveeLat: 0.0,
        arriveeLon: 0.0,
        id: ''
      });

      navigate('/my-trips');
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la creation du trajet.');
    } finally {
      setIsLoading(false);
    }
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
          <p style={{ color: 'var(--text-gray)', marginTop: '12px' }}>
            Vous devez etre connecte pour creer un trajet.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
            onClick={() => navigate('/login')}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '700px' }}>
      <h2 className="page-title">Creer un trajet</h2>

      <div className="card">
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Lieu de depart *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Toulouse, France"
              value={depart}
              onChange={(e) => setDepart(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Lieu d'arrivee *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ex: Paris, France"
              value={arrivee}
              onChange={(e) => setArrivee(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Date *</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Heure de depart *</label>
              <input
                type="time"
                className="form-control"
                value={horaire}
                onChange={(e) => setHoraire(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Prix par place (EUR) *</label>
              <input
                type="number"
                className="form-control"
                placeholder="25.00"
                min="0"
                step="0.01"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Nombre de places *</label>
              <input
                type="number"
                className="form-control"
                min="1"
                max="8"
                value={places}
                onChange={(e) => setPlaces(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description (optionnel)</label>
            <textarea
              className="form-control"
              placeholder="Informations supplementaires..."
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-accent btn-full"
            style={{ fontSize: '18px', padding: '16px', marginTop: '12px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creation...' : 'Publier mon trajet'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTrip;