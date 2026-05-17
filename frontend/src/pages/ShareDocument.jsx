import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Download, Printer, ShieldCheck, Calendar, User, FileSignature, ArrowLeft, Check, Sparkles, Building2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { jsPDF } from 'jspdf';

export default function ShareDocument() {
  const { docId } = useParams();
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [docInfo, setDocInfo] = useState(null);

  // Normalize document ID and mock realistic metadata
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const idLower = (docId || '').toLowerCase();
    
    // Read dynamic params from URL or fallback to realistic defaults
    const owner = queryParams.get('owner') || "Maria Chen";
    const dept = queryParams.get('dept') || "Ingénierie";
    const date = queryParams.get('date') || "10 Nov, 2026";
    const subParam = queryParams.get('sub') || "";

    let title = "Attestation de Travail";
    let sub = subParam || "Certificate of Employment";
    let type = "work";
    let role = "Lead Software Engineer";

    if (owner !== "Maria Chen") {
      // Guess role based on department or default
      role = dept === "Ingénierie" ? "Software Engineer" : dept === "Finance" ? "Analyste Financier" : dept === "Conformité" ? "Chargé de Conformité" : "Collaborateur";
    }

    let docRef = `REF-RH-${Math.floor(100000 + Math.random() * 900000)}`;

    if (idLower.includes('salary') || idLower.includes('salaire') || idLower.includes('paie')) {
      title = "Attestation de Salaire";
      sub = subParam || "Salary Certificate & Income Statement";
      type = "salary";
    } else if (idLower.includes('compliance') || idLower.includes('conformite') || idLower.includes('checklist')) {
      title = "Fiche de Conformité";
      sub = subParam || "Regulatory Compliance Checklist";
      type = "compliance";
    }

    setDocInfo({
      title,
      sub,
      type,
      owner,
      role,
      dept,
      date,
      docRef,
      salary: "48,500 MAD / Mois",
      hiredDate: "15 Jan, 2024"
    });
  }, [docId]);

  const handleDownloadPDF = () => {
    if (!docInfo) return;
    setIsDownloading(true);
    showToast("Génération du document certifié...", "info");

    setTimeout(() => {
      try {
        const doc = new jsPDF();

        // Background decorative shapes
        doc.setFillColor(248, 250, 252);
        doc.rect(5, 5, 200, 287, 'F');
        
        // Double border for premium certificate feel
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(1);
        doc.rect(8, 8, 194, 281);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.rect(10, 10, 190, 277);

        // Header Slogan & Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text("RH MANAGEMENT S.A.", 105, 35, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text("CERTIFICATION NUMÉRIQUE OFFICIELLE", 105, 42, { align: "center" });

        // Logo Line separator
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(1.5);
        doc.line(85, 47, 125, 47);

        // Document Reference Box
        doc.setFillColor(239, 246, 255);
        doc.rect(15, 60, 180, 18, 'F');
        doc.setDrawColor(191, 219, 254);
        doc.setLineWidth(0.5);
        doc.rect(15, 60, 180, 18);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(29, 78, 216);
        doc.text(`RÉFÉRENCE D'AUTHENTICITÉ : ${docInfo.docRef}`, 22, 71);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(59, 130, 246);
        doc.text("Vérifié en ligne • Conforme aux registres RH", 188, 71, { align: "right" });

        // Title of Certificate
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(15, 23, 42);
        doc.text(docInfo.title.toUpperCase(), 105, 105, { align: "center" });

        doc.setFont("italic", "normal");
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text(docInfo.sub, 105, 112, { align: "center" });

        // Statement Body
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        
        let statement = "";
        if (docInfo.type === 'salary') {
          statement = `La Direction des Ressources Humaines de la société RH Management S.A. certifie par la présente que Collaborateur(trice) ${docInfo.owner}, occupant le poste de ${docInfo.role} au sein du département ${docInfo.dept}, perçoit un salaire brut mensuel de ${docInfo.salary}.\n\nCe document est délivré à l'intéressé(e) pour servir et valoir ce que de droit, certifié et scellé numériquement conformément aux règlements de l'entreprise.`;
        } else if (docInfo.type === 'compliance') {
          statement = `Nous certifions que le document "${docInfo.title}" de l'employé(e) ${docInfo.owner} a été audité et validé par notre comité de conformité légale et interne le ${docInfo.date}.\n\nToutes les pièces justificatives associées ont été dument contrôlées et archivées conformément aux normes d'audit RH en vigueur.`;
        } else {
          statement = `La Direction des Ressources Humaines de la société RH Management S.A. certifie par la présente que Collaborateur(trice) ${docInfo.owner} est employé(e) au sein de notre entreprise depuis le ${docInfo.hiredDate} en qualité de ${docInfo.role}.\n\nCe document est délivré à l'intéressé(e) pour servir et valoir ce que de droit, dument authentifié dans nos registres centraux.`;
        }

        const splitText = doc.splitTextToSize(statement, 160);
        doc.text(splitText, 25, 135, { lineHeightFactor: 1.6 });

        // Metadata grid
        doc.setFillColor(248, 250, 252);
        doc.rect(25, 185, 160, 32, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.rect(25, 185, 160, 32);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text("Date de délivrance :", 30, 195);
        doc.text("Statut de certification :", 30, 203);
        doc.text("Organisme émetteur :", 30, 211);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(docInfo.date, 80, 195);
        doc.setTextColor(16, 185, 129);
        doc.setFont("helvetica", "bold");
        doc.text("ACTIF & VÉRIFIÉ (CONFORME)", 80, 203);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text("Direction Générale RH Management S.A.", 80, 211);

        // Signatures & digital seal
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text("Signature & Sceau RH", 145, 235, { align: "center" });

        // Decorative seal circle
        doc.setDrawColor(16, 185, 129);
        doc.setFillColor(240, 253, 250);
        doc.setLineWidth(1);
        doc.circle(145, 252, 12, 'FD');
        doc.setFontSize(7);
        doc.setTextColor(5, 150, 105);
        doc.text("RH SIGN", 145, 251, { align: "center" });
        doc.text("SECURE", 145, 255, { align: "center" });

        // Document footer secure text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("© 2026 RH Management S.A. - Document sécurisé numériquement.", 105, 275, { align: "center" });

        doc.save(`${docInfo.title.toLowerCase().replace(/\s+/g, '_')}_certifie.pdf`);
        showToast("Téléchargement lancé avec succès !", "success");
      } catch (err) {
        console.error(err);
        showToast("Erreur lors de la génération du PDF.", "error");
      } finally {
        setIsDownloading(false);
      }
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!docInfo) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className="animate-spin" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #3B82F6', borderTopColor: 'transparent' }} />
          <p style={{ color: '#64748B', fontWeight: 600 }}>Chargement de l'authenticité du document...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: 'radial-gradient(circle at top left, #F8FAFC 0%, #E2E8F0 100%)', padding: '40px 20px', fontFamily: 'inherit' }}>
      
      {/* Printable Area Override */}
      <style>{`
        @media print {
          /* Hide all non-printable components */
          .no-print,
          .no-print * {
            display: none !important;
          }
          
          /* Reset root layout grids and flex containers */
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          #root {
            background: transparent !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          /* Force page background to white and reset padding */
          div[style*="radial-gradient"] {
            background: #ffffff !important;
            padding: 0 !important;
            min-height: auto !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          .grid-responsive-share {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Center l-card on A4 paper */
          .printable-card {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            border: none !important;
            box-shadow: none !important;
            padding: 40px !important;
            margin: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }} className="grid-responsive-share">
        
        {/* Left Side: Premium Paper Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Glassmorphic Verification Header */}
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.8)', padding: '16px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 25px rgba(148, 163, 184, 0.08)' }} className="no-print">
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', flexShrink: 0, justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>Document Authentique & Certifié</h4>
                <span style={{ fontSize: '0.7rem', background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '99px', fontWeight: 700, letterSpacing: '0.05em' }}>REGISTRE OK</span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.825rem', color: '#64748B' }}>Ce document officiel est délivré par le système de gestion RH Management S.A.</p>
            </div>
          </div>

          {/* High Fidelity Certificate Paper Layout */}
          <div 
            className="printable-card" 
            style={{ 
              background: '#ffffff', 
              borderRadius: '20px', 
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(0,0,0,0.02)', 
              padding: '60px 80px', 
              position: 'relative', 
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              minHeight: '750px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            {/* Watermark Logo backdrop */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.025, pointerEvents: 'none', width: '380px', height: '380px' }}>
              <Building2 size={380} color="#1E3A8A" />
            </div>

            {/* Corner Decorative Borders */}
            <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', border: '1px solid rgba(37,99,235,0.05)', borderRadius: '12px', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', border: '2px solid rgba(37,99,235,0.15)', borderRadius: '10px', pointerEvents: 'none' }} />

            <div>
              {/* Top Seal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #F1F5F9', paddingBottom: '24px', marginBottom: '40px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em' }}>RH MANAGEMENT S.A.</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>GESTION INTERNE & CONTRACTUELLE</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>RÉFÉRENCE D'AUTHENTICITÉ</span>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2563EB', marginTop: '2px', background: '#EFF6FF', padding: '4px 12px', borderRadius: '6px' }}>{docInfo.docRef}</div>
                </div>
              </div>

              {/* Certificate Main Title */}
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>{docInfo.title}</h1>
                <p style={{ fontSize: '0.95rem', color: '#64748B', margin: '8px 0 0', fontStyle: 'italic' }}>{docInfo.sub}</p>
              </div>

              {/* Certificate content statement */}
              <div style={{ fontSize: '1.1rem', color: '#334155', lineHeight: 1.8, marginBottom: '40px', fontWeight: 400, textAlign: 'justify' }}>
                {docInfo.type === 'salary' ? (
                  <p>
                    La Direction des Ressources Humaines de la société <strong>RH Management S.A.</strong> certifie par la présente que Collaborateur(trice) <strong>{docInfo.owner}</strong>, occupant le poste de <strong>{docInfo.role}</strong> au sein du département <strong>{docInfo.dept}</strong>, perçoit un salaire brut mensuel de <strong>{docInfo.salary}</strong>.
                    <br /><br />
                    Ce document est délivré à l'intéressé(e) pour servir et valoir ce que de droit, certifié et scellé numériquement conformément aux règlements de l'entreprise.
                  </p>
                ) : docInfo.type === 'compliance' ? (
                  <p>
                    Nous certifions que le document "<strong>{docInfo.title}</strong>" de l'employé(e) <strong>{docInfo.owner}</strong> a été audité et validé par notre comité de conformité légale et interne le <strong>{docInfo.date}</strong>.
                    <br /><br />
                    Toutes les pièces justificatives associées ont été dument contrôlées et archivées conformément aux normes d'audit RH en vigueur.
                  </p>
                ) : (
                  <p>
                    La Direction des Ressources Humaines de la société <strong>RH Management S.A.</strong> certifie par la présente que Collaborateur(trice) <strong>{docInfo.owner}</strong> est employé(e) au sein de notre entreprise depuis le <strong>{docInfo.hiredDate}</strong> en qualité de <strong>{docInfo.role}</strong>.
                    <br /><br />
                    Ce document est délivré à l'intéressé(e) pour servir et valoir ce que de droit, dument authentifié dans nos registres centraux.
                  </p>
                )}
              </div>
            </div>

            {/* Validation Grid Footer */}
            <div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }} className="share-info-grid">
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Collaborateur</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>{docInfo.owner}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{docInfo.role}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Certification Statut</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#16A34A', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                    CONFORME & ACTIF
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Scellé le {docInfo.date}</div>
                </div>
              </div>

              {/* Bottom Sign-off block */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', maxWidth: '300px' }}>
                  <p style={{ margin: 0 }}>* Document officiel validé numériquement. L'authenticité peut être vérifiée en direct sur le serveur central RH.</p>
                </div>
                <div style={{ textAlign: 'center', position: 'relative' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Direction Générale RH</div>
                  
                  {/* Visual Seal Stamp */}
                  <div style={{ border: '2px dashed #10B981', color: '#10B981', width: '90px', height: '90px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto', background: 'rgba(240, 253, 250, 0.4)', transform: 'rotate(-8deg)' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>RH MANAGEMENT</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>VALIDÉ</span>
                    <span style={{ fontSize: '0.55rem', fontWeight: 700 }}>10 NOV 2026</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Action sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="no-print">
          
          {/* Main Actions Panel */}
          <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Options de téléchargement</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={handleDownloadPDF} 
                disabled={isDownloading}
                style={{ 
                  width: '100%', 
                  height: '46px', 
                  borderRadius: '10px', 
                  background: '#2563EB', 
                  color: 'white', 
                  border: 'none', 
                  fontWeight: 600, 
                  fontSize: '0.9rem', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '10px',
                  transition: 'background 0.2s',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1D4ED8'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#2563EB'}
              >
                {isDownloading ? (
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent', animation: 'spin 1s infinite linear' }} />
                ) : (
                  <>
                    <Download size={18} />
                    Télécharger le PDF Certifié
                  </>
                )}
              </button>

              <button 
                onClick={handlePrint}
                style={{ 
                  width: '100%', 
                  height: '46px', 
                  borderRadius: '10px', 
                  background: '#F1F5F9', 
                  color: '#475569', 
                  border: '1px solid #E2E8F0', 
                  fontWeight: 600, 
                  fontSize: '0.9rem', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '10px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F1F5F9'}
              >
                <Printer size={18} />
                Imprimer le Document
              </button>
            </div>

            <div style={{ height: '1px', background: '#E2E8F0', margin: '20px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.825rem', color: '#64748B' }}>
                <Check size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Format imprimable optimisé</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.825rem', color: '#64748B' }}>
                <Check size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Sceau d'authenticité infalsifiable</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.825rem', color: '#64748B' }}>
                <Check size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Vérification d'empreinte digitale RH</span>
              </div>
            </div>

          </div>

          {/* Secure Watermark Info Banner */}
          <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', borderRadius: '16px', padding: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
              <ShieldCheck size={120} />
            </div>
            
            <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} style={{ color: '#10B981' }} />
              Sécurité renforcée
            </h4>
            <p style={{ margin: 0, fontSize: '0.775rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Ce document est cryptographiquement signé et certifié conforme. Toute altération physique ou numérique de cette attestation invalide sa signature électronique.
            </p>
          </div>

          {/* Back button to app dashboard */}
          <Link 
            to="/dashboard" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '0.85rem', 
              fontWeight: 600, 
              color: '#475569', 
              textDecoration: 'none', 
              alignSelf: 'center' 
            }}
          >
            <ArrowLeft size={16} />
            Retourner au Dashboard
          </Link>

        </div>

      </div>

      {/* Embedded generic animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .grid-responsive-share {
            grid-template-columns: 1fr !important;
          }
          .printable-card {
            padding: 30px 20px !important;
          }
        }
      `}</style>

    </div>
  );
}
