import React, {useState} from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate} from "react-router-dom";
import { useParams } from 'react-router';
import Login from './components/Login/Login'
import Main from './components/Main/Main'
//import Projects from './components/Projects'
import Layout from './components/Project/Layout';
import { AuthContext } from "./context/auth";
import ProtectedRoute, {PrivateRoute} from "./utils/ProtectedRoute";

const AppRoutes = () => {
  const api_key_id = localStorage.getItem("api_key_id");
  const api_key = localStorage.getItem("api_key");

  const [HEADERS, setHEADERS] = useState(
    { "api-key-id": api_key_id, "api-key": api_key, accept: "application/json", "Content-Type": "application/json" }
  )

  const setTokens = (api_key_id, api_key) => {
    localStorage.setItem("api_key_id", api_key_id);
    localStorage.setItem("api_key", api_key);
    setHEADERS(()=> ({ "api-key-id": api_key_id, "api-key": api_key, accept: "application/json", "Content-Type": "application/json" }))
  }

  return (
    <AuthContext.Provider value={{ HEADERS, setTokens }}>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route exact path="/" element={<PrivateRoute><Main /></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><Main /></PrivateRoute>} />
        <Route path="/projects/:slug" element={<PrivateRoute><Layout/></PrivateRoute>}/>
      </Routes>
    </Router>
    </AuthContext.Provider>
  );
};

export default AppRoutes