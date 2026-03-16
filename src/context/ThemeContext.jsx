/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { getUserProfile, updateUserPreferences } from "../services/firebase/firestore";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [themeMode, setThemeMode] = useState(localStorage.getItem("themeMode") || "light");
  const [accentColor, setAccentColor] = useState(localStorage.getItem("accentColor") || "");
  const [loadingTheme, setLoadingTheme] = useState(true);

  // Load preferences from Firestore on login
  useEffect(() => {
    let isMounted = true;
    const loadPreferences = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile?.preferences && isMounted) {
            if (profile.preferences.theme) {
              setThemeMode(profile.preferences.theme);
              localStorage.setItem("themeMode", profile.preferences.theme);
            }
            if (profile.preferences.accentColor) {
              setAccentColor(profile.preferences.accentColor);
              localStorage.setItem("accentColor", profile.preferences.accentColor);
            }
          }
        } catch (err) {
          console.error("Error loading theme preferences:", err);
        }
      }
      if (isMounted) setLoadingTheme(false);
    };
    loadPreferences();
    return () => { isMounted = false; };
  }, [user]);

  // Apply Theme visually
  useEffect(() => {
    if (themeMode === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    
    if (accentColor) {
      document.documentElement.style.setProperty("--primary", accentColor);
      // Optional: estimate hover color or let CSS handle it via opacity or filter
    } else {
      document.documentElement.style.removeProperty("--primary");
    }
  }, [themeMode, accentColor]);

  const changeTheme = async (newTheme) => {
    setThemeMode(newTheme);
    localStorage.setItem("themeMode", newTheme);
    if (user?.uid) {
      await updateUserPreferences(user.uid, { theme: newTheme });
    }
  };

  const changeAccentColor = async (color) => {
    setAccentColor(color);
    if (color) localStorage.setItem("accentColor", color);
    else localStorage.removeItem("accentColor");
    
    if (user?.uid) {
      await updateUserPreferences(user.uid, { accentColor: color });
    }
  };

  return (
    <ThemeContext.Provider value={{ themeMode, changeTheme, accentColor, changeAccentColor, loadingTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
