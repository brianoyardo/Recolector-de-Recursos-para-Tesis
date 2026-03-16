import { useState, useCallback } from "react";
import { getProjectResources, createResource, deleteResource } from "../services/firebase/firestore";

export const useResources = (userId, projectId) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadResources = useCallback(async () => {
    if (!userId || !projectId) {
      setResources([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectResources(projectId, userId);
      setResources(data);
    } catch (err) {
      if (err.code === "permission-denied") return;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, projectId]);

  const addResource = async (resourceData) => {
    try {
      if (!userId || !projectId) throw new Error("Falta Auth o Proyecto seleccionado");
      setError(null);
      const newId = await createResource({ 
        ...resourceData, 
        projectId, 
        ownerId: userId 
      });
      await loadResources();
      return newId;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeResource = async (resourceId) => {
    try {
      setError(null);
      await deleteResource(resourceId);
      await loadResources();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    resources,
    loading,
    error,
    loadResources,
    addResource,
    removeResource,
  };
};
