import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasReserved, setHasReserved] = useState(false);
  const [nombrePlaces, setNombrePlaces] = useState(1);
  const user = auth.currentUser;

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    try {
      // Charger le trajet
      const tripDoc = await getDoc(doc(db, 'trajets', id));
      if (!tripDoc.exists()) {
        navigate('/search');
        return;
      }
      const tripData = { id: tripDoc.id, ...tripDoc.data() };
      setTrip(tripData);

      // Charger le profil du conducteur
      if (tripData.conducteur) {
        const driverDoc = await getDoc(doc(db, 'users', tripData.conducteur));
        if (driverDoc.exists()) {
          setDriverProfile(driverDoc.data());
        }
      }

      // Charger les avis du conducteur
      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('ratedUser', '==', tripData.conducteur)
      );
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratingsData = ratingsSnapshot.docs.map(doc => doc.data());
      setRatings(ratingsData);

      // Vérifier si l'utilisateur a déjà réservé
      if (user) {
        const reservationsQuery = query(
          collection(db, 'reservations'),
          where('trajetId', '==', id),
          where('userEmail', '==', user.email)
        );
        const reservationsSnapshot = await getDocs(reservationsQuery);
        setHasReserved(!reservationsSnapshot.empty);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / ratings.length).toFixed(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#FFC107' : '#E2E8F0', fontSize: '20px' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  const getCityName = (fullAddress) => {
    return fullAddress ? fullAddress.split(',')[0].trim() : '';
  };

  const isOwnTrip = user && trip && user.email === trip.conducteur;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h3>⏳ Chargement...</h3>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      {/* Itinéraire */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>🗺️ Itinéraire</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '24px' }}>🟢</span>
            <div style={{ width: '2px', height: '30px', background: 'var(--border)' }}></div>
            <span style={{ fontSize: '24px' }}>🔴</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', fontSize: '17px' }}>{getCityName(trip.depart)}</div>
              <div style={{ color: 'var(--text-gray)', fontSize: '13px' }}>{trip.depart}</div>
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '17px' }}>{getCityName(trip.arrivee)}</div>
              <div style={{ color: 'var(--text-gray)', fontSize: '13px' }}>{trip.arrivee}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '16px 0', borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ color: 'var(--text-gray)', fontSize: '13px' }}>Date</div>
            <div style={{ fontWeight: '600' }}>📅 {trip.date}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-gray)', fontSize: '13px' }}>Heure</div>
            <div style={{ fontWeight: '600' }}>🕐 {trip.horaire}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-gray)', fontSize: '13px' }}>Places disponibles</div>
            <div style={{ fontWeight: '600' }}>💺 {trip.placesDisponibles}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-gray)', fontSize: '13px' }}>Prix par place</div>
            <div style={{ fontWeight: '700', fontSize: '20px', color: 'var(--primary)' }}>
              {trip.prix?.toFixed(2)} €
            </div>
          </div>
        </div>
      </div>

      {/* Conducteur */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '16px' }}>👤 Conducteur</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {driverProfile?.photoUrl ? (
            <img
              src={driverProfile.photoUrl}
              alt="Photo"
              style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'var(--border)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '28px'
            }}>
              👤
            </div>
          )}
          <div>
            <div style={{ fontWeight: '600', fontSize: '18px' }}>
              {driverProfile?.prenom || trip.conducteur?.split('@')[0]}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {renderStars(Math.round(getAverageRating()))}
              <span style={{ color: 'var(--text-gray)', fontSize: '14px' }}>
                ({ratings.length} avis)
              </span>
            </div>
          </div>
        </div>

        {/* Avis récents */}
        {ratings.length > 0 && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Derniers avis</h3>
            {ratings.slice(0, 3).map((rating, index) => (
              <div key={index} style={{
                padding: '12px', background: 'var(--bg-light)',
                borderRadius: 'var(--radius-sm)', marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {renderStars(rating.rating)}
                  <span style={{ color: 'var(--text-gray)', fontSize: '12px' }}>
                    - {rating.raterUser?.split('@')[0]}
                  </span>
                </div>
                {rating.comment && (
                  <p style={{ color: 'var(--text-gray)', fontSize: '14px' }}>{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="card">
        {!user ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '16px', color: 'var(--text-gray)' }}>
              Connectez-vous pour réserver ce trajet
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              🔑 Se connecter
            </button>
          </div>
        ) : isOwnTrip ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-gray)' }}>C'est votre trajet</p>
          </div>
        ) : hasReserved ? (
          <div style={{ textAlign: 'center' }}>
            <div className="badge badge-success" style={{ fontSize: '16px', padding: '8px 16px' }}>
              ✅ Vous avez déjà réservé ce trajet
            </div>
          </div>
        ) : trip.placesDisponibles === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <div className="badge badge-danger" style={{ fontSize: '16px', padding: '8px 16px' }}>
              Complet
            </div>
          </div>
        ) : (
          <>
            {/* Sélection du nombre de places */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '12px' }}>Nombre de places</h3>
              <div className="places-counter" style={{ justifyContent: 'center' }}>
                <button
                  className="places-btn"
                  onClick={() => setNombrePlaces(Math.max(1, nombrePlaces - 1))}
                  disabled={nombrePlaces <= 1}
                >
                  -
                </button>
                <span className="places-number">{nombrePlaces}</span>
                <button
                  className="places-btn"
                  onClick={() => setNombrePlaces(Math.min(trip.placesDisponibles, nombrePlaces + 1))}
                  disabled={nombrePlaces >= trip.placesDisponibles}
                >
                  +
                </button>
              </div>
              <p style={{ color: 'var(--text-gray)', fontSize: '14px', marginTop: '8px' }}>
                Total : <strong style={{ color: 'var(--primary)', fontSize: '18px' }}>
                  {(trip.prix * nombrePlaces).toFixed(2)} €
                </strong>
              </p>
            </div>

            <button
              className="btn btn-accent btn-full"
              style={{ fontSize: '18px', padding: '16px' }}
              onClick={() => navigate(`/payment/${trip.id}?places=${nombrePlaces}`)}
            >
              💳 Réserver {nombrePlaces} place(s) - {(trip.prix * nombrePlaces).toFixed(2)} €
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default TripDetail;