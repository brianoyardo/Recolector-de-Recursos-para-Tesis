import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useProjects } from "../../hooks/useProjects";
import { useTasks } from "../../hooks/useTasks";

export const Tasks = () => {
  const { user } = useAuth();
  const { projects, loadProjects } = useProjects(user?.uid);
  
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const { tasks, loading, error, loadTasks, addTask, toggleTaskStatus, removeTask } = useTasks(user?.uid, selectedProjectId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium", dueDate: ""
  });

  // Cargar proyectos primero
  useEffect(() => {
    if (user?.uid) loadProjects();
  }, [user]);

  // Si no hay proyecto seleccionado pero hay proyectos, autoseleccionar el primero
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  // Cargar tareas al cambiar el proyecto seleccionado
  useEffect(() => {
    if (selectedProjectId) {
      loadTasks();
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
      await addTask({ ...form, projectId: selectedProjectId });
      setForm({ title: "", description: "", priority: "medium", dueDate: "" });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating task", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Gestor de Tareas</h1>
          <p>Supervisa tus pendientes y organiza tu flujo de investigación.</p>
        </div>
        <button 
          className="btn-primary" 
          style={{ width: 'auto', marginTop: 0 }} 
          onClick={() => setIsModalOpen(true)}
          disabled={!projects.length}
          title={!projects.length ? "Debes crear un proyecto primero" : ""}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Tarea
        </button>
      </header>

      {/* Select Project Filter */}
      <div style={{ marginBottom: '2rem', maxWidth: '400px' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          Explorar tareas del proyecto:
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
          <p>Selecciona o crea un proyecto para ver sus tareas.</p>
        </div>
      ) : loading ? (
        <div className="empty-state">
          <p>Cargando lista de tareas...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <img src="/empty-tasks.webp" alt="Sin Tareas" className="empty-img" onError={(e) => e.target.style.display='none'} />
          <h3>Todo al día</h3>
          <p>No tienes tareas pendientes para este proyecto. ¡Buen trabajo!</p>
        </div>
      ) : (
        <div className="grid-cards">
          {tasks.map((task) => (
            <div key={task.id} className="card" style={{ opacity: task.status === 'completed' ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                  {task.title}
                </h3>
                <input 
                  type="checkbox" 
                  checked={task.status === 'completed'}
                  onChange={() => toggleTaskStatus(task.id, task.status)}
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
              </div>
              
              <p className="card-desc">
                {task.description || "Sin descripción"}
              </p>
              
              {task.dueDate && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  📅 Vencimiento: {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}
              
              <div className="card-footer">
                <span className={`badge ${task.status === 'completed' ? 'completed' : 'pending'}`}>
                  Prioridad: {task.priority}
                </span>
                <button 
                  className="btn-icon" 
                  onClick={() => window.confirm("¿Eliminar esta tarea?") && removeTask(task.id)}
                  title="Eliminar tarea"
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

      {/* Modal Creación de Tarea */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Crear Tarea</h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group mb">
                <label>Título de la Tarea *</label>
                <input type="text" name="title" value={form.title} onChange={handleInputChange} required />
              </div>

              <div className="form-group mb">
                <label>Descripción</label>
                <textarea name="description" value={form.description} onChange={handleInputChange} rows={3} />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                 <div className="form-group mb">
                  <label>Prioridad</label>
                  <select name="priority" value={form.priority} onChange={handleInputChange}>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                 <div className="form-group mb">
                  <label>Fecha de Vencimiento</label>
                  <input type="date" name="dueDate" value={form.dueDate} onChange={handleInputChange} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: 0 }} disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar Tarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
