import "../../styles/components.css";

export const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  isDestructive = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn-secondary" onClick={onCancel} style={{ flex: 1, margin: 0 }}>
            {cancelText}
          </button>
          <button 
            className="btn-primary" 
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            style={{ 
              flex: 1, 
              margin: 0, 
              backgroundColor: isDestructive ? 'var(--danger)' : 'var(--primary)' 
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
