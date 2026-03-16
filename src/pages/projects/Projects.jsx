import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useProjects } from "../../hooks/useProjects";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

export const Projects = () => {
  const { user } = useAuth();
  const { projects, loading, error, loadProjects, addProject, editProject, removeProject } = useProjects(user?.uid);
  
  const [filterStatus, setFilterStatus] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  
  // Estado para el modal de confirmación unificado
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDestructive: false,
    confirmText: "Confirmar"
  });

  useEffect(() => {
    if (user?.uid) loadProjects();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addProject({
        title: form.title,
        description: form.description,
        status: "active"
      });
      setForm({ title: "", description: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id, title) => {
    setConfirmConfig({
      isOpen: true,
      title: "Eliminar Proyecto",
      message: `¿Seguro que deseas eliminar definitivamente el proyecto "${title}"? Esta acción es irreversible y los recursos vinculados podrían quedar huérfanos.`,
      isDestructive: true,
      confirmText: "Eliminar",
      onConfirm: async () => {
        await removeProject(id);
      }
    });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await editProject(id, { status: newStatus });
  };

  const filteredProjects = projects.filter(p => (p.status || "active") === filterStatus);

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Mis Proyectos</h1>
          <p>Gestiona tus investigaciones y tesis.</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', marginTop: 0 }} onClick={() => setIsModalOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Proyecto
        </button>
      </header>

      {/* Selector de Pestañas Activo/Inactivo */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
            fontWeight: filterStatus === "active" ? 600 : 400,
            color: filterStatus === "active" ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: filterStatus === "active" ? '2px solid var(--primary)' : '2px solid transparent'
          }}
          onClick={() => setFilterStatus("active")}
        >
          Activos
        </button>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
            fontWeight: filterStatus === "inactive" ? 600 : 400,
            color: filterStatus === "inactive" ? 'var(--text-main)' : 'var(--text-muted)',
            borderBottom: filterStatus === "inactive" ? '2px solid var(--text-muted)' : '2px solid transparent'
          }}
          onClick={() => setFilterStatus("inactive")}
        >
          Archivados
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {loading ? (
        <div className="empty-state">
          <p>Cargando proyectos...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state">
          {filterStatus === "active" ? (
            <>
              <img src="/empty-projects.webp" alt="Sin Proyectos" className="empty-img" onError={(e) => e.target.style.display='none'} />
              <h3>Bienvenido a tu Espacio</h3>
              <p>Comienza creando un proyecto para organizar tus recursos y tareas.</p>
            </>
          ) : (
             <>
              <h3>Vacío</h3>
              <p>No tienes proyectos archivados. Usa el botón "Archivar" en un proyecto activo para limpiarlo de la vista actual.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid-cards">
          {filteredProjects.map((proj) => (
            <div key={proj.id} className="card" style={{ opacity: proj.status === 'inactive' ? 0.7 : 1 }}>
              <h3>{proj.title}</h3>
              <p className="card-desc">
                {proj.description || "Sin descripción"}
              </p>
              
              <div className="card-footer">
                <span className={`badge ${proj.status === 'inactive' ? 'pending' : 'active'}`}>
                  {proj.status === 'inactive' ? 'Archivado' : 'Activo'}
                </span>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn-icon" 
                    onClick={() => handleToggleStatus(proj.id, proj.status || "active")}
                    title={proj.status === "inactive" ? "Restaurar Proyecto" : "Archivar Proyecto"}
                  >
                    {proj.status === "inactive" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                    )}
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => confirmDelete(proj.id, proj.title)}
                    title="Eliminar permanentemente"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Creación */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Crear Proyecto</h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group mb">
                <label>Título del proyecto *</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder="Ej. Tesis sobre Inteligencia Artificial"
                  required
                />
              </div>
              <div className="form-group mb">
                <label>Descripción</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Breve resumen de los objetivos del proyecto..."
                  rows={4}
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: 0 }} disabled={isSubmitting}>
                  {isSubmitting ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal genérico de Confirmación */}
      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        confirmText={confirmConfig.confirmText}
        isDestructive={confirmConfig.isDestructive}
      />
    </div>
  );
};
