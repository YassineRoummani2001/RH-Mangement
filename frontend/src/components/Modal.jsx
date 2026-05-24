import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, icon, iconColor = 'var(--primary)', iconBg = 'var(--primary-bg)', submitColor = 'var(--primary)', children, onSubmit, submitText = 'Enregistrer', showFooter = true, isSubmitDisabled = false }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
            {icon && (
              <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '10px', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                <i className={icon}></i>
              </div>
            )}
            <h2 style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h2>
          </div>
          <button className="modal-close" onClick={onClose} style={{ marginLeft: '12px' }}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {showFooter && (
          <div className="modal-footer">
            <button className="btn-modal-cancel" onClick={onClose}>
              Annuler
            </button>
            <button className="btn-modal-submit" onClick={onSubmit} style={{ backgroundColor: submitColor, opacity: isSubmitDisabled ? 0.5 : 1, cursor: isSubmitDisabled ? 'not-allowed' : 'pointer' }} disabled={isSubmitDisabled}>
              {submitText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
