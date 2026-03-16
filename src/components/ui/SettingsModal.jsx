import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { themeMode, changeTheme, accentColor, changeAccentColor } = useTheme();
  const [localTheme, setLocalTheme] = useState(themeMode);
  const [localColor, setLocalColor] = useState(accentColor || '#10B981');

  if (!isOpen) return null;

  const handleSave = () => {
    changeTheme(localTheme);
    changeAccentColor(localColor);
    onClose();
  };

  const presetColors = [
    { name: 'Indigo', value: '#4F46E5' },
    { name: 'Esmeralda', value: '#10B981' },
    { name: 'Océano', value: '#0EA5E9' },
    { name: 'Amatista', value: '#8B5CF6' },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>Preferencias de Apariencia</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        
        <div className="form-group mb" style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Esquema de Color</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button 
              type="button" 
              className={`btn-secondary ${localTheme === 'light' ? 'btn-primary' : ''}`}
              style={{ margin: 0, padding: '0.5rem' }}
              onClick={() => setLocalTheme('light')}
            >
              ☀️ Claro
            </button>
            <button 
              type="button" 
              className={`btn-secondary ${localTheme === 'dark' ? 'btn-primary' : ''}`}
              style={{ margin: 0, padding: '0.5rem' }}
              onClick={() => setLocalTheme('dark')}
            >
              🌙 Oscuro
            </button>
          </div>
        </div>

        <div className="form-group mb" style={{ marginTop: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Color de Acento</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {presetColors.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.name}
                onClick={() => setLocalColor(c.value)}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: c.value,
                  border: localColor === c.value ? '3px solid var(--text-main)' : '2px solid transparent',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              />
            ))}
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '2rem' }}>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" style={{ width: 'auto', marginTop: 0 }} onClick={handleSave}>
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
