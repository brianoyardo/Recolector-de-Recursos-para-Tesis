import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./config";
import { createUserProfile } from "./firestore";

export const registerWithEmail = async (email, password) => {
  const credentials = await createUserWithEmailAndPassword(auth, email, password);
  await createUserProfile(credentials.user);
  return credentials;
};

export const loginWithEmail = async (email, password) => {
  const credentials = await signInWithEmailAndPassword(auth, email, password);
  await createUserProfile(credentials.user);
  return credentials;
};

export const logoutUser = () => {
  return signOut(auth);
};

export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};
