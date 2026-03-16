import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useProjects } from "../../hooks/useProjects";

export const Projects = () => {
  const { user } = useAuth();
  const { projects, loading, error, loadProjects, addProject, removeProject } = useProjects(user?.uid);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });

  useEffect(() => {
    if (user?.uid) {
      loadProjects();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addProject({
        title: form.title,
        description: form.description,
      });
      setForm({ title: "", description: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`¿Seguro que deseas eliminar el proyecto "${title}"? Todos los recursos vinculados podrían quedar huérfanos.`)) {
      await removeProject(id);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Mis Proyectos</h1>
          <p>Gestiona tus investigaciones y tesis activas.</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', marginTop: 0 }} onClick={() => setIsModalOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Proyecto
        </button>
      </header>

      {error && <div className="auth-error">{error}</div>}

      {loading ? (
        <div className="empty-state">
          <p>Cargando proyectos...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <img src="/empty-projects.webp" alt="Sin Proyectos" className="empty-img" onError={(e) => e.target.style.display='none'} />
          <h3>No tienes proyectos aún</h3>
          <p>Comienza creando un proyecto para organizar tus recursos y tareas.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {projects.map((proj) => (
            <div key={proj.id} className="card">
              <h3>{proj.title}</h3>
              <p className="card-desc">
                {proj.description || "Sin descripción proporcionada."}
              </p>
              <div className="card-footer">
                <span className={`badge ${proj.status}`}>
                  {proj.status}
                </span>
                <button 
                  className="btn-icon" 
                  onClick={() => handleDelete(proj.id, proj.title)}
                  title="Eliminar proyecto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal basica */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Crear Proyecto</h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group mb">
                <label>Título del proyecto</label>
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
    </div>
  );
};
