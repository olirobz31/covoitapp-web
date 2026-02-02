import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, addDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';

function Payment() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const places = parseInt(searchParams.get('places')) || 1;
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  console.log('PAYMENT PAGE LOADED');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthLoading) loadTrip();
  }, [id, isAuthLoading]);

  const loadTrip = async () => {
    try {
      const tripDoc = await getDoc(doc(db, 'trajets', id));
      if (tripDoc.exists()) {
        setTrip({ ...tripDoc.data(), id: tripDoc.id });
      } else {
        navigate('/search');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement du trajet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservation = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Verifier les places disponibles
      const tripDoc = await getDoc(doc(db, 'trajets', id));
      const currentPlaces = tripDoc.data().placesDisponibles;

      if (currentPlaces < places) {
        setError('Plus assez de places disponibles.');
        setIsProcessing(false);
        return;
      }

      // Creer la reservation
      await addDoc(collection(db, 'reservations'), {
        trajetId: id,
        userEmail: user.email,
        conducteur: trip.conducteur,
        nombrePlaces: places,
        prixTotal: trip.prix * places,
        status: 'confirmed',
        timestamp: Date.now()
      });

      // Mettre a jour les places disponibles
      await updateDoc(doc(db, 'trajets', id), {
        placesDisponibles: currentPlaces - places
      });

      // Envoyer une notification au conducteur
      await addDoc(collection(db, 'notifications'), {
        userId: trip.conducteur,
        title: 'Nouvelle reservation',
        body: `${user.email.split('@')[0]} a reserve ${places} place(s) pour votre trajet ${trip.depart?.split(',')[0]} - ${trip.arrivee?.split(',')[0]}`,
        timestamp: Date.now(),
        read: false
      });

      // Creer une conversation entre passager et conducteur
      const convQuery = await getDocs(query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.email)
      ));

      let conversationExists = false;
      convQuery.docs.forEach(doc => {
        const data = doc.data();
        if (data.participants?.includes(trip.conducteur)) {
          conversationExists = true;
        }
      });

      if (!conversationExists) {
        await addDoc(collection(db, 'conversations'), {
          participants: [user.email, trip.conducteur],
          lastMessage: '',
          lastMessageTime: Date.now(),
          lastMessageSender: ''
        });
      }

      setSuccess(true);
    } catch (err) {
      console.error('Erreur reservation:', err);
      setError('Erreur lors de la reservation.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h3>Chargement...</h3>
      </div>
    );
  }

  if (success) {
    return (
      <div className="page-container" style={{ maxWidth: '600px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ marginBottom: '12px' }}>Reservation confirmee !</h2>
          <p style={{ color: 'var(--text-gray)', marginBottom: '8px' }}>
            {places} place(s) reservee(s) pour le trajet
          </p>
          <p style={{ fontWeight: '600', fontSize: '18px', marginBottom: '20px' }}>
            {trip?.depart?.split(',')[0]} → {trip?.arrivee?.split(',')[0]}
          </p>
          <p style={{ color: 'var(--text-gray)', marginBottom: '24px' }}>
            Le {trip?.date} a {trip?.horaire}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/my-trips')}>
              Mes trajets
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/messages')}>
              Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <h2 className="page-title">Confirmer la reservation</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>Recapitulatif</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '20px' }}>🟢</span>
            <div style={{ width: '2px', height: '20px', background: 'var(--border)' }}></div>
            <span style={{ fontSize: '20px' }}>🔴</span>
          </div>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '16px' }}>{trip?.depart?.split(',')[0]}</div>
            <div style={{ fontWeight: '600' }}>{trip?.arrivee?.split(',')[0]}</div>
          </div>
        </div>

        <div style={{ padding: '16px', background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Date</span>
            <span style={{ fontWeight: '600' }}>{trip?.date}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Heure</span>
            <span style={{ fontWeight: '600' }}>{trip?.horaire}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Nombre de places</span>
            <span style={{ fontWeight: '600' }}>{places}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Prix par place</span>
            <span style={{ fontWeight: '600' }}>{trip?.prix?.toFixed(2)} EUR</span>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            paddingTop: '12px', borderTop: '1px solid var(--border)',
            marginTop: '8px'
          }}>
            <span style={{ fontWeight: '700', fontSize: '18px' }}>Total</span>
            <span style={{ fontWeight: '700', fontSize: '18px', color: 'var(--primary)' }}>
              {(trip?.prix * places).toFixed(2)} EUR
            </span>
          </div>
        </div>
      </div>

      <button
        className="btn btn-accent btn-full"
        style={{ fontSize: '18px', padding: '16px' }}
        onClick={handleReservation}
        disabled={isProcessing}
      >
        {isProcessing ? 'Reservation en cours...' : `Confirmer - ${(trip?.prix * places).toFixed(2)} EUR`}
      </button>
    </div>
  );
}

export default Payment;