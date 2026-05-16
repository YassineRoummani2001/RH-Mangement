import React from 'react';

const Compliance = () => {
  return (
    <>
      <header className="header">
        <div className="header-title">
          <h1>Suivi de la Conformité</h1>
          <p>Suivez la conformité de l'entreprise aux politiques et réglementations</p>
        </div>
        <div className="header-actions">
          <button className="action-btn primary">
            <i className="fas fa-file-export"></i> Exporter Rapport
          </button>
        </div>
      </header>

      <div className="middle-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Training Compliance */}
        <div className="card">
          <div className="card-title">
            <i className="fas fa-graduation-cap" style={{ color: 'var(--primary)' }}></i>
            Formations Obligatoires
          </div>
          
          <div className="progress-item">
            <div className="progress-header">
              <span>Code de Conduite</span>
              <span style={{ color: 'var(--success)' }}>98%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '98%', backgroundColor: 'var(--success)' }}></div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span>Sensibilisation Cybersécurité</span>
              <span style={{ color: 'var(--success)' }}>85%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '85%', backgroundColor: 'var(--success)' }}></div>
            </div>
          </div>

          <div className="progress-item" style={{ marginBottom: 0 }}>
            <div className="progress-header">
              <span>Formation Anti-Harcèlement</span>
              <span style={{ color: 'var(--warning)' }}>70%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '70%', backgroundColor: 'var(--warning)' }}></div>
            </div>
          </div>
        </div>

        {/* Legal & Regulatory */}
        <div className="card">
          <div className="card-title">
            <i className="fas fa-balance-scale" style={{ color: 'var(--primary)' }}></i>
            Légal & Réglementaire
          </div>
          
          <div className="progress-item">
            <div className="progress-header">
              <span>RGPD / Protection des Données</span>
              <span style={{ color: 'var(--success)' }}>100%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '100%', backgroundColor: 'var(--success)' }}></div>
            </div>
          </div>

          <div className="progress-item">
            <div className="progress-header">
              <span>Sécurité au Travail (SST)</span>
              <span style={{ color: 'var(--warning)' }}>82%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '82%', backgroundColor: 'var(--warning)' }}></div>
            </div>
          </div>

          <div className="progress-item" style={{ marginBottom: 0 }}>
            <div className="progress-header">
              <span>Égalité des Chances</span>
              <span style={{ color: 'var(--success)' }}>95%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '95%', backgroundColor: 'var(--success)' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px', padding: 0, overflow: 'hidden' }}>
        <div className="table-toolbar">
          <h3 className="modern-table-title">
            <i className="fas fa-exclamation-triangle" style={{ color: '#E11D48', marginRight: '10px' }}></i>
            Employés Non Conformes
          </h3>
          <div className="filter-group">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher..." />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employé</th>
                <th>Exigence Manquante</th>
                <th>Date Limite</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="user-cell">
                    <div className="avatar-initials" style={{ background: '#F59E0B' }}>MB</div>
                    <div>
                      <span className="user-info-name">Michael Brown</span>
                      <span className="user-info-sub">michael.b@company.com</span>
                    </div>
                  </div>
                </td>
                <td><span className="modern-status-badge" style={{ background: '#FFE4E6', color: '#E11D48' }}>Formation Anti-Harcèlement</span></td>
                <td><span style={{ color: '#E11D48', fontWeight: 700 }}>En retard (2 j)</span></td>
                <td style={{ textAlign: 'right' }}>
                  <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                    <button className="modern-action-btn" title="Envoyer Rappel"><i className="fas fa-paper-plane"></i></button>
                    <button className="modern-action-btn"><i className="far fa-edit"></i></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="user-cell">
                    <div className="avatar-initials" style={{ background: '#2563EB' }}>LW</div>
                    <div>
                      <span className="user-info-name">Linda White</span>
                      <span className="user-info-sub">linda.w@company.com</span>
                    </div>
                  </div>
                </td>
                <td><span className="modern-status-badge" style={{ background: '#FEF3C7', color: '#D97706' }}>Cybersécurité</span></td>
                <td style={{ color: '#64748B', fontWeight: 600 }}>15 Nov, 2026</td>
                <td style={{ textAlign: 'right' }}>
                  <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                    <button className="modern-action-btn" title="Envoyer Rappel"><i className="fas fa-paper-plane"></i></button>
                    <button className="modern-action-btn"><i className="far fa-edit"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Compliance;
