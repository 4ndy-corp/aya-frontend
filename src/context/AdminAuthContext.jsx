import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// AdminAuthContext: maneja la sesión del admin logueado.
// El `accessToken` es lo que se manda al backend en cada
// petición protegida (Authorization: Bearer <token>).
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Revisa si ya había una sesión guardada (para no pedir login
    // otra vez si recargas la página).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Se mantiene sincronizado si la sesión cambia (login/logout).
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setSession(data.session);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const value = {
    session,
    loading,
    isLoggedIn: !!session,
    accessToken: session?.access_token,
    signIn,
    signOut,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth debe usarse dentro de <AdminAuthProvider>");
  return context;
}
