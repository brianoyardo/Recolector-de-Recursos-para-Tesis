import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "./config";

// -- USERS --
export const createUserProfile = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      fullName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      role: "user",
      isActive: true,
      preferences: {
        theme: "light",
        language: "es",
        citationFormat: "APA",
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

export const getUserProfile = async (uid) => {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
};

export const updateUserPreferences = async (uid, newPreferences) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const currentPrefs = snap.data().preferences || {};
    await updateDoc(userRef, {
      preferences: { ...currentPrefs, ...newPreferences },
      updatedAt: serverTimestamp(),
    });
  }
};

// -- PROJECTS --
export const createProject = async ({ title, description, ownerId }) => {
  const docRef = await addDoc(collection(db, "projects"), {
    title,
    description,
    ownerId,
    members: [ownerId],
    visibility: "private",
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getUserProjects = async (uid) => {
  const q = query(collection(db, "projects"), where("ownerId", "==", uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteProject = async (projectId) => {
  await deleteDoc(doc(db, "projects", projectId));
};

export const updateProject = async (projectId, updates) => {
  await updateDoc(doc(db, "projects", projectId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// -- RESOURCES --
export const createResource = async ({
  title, description, documentType, sourceUrl, sourceName, author,
  publicationYear, publisher, keywords, projectId, categoryId,
  ownerId, status, priority, notes, citationText, chapter,
}) => {
  const docRef = await addDoc(collection(db, "resources"), {
    title: title || "",
    description: description || "",
    documentType: documentType || "documentation",
    sourceUrl: sourceUrl || "",
    sourceName: sourceName || "",
    author: author || "",
    publicationYear: Number(publicationYear) || null,
    publisher: publisher || "",
    keywords: keywords ? String(keywords).split(",").map((item) => item.trim()).filter(Boolean) : [],
    projectId: projectId || null,
    categoryId: categoryId || null,
    ownerId: ownerId || null,
    status: status || "pending",
    priority: priority || "medium",
    notes: notes || "",
    citationText: citationText || "",
    referenceFormat: { apa: "", ieee: "" },
    chapter: chapter || "",
    isFavorite: false,
    isArchived: false,
    file: { name: "", path: "", url: "", mimeType: "", size: 0 },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getProjectResources = async (projectId, ownerId) => {
  const q = query(collection(db, "resources"), where("projectId", "==", projectId), where("ownerId", "==", ownerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Se añade traida de TODOS los recursos por usuario para el dashboard
export const getUserResources = async (ownerId) => {
  const q = query(collection(db, "resources"), where("ownerId", "==", ownerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteResource = async (resourceId) => {
  await deleteDoc(doc(db, "resources", resourceId));
};

export const updateResource = async (resourceId, updates) => {
  await updateDoc(doc(db, "resources", resourceId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// -- TASKS --
export const createTask = async ({ title, description, priority, dueDate, ownerId, projectId, resourceId }) => {
  const docRef = await addDoc(collection(db, "tasks"), {
    title,
    description: description || "",
    status: "pending",
    priority: priority || "medium",
    dueDate: dueDate || null,
    ownerId,
    projectId: projectId || null,
    resourceId: resourceId || null,
    progress: 0,
    tags: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null,
  });
  return docRef.id;
};

export const getUserTasks = async (ownerId) => {
  const q = query(collection(db, "tasks"), where("ownerId", "==", ownerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getProjectTasks = async (projectId, ownerId) => {
  const q = query(collection(db, "tasks"), where("projectId", "==", projectId), where("ownerId", "==", ownerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateTaskStatus = async (taskId, newStatus) => {
  const isCompleted = newStatus === "completed";
  await updateDoc(doc(db, "tasks", taskId), {
    status: newStatus,
    updatedAt: serverTimestamp(),
    completedAt: isCompleted ? serverTimestamp() : null,
    progress: isCompleted ? 100 : 0
  });
};

export const deleteTask = async (taskId) => {
  await deleteDoc(doc(db, "tasks", taskId));
};

export const updateTask = async (taskId, updates) => {
  const isCompleted = updates.status === "completed";
  const payload = {
    ...updates,
    updatedAt: serverTimestamp(),
  };
  
  if (updates.status) {
    payload.completedAt = isCompleted ? serverTimestamp() : null;
    payload.progress = isCompleted ? 100 : updates.progress || 0;
  }
  
  await updateDoc(doc(db, "tasks", taskId), payload);
};
