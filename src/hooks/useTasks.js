import { useState, useCallback } from "react";
import { getUserTasks, getProjectTasks, createTask, updateTaskStatus, deleteTask, updateTask } from "../services/firebase/firestore";

export const useTasks = (userId, projectId = null) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = projectId 
        ? await getProjectTasks(projectId, userId) 
        : await getUserTasks(userId);
      setTasks(data);
    } catch (err) {
      if (err.code === "permission-denied") return;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, projectId]);

  const addTask = async (taskData) => {
    try {
      setError(null);
      const newId = await createTask({ 
        ...taskData, 
        projectId: projectId || taskData.projectId, 
        ownerId: userId 
      });
      await loadTasks();
      return newId;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      await updateTaskStatus(taskId, newStatus);
      await loadTasks();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editTask = async (taskId, updates) => {
    try {
      setError(null);
      await updateTask(taskId, updates);
      await loadTasks();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeTask = async (taskId) => {
    try {
      setError(null);
      await deleteTask(taskId);
      await loadTasks();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    loadTasks,
    addTask,
    editTask,
    removeTask,
    toggleTaskStatus
  };
};
