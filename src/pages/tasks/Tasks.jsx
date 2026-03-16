import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useProjects } from "../../hooks/useProjects";
import { useTasks } from "../../hooks/useTasks";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
};

const TaskCard = ({
  task,
  isOverdue,
  isCompleted,
  openMenuId,
  setOpenMenuId,
  onDragStart,
  editTask,
  openEditModal,
  confirmDelete,
}) => {
  const menuRef = useRef(null);
  const isOpen = openMenuId === task.id;

  useOnClickOutside(menuRef, (event) => {
    if (event.target.closest(`#btn-dots-${task.id}`)) return;
    if (isOpen) {
      setOpenMenuId(null);
    }
  });

  const toggleMenu = () => {
    setOpenMenuId(isOpen ? null : task.id);
  };

  return (
    <div
      className={`task-card ${isCompleted ? "completed-task" : ""}`}
      draggable={!isCompleted}
      onDragStart={(e) => !isCompleted && onDragStart(e, task.id)}
    >
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        <button
          id={`btn-dots-${task.id}`}
          className="btn-dots"
          onClick={toggleMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>

      <div ref={menuRef} className={`mobile-task-menu ${isOpen ? "open" : ""}`}>
        {!isCompleted && (
          <button
            onClick={() => {
              setOpenMenuId(null);
              editTask(task.id, { status: "Completada" });
            }}
            className="text-success"
          >
            Marcar Completado
          </button>
        )}
        {isCompleted && (
          <button
            onClick={() => {
              setOpenMenuId(null);
              editTask(task.id, { status: "Pendiente" });
            }}
          >
            Regresar a Pendiente
          </button>
        )}
        {!isCompleted && (
          <button
            onClick={() => {
              setOpenMenuId(null);
              openEditModal(task);
            }}
          >
            Editar Tarea
          </button>
        )}
        <button
          onClick={() => {
            setOpenMenuId(null);
            confirmDelete(task.id, task.title);
          }}
          className="text-danger"
        >
          Eliminar Tarea
        </button>
      </div>

      <p className="task-card-desc">{task.description || "Sin descripción"}</p>

      <div className="task-card-footer">
        <span className={`badge ${isCompleted ? "Completada" : "Pendiente"}`}>
          {task.priority}
        </span>

        {task.dueDate && !isCompleted && (
          <div className={`task-date ${isOverdue ? "overdue-text" : ""}`}>
            📅 {new Date(task.dueDate + "T00:00:00").toLocaleDateString()}
          </div>
        )}
        {task.completedAt && isCompleted && (
          <div className="task-date">
            ✅{" "}
            {task.completedAt?.toDate
              ? task.completedAt.toDate().toLocaleDateString()
              : new Date(task.completedAt).toLocaleDateString()}
          </div>
        )}

        <div className="desktop-actions">
          {!isCompleted && (
            <button
              className="btn-icon"
              onClick={() => openEditModal(task)}
              title="Editar tarea"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          )}
          <button
            className="btn-icon"
            onClick={() => confirmDelete(task.id, task.title)}
            title="Eliminar tarea"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const Tasks = () => {
  const { user } = useAuth();
  const { projects, loadProjects } = useProjects(user?.uid);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const { tasks, loading, error, loadTasks, addTask, editTask, removeTask } =
    useTasks(user?.uid, selectedProjectId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM_STATE);

  const [openMenuId, setOpenMenuId] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDestructive: false,
    confirmText: "Confirmar",
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const today = new Date(todayStr + "T00:00:00");

  const activeTasks = tasks.filter(
    (t) =>
      t.status !== "completed" &&
      (!t.dueDate || new Date(t.dueDate + "T00:00:00") >= today),
  );
  const overdueTasks = tasks.filter(
    (t) =>
      t.status !== "completed" &&
      t.dueDate &&
      new Date(t.dueDate + "T00:00:00") < today,
  );
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const onDragStart = (e, id) => {
    e.dataTransfer.setData("taskId", id);
  };

  const onDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    try {
      if (targetStatus === "completed") {
        await editTask(taskId, { status: "completed" });
      } else if (targetStatus === "pending") {
        await editTask(taskId, { status: "pending" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openNewModal = () => {
    setForm(INITIAL_FORM_STATE);
    setEditingTaskId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      dueDate: task.dueDate || "",
    });
    setEditingTaskId(task.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !selectedProjectId) return;

    setIsSubmitting(true);
    try {
      if (editingTaskId) {
        await editTask(editingTaskId, form);
      } else {
        await addTask({ ...form, projectId: selectedProjectId });
      }
      setForm(INITIAL_FORM_STATE);
      setIsModalOpen(false);
      setEditingTaskId(null);
    } catch (err) {
      console.error("Error saving task", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id, title) => {
    setConfirmConfig({
      isOpen: true,
      title: "Eliminar Tarea",
      message: `¿Seguro que deseas eliminar la tarea "${title}" en este proyecto?`,
      isDestructive: true,
      confirmText: "Eliminar",
      onConfirm: async () => {
        await removeTask(id);
      },
    });
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
          style={{ width: "auto", marginTop: 0 }}
          onClick={openNewModal}
          disabled={!projects.length}
          title={!projects.length ? "Debes crear un proyecto primero" : ""}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nueva Tarea
        </button>
      </header>

      {/* Select Project Filter */}
      <div style={{ marginBottom: "2rem", maxWidth: "400px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-muted)",
          }}
        >
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
            projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
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
          <img
            src="/empty-tasks.webp"
            alt="Sin Tareas"
            className="empty-img"
            onError={(e) => (e.target.style.display = "none")}
          />
          <h3>Todo al día</h3>
          <p>No tienes tareas pendientes para este proyecto. ¡Buen trabajo!</p>
        </div>
      ) : (
        <div className="kanban-board">
          {/* Columna: Activo en plazo */}
          <div
            className="kanban-column active"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, "pending")}
          >
            <div className="kanban-column-header">
              <span className="kanban-column-title">Activo en plazo</span>
              <span className="kanban-column-count">{activeTasks.length}</span>
            </div>
            {activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isOverdue={false}
                isCompleted={false}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onDragStart={onDragStart}
                editTask={editTask}
                openEditModal={openEditModal}
                confirmDelete={confirmDelete}
              />
            ))}
          </div>

          {/* Columna: Vencido */}
          <div
            className="kanban-column overdue"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, "pending")}
          >
            <div className="kanban-column-header">
              <span className="kanban-column-title">Vencido</span>
              <span className="kanban-column-count">{overdueTasks.length}</span>
            </div>
            {overdueTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isOverdue={true}
                isCompleted={false}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onDragStart={onDragStart}
                editTask={editTask}
                openEditModal={openEditModal}
                confirmDelete={confirmDelete}
              />
            ))}
          </div>

          {/* Columna: Completado */}
          <div
            className="kanban-column completed-col"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, "completed")}
          >
            <div className="kanban-column-header">
              <span className="kanban-column-title">Completado</span>
              <span className="kanban-column-count">
                {completedTasks.length}
              </span>
            </div>
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isOverdue={false}
                isCompleted={true}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onDragStart={onDragStart}
                editTask={editTask}
                openEditModal={openEditModal}
                confirmDelete={confirmDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal Creación/Edición de Tarea */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTaskId ? "Editar Tarea" : "Crear Tarea"}</h2>
              <button
                className="btn-icon"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group mb">
                <label>Título de la Tarea *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group mb">
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="form-group mb">
                  <label>Prioridad</label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div className="form-group mb">
                  <label>Fecha de Vencimiento</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "auto", marginTop: 0 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Guardando..."
                    : editingTaskId
                      ? "Guardar Cambios"
                      : "Guardar Tarea"}
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
