import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useProjects } from "../../hooks/useProjects";
import { useResources } from "../../hooks/useResources";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

const INITIAL_FORM_STATE = {
  title: "", description: "", documentType: "documentation",
  sourceUrl: "", sourceName: "", author: "", publicationYear: "",
  publisher: "", keywords: "", status: "pending", priority: "medium", 
  notes: "", citationText: "", chapter: ""
};

export const Resources = () => {
  const { user } = useAuth();
  const { projects, loadProjects } = useProjects(user?.uid);
  
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const { resources, loading, error, loadResources, addResource, editResource, removeResource } = useResources(user?.uid, selectedProjectId);
  
  const [activeTab, setActiveTab] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM_STATE);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false, title: "", message: "", onConfirm: () => {}, isDestructive: false, confirmText: "Confirmar"
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

  const openNewModal = () => {
    setForm(INITIAL_FORM_STATE);
    setEditingResourceId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (resource) => {
    setForm({
      title: resource.title || "",
      description: resource.description || "",
      documentType: resource.documentType || "documentation",
      sourceUrl: resource.sourceUrl || "",
      sourceName: resource.sourceName || "",
      author: resource.author || "",
      publicationYear: resource.publicationYear || "",
      publisher: resource.publisher || "",
      keywords: resource.keywords ? resource.keywords.join(", ") : "",
      status: resource.status || "pending",
      priority: resource.priority || "medium",
      notes: resource.notes || "",
      citationText: resource.citationText || "",
      chapter: resource.chapter || ""
    });
    setEditingResourceId(resource.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !selectedProjectId) return;
    
    setIsSubmitting(true);
    try {
      if (editingResourceId) {
        await editResource(editingResourceId, form);
      } else {
        await addResource(form);
      }
      setForm(INITIAL_FORM_STATE);
      setIsModalOpen(false);
      setEditingResourceId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id, title) => {
    setConfirmConfig({
      isOpen: true,
      title: "Eliminar Recurso",
      message: `¿Seguro que deseas descartar el recurso "${title}" de tu biblioteca?`,
      isDestructive: true,
      confirmText: "Eliminar",
      onConfirm: async () => {
        await removeResource(id);
      }
    });
  };

  const handleToggleArchive = async (resource) => {
    try {
      await editResource(resource.id, { isArchived: !resource.isArchived });
    } catch (err) {
      console.error("Error archiving resource", err);
    }
  };

  const activeResources = resources.filter(r => !r.isArchived);
  const archivedResources = resources.filter(r => r.isArchived);
  const displayedResources = activeTab === "active" ? activeResources : archivedResources;

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
          onClick={openNewModal}
          disabled={!projects.length}
          title={!projects.length ? "Debes crear un proyecto primero" : ""}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Registrar Recurso
        </button>
      </header>

      {/* Selector de Proyectos y Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
        <div style={{ minWidth: '250px' }}>
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

        {selectedProjectId && (
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <button 
              className={activeTab === "active" ? "btn-primary" : "btn-secondary"} 
              style={{ padding: '0.5rem 1rem', width: 'auto', border: activeTab !== "active" ? 'none' : '' }}
              onClick={() => setActiveTab("active")}
            >
              Activos ({activeResources.length})
            </button>
            <button 
              className={activeTab === "archived" ? "btn-primary" : "btn-secondary"} 
              style={{ padding: '0.5rem 1rem', width: 'auto', border: activeTab !== "archived" ? 'none' : '' }}
              onClick={() => setActiveTab("archived")}
            >
              Archivados ({archivedResources.length})
            </button>
          </div>
        )}
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
      ) : displayedResources.length === 0 ? (
        <div className="empty-state">
          <img src="/empty-resources.webp" alt="Biblioteca Vacía" className="empty-img" onError={(e) => e.target.style.display='none'} />
          <h3>No hay recursos {activeTab === "archived" ? "archivados" : "activos"}</h3>
          <p>
            {activeTab === "archived" 
              ? "No tienes ningún recurso en el archivo." 
              : "Guarda referencias bibliográficas, artículos y repositorios enlazados a este proyecto."}
          </p>
        </div>
      ) : (
        <div className="grid-cards">
          {displayedResources.map((res) => (
            <div key={res.id} className="card" style={{ opacity: res.isArchived ? 0.7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ flex: 1, paddingRight: '1rem' }}>{res.title}</h3>
                <button 
                  className="btn-dots" 
                  style={{ display: 'block', padding: '0.4rem', border: '1px solid transparent' }}
                  onClick={() => handleToggleArchive(res)}
                  title={res.isArchived ? "Desarchivar recurso" : "Archivar recurso"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {res.isArchived ? (
                      <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4m-2-4v8"/> // Icono restaurar
                    ) : (
                      <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/> // Icono archivar
                    )}
                  </svg>
                </button>
              </div>
              <p className="card-desc" style={{ marginBottom: '1rem' }}>
                {res.description || "Sin descripción proporcionada."}
              </p>
              
              {res.sourceUrl ? (
                <a 
                  href={res.sourceUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-secondary" 
                  style={{ width: '100%', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}
                >
                   🔗 Visitar enlace original
                </a>
              ) : (
                <div style={{ padding: '0.625rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', borderRadius: '8px', marginBottom: '1rem' }}>
                  Este recurso no tiene link disponible
                </div>
              )}

              <div className="card-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${res.status === 'pending' ? 'pending' : 'active'}`}>
                  {res.documentType} • {res.status}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn-icon" 
                    onClick={() => openEditModal(res)}
                    title="Editar recurso"
                    disabled={res.isArchived}
                    style={{ opacity: res.isArchived ? 0.3 : 1, cursor: res.isArchived ? 'not-allowed' : 'pointer' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => confirmDelete(res.id, res.title)}
                    title="Eliminar recurso"
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

      {/* Modal Creación/Edición de Recurso */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '800px'}}>
            <div className="modal-header">
              <h2>{editingResourceId ? "Editar Recurso" : "Registrar Recurso"}</h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              
              <h4 style={{marginBottom: '1rem', color: 'var(--primary)'}}>Información Principal</h4>
              <div style={{display: 'grid', gridTemplateColumns: 'revert', gap: '1rem', rowGap: 0}}>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <div className="form-group mb" style={{flex: 2}}>
                    <label>Título *</label>
                    <input type="text" name="title" value={form.title} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group mb" style={{flex: 1}}>
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
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                <div className="form-group mb" style={{flex: 1}}>
                  <label>Autor(es)</label>
                  <input type="text" name="author" value={form.author} onChange={handleInputChange} placeholder="Ej. John Doe" />
                </div>
                <div className="form-group mb" style={{width: '120px'}}>
                  <label>Año de Publ.</label>
                  <input type="number" name="publicationYear" value={form.publicationYear} onChange={handleInputChange} placeholder="YYYY" />
                </div>
                <div className="form-group mb" style={{flex: 1}}>
                  <label>Capítulo / Sección</label>
                  <input type="text" name="chapter" value={form.chapter} onChange={handleInputChange} placeholder="Ej. Cap 3" />
                </div>
              </div>

              <h4 style={{marginBottom: '1rem', color: 'var(--primary)'}}>Origen & Metadatos</h4>
              <div style={{display: 'flex', gap: '1rem'}}>
                <div className="form-group mb" style={{flex: 1}}>
                  <label>Enlace de Origen (URL)</label>
                  <input type="url" name="sourceUrl" value={form.sourceUrl} onChange={handleInputChange} placeholder="https://..." />
                </div>
                <div className="form-group mb" style={{flex: 1}}>
                  <label>Nombre de la Fuente / Revista</label>
                  <input type="text" name="sourceName" value={form.sourceName} onChange={handleInputChange} placeholder="Ej. IEEE Xplore, Nature..." />
                </div>
              </div>

              <div className="form-group mb">
                <label>Palabras Clave (Separadas por coma)</label>
                <input type="text" name="keywords" value={form.keywords} onChange={handleInputChange} placeholder="Machine Learning, Redux, Performance..." />
              </div>

              <div className="form-group mb">
                <label>Descripción / Notas personales</label>
                <textarea name="description" value={form.description} onChange={handleInputChange} rows={3} placeholder="Resumen metodológico o puntos de interés..." />
              </div>

              <div className="form-group mb">
                <label>Cita Textual Importante</label>
                <textarea name="citationText" value={form.citationText} onChange={handleInputChange} rows={2} placeholder="'La eficiencia radica en...' (pág 45)" />
              </div>

              <div style={{display: 'flex', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem'}}>
                 <div className="form-group mb" style={{flex: 1}}>
                  <label>Estado de Lectura</label>
                  <select name="status" value={form.status} onChange={handleInputChange}>
                    <option value="pending">Pendiente de leer</option>
                    <option value="reading">Leyendo</option>
                    <option value="reviewed">Revisado</option>
                    <option value="cited">Citado en proyecto</option>
                  </select>
                </div>
                 <div className="form-group mb" style={{flex: 1}}>
                  <label>Relevancia / Prioridad</label>
                  <select name="priority" value={form.priority} onChange={handleInputChange}>
                    <option value="low">Baja (Opcional)</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta (Crítico)</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions" style={{marginTop: 0}}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: 0 }} disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : (editingResourceId ? "Guardar Cambios" : "Guardar Recurso")}
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
