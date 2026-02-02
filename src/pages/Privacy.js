import React from 'react';

function Privacy() {
  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <h2 className="page-title">Politique de Confidentialite</h2>

      <div className="card">
        <p style={{ color: 'var(--text-gray)', marginBottom: '20px' }}>
          Derniere mise a jour : Fevrier 2026
        </p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>1. Collecte des donnees</h3>
        <p>Nous collectons les donnees suivantes lors de votre utilisation de CovoitApp : nom, prenom, adresse email, numero de telephone (optionnel), photo de profil (optionnel), historique des trajets et reservations.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>2. Utilisation des donnees</h3>
        <p>Vos donnees sont utilisees pour : gerer votre compte, permettre la mise en relation entre conducteurs et passagers, traiter les paiements, envoyer des notifications liees au service, ameliorer nos services.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>3. Stockage des donnees</h3>
        <p>Vos donnees sont stockees de maniere securisee sur les serveurs Firebase de Google, situes dans l'Union Europeenne. Nous conservons vos donnees tant que votre compte est actif.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>4. Partage des donnees</h3>
        <p>Vos donnees ne sont jamais vendues a des tiers. Elles peuvent etre partagees avec : Stripe pour le traitement des paiements, Firebase/Google pour l'hebergement et l'authentification.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>5. Vos droits (RGPD)</h3>
        <p>Conformement au RGPD, vous disposez des droits suivants : droit d'acces a vos donnees, droit de rectification, droit de suppression, droit a la portabilite, droit d'opposition au traitement. Pour exercer ces droits, contactez-nous via la page Contact.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>6. Cookies</h3>
        <p>CovoitApp utilise des cookies techniques necessaires au fonctionnement du service (authentification, preferences). Aucun cookie publicitaire n'est utilise.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>7. Securite</h3>
        <p>Nous mettons en oeuvre des mesures de securite appropriees pour proteger vos donnees : chiffrement des communications (HTTPS), authentification securisee, regles d'acces strictes a la base de donnees.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>8. Contact</h3>
        <p>Pour toute question relative a vos donnees personnelles, contactez-nous via la page Contact de la plateforme.</p>
      </div>
    </div>
  );
}

export default Privacy;