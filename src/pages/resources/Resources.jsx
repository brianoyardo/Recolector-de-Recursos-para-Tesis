import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useProjects } from "../../hooks/useProjects";
import { useResources } from "../../hooks/useResources";

export const Resources = () => {
  const { user } = useAuth();
  const { projects, loadProjects } = useProjects(user?.uid);
  
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const { resources, loading, error, loadResources, addResource, removeResource } = useResources(user?.uid, selectedProjectId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", documentType: "documentation",
    sourceUrl: "", sourceName: "", author: "", publicationYear: "",
    publisher: "", keywords: "", status: "pending", priority: "medium", notes: ""
  });

  useEffect(() => {
    if (user?.uid) loadProjects();
  }, [user]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    if (selectedProjectId) {
      loadResources();
    }
  }, [selectedProjectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !selectedProjectId) return;
    
    setIsSubmitting(true);
    try {
      await addResource(form);
      setForm({
        title: "", description: "", documentType: "documentation",
        sourceUrl: "", sourceName: "", author: "", publicationYear: "",
        publisher: "", keywords: "", status: "pending", priority: "medium", notes: ""
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Biblioteca Académica</h1>
          <p>Toda tu bibliografía, enlaces y referencias en un solo lugar.</p>
        </div>
        <button 
          className="btn-primary" 
          style={{ width: 'auto', marginTop: 0 }} 
          onClick={() => setIsModalOpen(true)}
          disabled={!projects.length}
          title={!projects.length ? "Debes crear un proyecto primero" : ""}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Registrar Recurso
        </button>
      </header>

      {/* Selector de Proyectos */}
      <div style={{ marginBottom: '2rem', maxWidth: '400px' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          Explorar carpeta del proyecto:
        </label>
        <select 
          value={selectedProjectId} 
          onChange={(e) => setSelectedProjectId(e.target.value)}
          disabled={projects.length === 0}
        >
          {projects.length === 0 ? (
            <option value="">No hay proyectos disponibles</option>
          ) : (
            projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))
          )}
        </select>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {!selectedProjectId ? (
        <div className="empty-state">
          <p>Selecciona o crea un proyecto para ver sus recursos.</p>
        </div>
      ) : loading ? (
        <div className="empty-state">
          <p>Cargando biblioteca...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <img src="/empty-resources.webp" alt="Biblioteca Vacía" className="empty-img" onError={(e) => e.target.style.display='none'} />
          <h3>Biblioteca Vacía</h3>
          <p>Guarda referencias bibliográficas, artículos y repositorios enlazados a este proyecto.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {resources.map((res) => (
            <div key={res.id} className="card">
              <h3>{res.title}</h3>
              <p className="card-desc">
                {res.description || "Sin descripción proporcionada."}
                <br />
                {res.sourceUrl && (
                  <a href={res.sourceUrl} target="_blank" rel="noreferrer" style={{color: 'var(--primary)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'inline-block'}}>
                     🔗 Visitar enlace
                  </a>
                )}
              </p>
              <div className="card-footer">
                <span className={`badge ${res.status === 'pending' ? 'pending' : 'active'}`}>
                  {res.documentType} • {res.status}
                </span>
                <button 
                  className="btn-icon" 
                  onClick={() => window.confirm("¿Eliminar este recurso?") && removeResource(res.id)}
                  title="Eliminar recurso"
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

      {/* Modal Creación de Recurso */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '700px'}}>
            <div className="modal-header">
              <h2>Registrar Recurso</h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                 <div className="form-group mb">
                  <label>Título *</label>
                  <input type="text" name="title" value={form.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group mb">
                  <label>Tipo de Documento</label>
                  <select name="documentType" value={form.documentType} onChange={handleInputChange}>
                    <option value="documentation">Documentación</option>
                    <option value="book">Libro</option>
                    <option value="article">Artículo</option>
                    <option value="thesis">Tesis</option>
                    <option value="website">Sitio web</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              <div className="form-group mb">
                <label>Enlace de Origen (URL)</label>
                <input type="url" name="sourceUrl" value={form.sourceUrl} onChange={handleInputChange} placeholder="https://..." />
              </div>

              <div className="form-group mb">
                <label>Descripción / Cita Textual</label>
                <textarea name="description" value={form.description} onChange={handleInputChange} rows={3} />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                 <div className="form-group mb">
                  <label>Estado</label>
                  <select name="status" value={form.status} onChange={handleInputChange}>
                    <option value="pending">Pendiente de leer</option>
                    <option value="reading">Leyendo</option>
                    <option value="reviewed">Revisado</option>
                    <option value="cited">Citado</option>
                  </select>
                </div>
                 <div className="form-group mb">
                  <label>Prioridad</label>
                  <select name="priority" value={form.priority} onChange={handleInputChange}>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: 0 }} disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar Recurso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
