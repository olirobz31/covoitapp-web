import React from 'react';

function CGU() {
  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <h2 className="page-title">Conditions Generales d'Utilisation</h2>

      <div className="card">
        <p style={{ color: 'var(--text-gray)', marginBottom: '20px' }}>
          Derniere mise a jour : Fevrier 2026
        </p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>1. Objet</h3>
        <p>Les presentes Conditions Generales d'Utilisation (CGU) ont pour objet de definir les modalites d'utilisation de la plateforme CovoitApp, accessible via le site web et l'application mobile.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>2. Description du service</h3>
        <p>CovoitApp est une plateforme de mise en relation entre conducteurs et passagers souhaitant partager un trajet en covoiturage. Le service permet de publier des trajets, rechercher des trajets disponibles et effectuer des reservations.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>3. Inscription</h3>
        <p>L'utilisation du service necessite la creation d'un compte. L'utilisateur s'engage a fournir des informations exactes et a jour. Chaque utilisateur est responsable de la confidentialite de ses identifiants de connexion.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>4. Utilisation du service</h3>
        <p>Les utilisateurs s'engagent a utiliser la plateforme de maniere loyale et conforme a sa destination. Il est interdit de publier de fausses annonces, d'utiliser le service a des fins illegales ou de perturber le fonctionnement de la plateforme.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>5. Reservations et paiements</h3>
        <p>Les reservations sont effectuees via la plateforme. Le paiement est securise par Stripe. Le montant est debite au moment de la reservation. En cas d'annulation, les conditions de remboursement s'appliquent selon les delais prevus.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>6. Responsabilites</h3>
        <p>CovoitApp agit en tant qu'intermediaire et ne peut etre tenu responsable du deroulement des trajets. Les conducteurs sont responsables du respect du code de la route et de la securite des passagers. Les utilisateurs sont responsables de leurs interactions.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>7. Donnees personnelles</h3>
        <p>Les donnees personnelles sont traitees conformement a notre Politique de Confidentialite et au Reglement General sur la Protection des Donnees (RGPD).</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>8. Modification des CGU</h3>
        <p>CovoitApp se reserve le droit de modifier les presentes CGU a tout moment. Les utilisateurs seront informes de toute modification par notification sur la plateforme.</p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>9. Contact</h3>
        <p>Pour toute question relative aux presentes CGU, vous pouvez nous contacter via la page Contact de la plateforme.</p>
      </div>
    </div>
  );
}

export default CGU;