import { useState, useCallback } from "react";
import { getUserProjects, createProject, deleteProject, updateProject } from "../services/firebase/firestore";

export const useProjects = (userId) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserProjects(userId);
      setProjects(data);
    } catch (err) {
      if (err.code === "permission-denied") return;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addProject = async (projectData) => {
    try {
      setError(null);
      const newId = await createProject({ ...projectData, ownerId: userId });
      await loadProjects();
      return newId;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editProject = async (projectId, updates) => {
    try {
      setError(null);
      await updateProject(projectId, updates);
      await loadProjects();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeProject = async (projectId) => {
    try {
      setError(null);
      await deleteProject(projectId);
      await loadProjects();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    loadProjects,
    addProject,
    editProject,
    removeProject,
  };
};
