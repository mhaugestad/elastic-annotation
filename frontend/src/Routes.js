import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useParams } from "react-router";
import Login from "./components/Login/Login";
import Main from "./components/Main/Main";
//import Projects from './components/Projects'
import Layout from "./components/Space/Layout/Layout";
import { AuthContext } from "./context/auth";
import { SpaceContext } from "./context/spacecontext";
import ProtectedRoute, { PrivateRoute } from "./utils/ProtectedRoute";

const AppRoutes = () => {
  const api_key_id = localStorage.getItem("api_key_id");
  const api_key = localStorage.getItem("api_key");
  const [index, setIndex] = useState();
  const [tasks, setTasks] = useState();
  const [toasts, setToasts] = useState();
  const [indexPatterns, setIndexPatterns] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(()=>{
    console.log(labels)
  }, [labels])


  const [HEADERS, setHEADERS] = useState({
    "api-key-id": api_key_id,
    "api-key": api_key,
    accept: "application/json",
    "Content-Type": "application/json",
  });

  const setTokens = (api_key_id, api_key) => {
    localStorage.setItem("api_key_id", api_key_id);
    localStorage.setItem("api_key", api_key);
    setHEADERS(() => ({
      "api-key-id": api_key_id,
      "api-key": api_key,
      accept: "application/json",
      "Content-Type": "application/json",
    }));
  };

  return (
    <AuthContext.Provider value={{ HEADERS, setTokens }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            exact
            path="/"
            element={
              <PrivateRoute>
                <Main />
              </PrivateRoute>
            }
          />
          <Route
            path="/spaces"
            element={
              <PrivateRoute>
                <Main />
              </PrivateRoute>
            }
          />
          <Route
            path="/spaces/:slug"
            element={
              <SpaceContext.Provider value={{ index, setIndex, tasks, setTasks, toasts, setToasts, indexPatterns, setIndexPatterns, labels, setLabels }}>
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              </SpaceContext.Provider>
            }
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default AppRoutes;
