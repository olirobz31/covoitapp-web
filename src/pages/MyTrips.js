import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

function MyTrips() {
  const [myTrips, setMyTrips] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('trips');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Charger mes trajets (conducteur)
      const tripsQuery = query(
        collection(db, 'trajets'),
        where('conducteur', '==', user.email)
      );
      const tripsSnapshot = await getDocs(tripsQuery);
      const trips = tripsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMyTrips(trips);

      // Charger mes réservations (passager)
      const reservationsQuery = query(
        collection(db, 'reservations'),
        where('userEmail', '==', user.email)
      );
      const reservationsSnapshot = await getDocs(reservationsQuery);
      const reservations = [];

      for (const resDoc of reservationsSnapshot.docs) {
        const resData = resDoc.data();
        // Charger les infos du trajet associé
        const trajetDoc = await getDoc(doc(db, 'trajets', resData.trajetId));
        if (trajetDoc.exists()) {
          reservations.push({
            ...resData,
            reservationId: resDoc.id,
            trajet: { ...trajetDoc.data(), id: trajetDoc.id }
          });
        }
      }
      setMyReservations(reservations);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Supprimer ce trajet ?')) return;
    try {
      await deleteDoc(doc(db, 'trajets', tripId));
      setMyTrips(myTrips.filter(t => t.id !== tripId));
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleCancelReservation = async (reservation) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    try {
      // Supprimer la réservation
      await deleteDoc(doc(db, 'reservations', reservation.reservationId));

      // Remettre les places
      const nombrePlaces = reservation.nombrePlaces || 1;
      const trajetRef = doc(db, 'trajets', reservation.trajetId);
      const trajetDoc = await getDoc(trajetRef);
      if (trajetDoc.exists()) {
        const currentPlaces = trajetDoc.data().placesDisponibles || 0;
        await updateDoc(trajetRef, {
          placesDisponibles: currentPlaces + nombrePlaces
        });
      }

      setMyReservations(myReservations.filter(r => r.reservationId !== reservation.reservationId));
    } catch (error) {
      console.error('Erreur annulation:', error);
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

  return (
    <div className="page-container">
      <h2 className="page-title">Mes trajets</h2>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          className={`btn ${activeTab === 'trips' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('trips')}
        >
          🚗 Mes trajets ({myTrips.length})
        </button>
        <button
          className={`btn ${activeTab === 'reservations' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('reservations')}
        >
          🎫 Mes réservations ({myReservations.length})
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3>⏳ Chargement...</h3>
        </div>
      ) : activeTab === 'trips' ? (
        /* Mes trajets */
        myTrips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-gray)', marginBottom: '16px' }}>Vous n'avez aucun trajet.</p>
            <button className="btn btn-accent" onClick={() => navigate('/create-trip')}>
              ➕ Créer un trajet
            </button>
          </div>
        ) : (
          myTrips.map(trip => (
            <div key={trip.id} className="trip-card" style={{ cursor: 'default' }}>
              <div className="trip-info">
                <div className="trip-route">
                  <span className="trip-city">🟢 {trip.depart?.split(',')[0]}</span>
                  <span className="trip-arrow">→</span>
                  <span className="trip-city">🔴 {trip.arrivee?.split(',')[0]}</span>
                </div>
                <div className="trip-details">
                  <span>📅 {trip.date}</span>
                  <span>🕐 {trip.horaire}</span>
                  <span>💺 {trip.placesDisponibles} place(s) dispo</span>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline" onClick={() => navigate(`/trip/${trip.id}`)}>
                    👁️ Voir
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDeleteTrip(trip.id)}>
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
              <div className="trip-price">
                {trip.prix?.toFixed(2)} €
                <small>par place</small>
              </div>
            </div>
          ))
        )
      ) : (
        /* Mes réservations */
        myReservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-gray)', marginBottom: '16px' }}>Vous n'avez aucune réservation.</p>
            <button className="btn btn-accent" onClick={() => navigate('/search')}>
              🔍 Rechercher un trajet
            </button>
          </div>
        ) : (
          myReservations.map(reservation => (
            <div key={reservation.reservationId} className="trip-card" style={{ cursor: 'default' }}>
              <div className="trip-info">
                <div className="trip-route">
                  <span className="trip-city">🟢 {reservation.trajet?.depart?.split(',')[0]}</span>
                  <span className="trip-arrow">→</span>
                  <span className="trip-city">🔴 {reservation.trajet?.arrivee?.split(',')[0]}</span>
                </div>
                <div className="trip-details">
                  <span>📅 {reservation.trajet?.date}</span>
                  <span>🕐 {reservation.trajet?.horaire}</span>
                  <span>🎫 {reservation.nombrePlaces || 1} place(s)</span>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline" onClick={() => navigate(`/trip/${reservation.trajetId}`)}>
                    👁️ Voir
                  </button>
                  <button className="btn btn-danger" onClick={() => handleCancelReservation(reservation)}>
                    ❌ Annuler
                  </button>
                </div>
              </div>
              <div className="trip-price">
                {(reservation.trajet?.prix * (reservation.nombrePlaces || 1))?.toFixed(2)} €
                <small>{reservation.nombrePlaces || 1} place(s)</small>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
}

export default MyTrips;