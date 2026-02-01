import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Search() {
  const [searchParams] = useSearchParams();
  const [searchDepart, setSearchDepart] = useState(searchParams.get('depart') || '');
  const [searchArrivee, setSearchArrivee] = useState(searchParams.get('arrivee') || '');
  const [searchDate, setSearchDate] = useState(searchParams.get('date') || '');
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortByPrice, setSortByPrice] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    filterTrips();
  }, [trips, searchDepart, searchArrivee, searchDate, sortByPrice]);

  const loadTrips = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'trajets'));
      const allTrips = snapshot.docs.map(doc => ({
  ...doc.data(),
  id: doc.id
}));
      console.log('TRAJETS CHARGÉS:', JSON.stringify(allTrips.map(t => ({ id: t.id, depart: t.depart }))));
      setTrips(allTrips);
    } catch (error) {
      console.error('Erreur chargement trajets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCityName = (fullAddress) => {
    return fullAddress ? fullAddress.split(',')[0].trim().toLowerCase() : '';
  };

  const filterTrips = () => {
    let result = [...trips];

    // Filtre par départ
    if (searchDepart) {
      const searchCity = searchDepart.split(',')[0].trim().toLowerCase();
      result = result.filter(trip => {
        const tripCity = getCityName(trip.depart);
        return tripCity.includes(searchCity) || trip.depart.toLowerCase().includes(searchCity);
      });
    }

    // Filtre par arrivée
    if (searchArrivee) {
      const searchCity = searchArrivee.split(',')[0].trim().toLowerCase();
      result = result.filter(trip => {
        const tripCity = getCityName(trip.arrivee);
        return tripCity.includes(searchCity) || trip.arrivee.toLowerCase().includes(searchCity);
      });
    }

    // Filtre par date
    if (searchDate) {
      const formattedSearch = formatDateForCompare(searchDate);
      result = result.filter(trip => trip.date === formattedSearch);
    }

    // Filtre: uniquement les trajets avec des places disponibles
    result = result.filter(trip => trip.placesDisponibles > 0);

    // Trier par prix si demandé
    if (sortByPrice) {
      result.sort((a, b) => (a.prix || 0) - (b.prix || 0));
    }

    setFilteredTrips(result);
  };

  const formatDateForCompare = (dateInput) => {
    // Convertir 2026-01-28 en 28/01/2026
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateInput;
  };

  return (
    <div className="page-container">
      {/* Barre de recherche */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>🔍 Rechercher un trajet</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label>Départ</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ville de départ..."
              value={searchDepart}
              onChange={(e) => setSearchDepart(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label>Arrivée</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ville d'arrivée..."
              value={searchArrivee}
              onChange={(e) => setSearchArrivee(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label>Date</label>
            <input
              type="date"
              className="form-control"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-gray)' }}>
            {filteredTrips.length} trajet(s) trouvé(s)
          </span>
          <button
            className={`btn ${sortByPrice ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSortByPrice(!sortByPrice)}
          >
            Trier par prix
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              setSearchDepart('');
              setSearchArrivee('');
              setSearchDate('');
            }}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Résultats */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3>⏳ Chargement des trajets...</h3>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ color: 'var(--text-gray)' }}>
            Aucun trajet ne correspond à votre recherche
          </h3>
        </div>
      ) : (
        filteredTrips.map(trip => (
          <div
            key={trip.id}
            className="trip-card"
            onClick={() => navigate(`/trip/${trip.id}`)}
          >
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
  );
}

export default Search;