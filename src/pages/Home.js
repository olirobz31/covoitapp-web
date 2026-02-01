import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

function Home() {
  const [searchDepart, setSearchDepart] = useState('');
  const [searchArrivee, setSearchArrivee] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [recentTrips, setRecentTrips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentTrips();
  }, []);

  const loadRecentTrips = async () => {
    try {
      const q = query(
        collection(db, 'trajets'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const trips = snapshot.docs.map(doc => ({
  ...doc.data(),
  id: doc.id
}));
      setRecentTrips(trips);
    } catch (error) {
      console.error('Erreur chargement trajets:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?depart=${searchDepart}&arrivee=${searchArrivee}&date=${searchDate}`);
  };

  const getCityName = (fullAddress) => {
    return fullAddress ? fullAddress.split(',')[0].trim() : '';
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <h1>🚗 Voyagez ensemble, dépensez moins</h1>
        <p>
          Trouvez des covoiturages entre collègues et partagez vos trajets en toute confiance.
        </p>
      </section>

      {/* Barre de recherche */}
      <form className="search-bar" onSubmit={handleSearch}>
        <div className="form-group">
          <label>Départ</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ville de départ..."
            value={searchDepart}
            onChange={(e) => setSearchDepart(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Arrivée</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ville d'arrivée..."
            value={searchArrivee}
            onChange={(e) => setSearchArrivee(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            className="form-control"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-accent">
          🔍 Rechercher
        </button>
      </form>

      {/* Trajets récents */}
      <div className="page-container">
        <h2 className="page-title">Trajets récents</h2>

        {recentTrips.length === 0 ? (
          <p style={{ color: 'var(--text-gray)', textAlign: 'center' }}>
            Aucun trajet disponible pour le moment.
          </p>
        ) : (
          recentTrips.map(trip => (
            <div
              key={trip.id}
              className="trip-card"
              onClick={() => navigate(`/trip/${trip.id}`)}
            >
              <div className="trip-info">
                <div className="trip-route">
                  <span className="trip-city">🟢 {getCityName(trip.depart)}</span>
                  <span className="trip-arrow">→</span>
                  <span className="trip-city">🔴 {getCityName(trip.arrivee)}</span>
                </div>
                <div className="trip-details">
                  <span>📅 {trip.date}</span>
                  <span>🕐 {trip.horaire}</span>
                  <span>💺 {trip.placesDisponibles} place(s)</span>
                </div>
                <div className="trip-driver">
                  <div className="driver-avatar">👤</div>
                  <span className="driver-name">{trip.conducteur?.split('@')[0]}</span>
                </div>
              </div>
              <div className="trip-price">
                {trip.prix?.toFixed(2)} €
                <small>par place</small>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Section avantages */}
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '20px' }}>
        <h2 className="page-title" style={{ textAlign: 'center' }}>Pourquoi CovoitApp ?</h2>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
          <div className="card" style={{ flex: '1', minWidth: '250px', maxWidth: '320px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💰</div>
            <h3>Économisez</h3>
            <p style={{ color: 'var(--text-gray)', marginTop: '8px' }}>
              Partagez les frais de trajet et économisez sur vos déplacements quotidiens.
            </p>
          </div>
          <div className="card" style={{ flex: '1', minWidth: '250px', maxWidth: '320px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
            <h3>En confiance</h3>
            <p style={{ color: 'var(--text-gray)', marginTop: '8px' }}>
              Profils vérifiés, avis des passagers et paiement sécurisé par Stripe.
            </p>
          </div>
          <div className="card" style={{ flex: '1', minWidth: '250px', maxWidth: '320px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌍</div>
            <h3>Écologique</h3>
            <p style={{ color: 'var(--text-gray)', marginTop: '8px' }}>
              Réduisez votre empreinte carbone en partageant vos trajets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;