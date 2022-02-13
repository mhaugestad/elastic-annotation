// ProtectedRoute.tsx
import React, { useState, useEffect } from "react";
import { Route, Navigate } from "react-router-dom";
import { BACKEND_URL } from "./configs";
import { useAuth } from "../context/auth";

export const PrivateRoute = ({ children }) => {
  const {HEADERS} = useAuth();
  const [authed, setAuthed] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    //setAuthed(()=>false)
    fetch("/api/v1/authenticate", { headers: new Headers(HEADERS) })
      .then((response) => response.json())
      .then((response_json) => setAuthed(()=>response_json.is_authenticated))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [children]);

  return (loading || authed==undefined) ? (
    <div>loading</div>
  ) : authed ? (
    children
  ) : (
    <Navigate to="/login"/>
  );
};
