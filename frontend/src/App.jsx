import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";

import "./App.css";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/iniciar-sesion" replace />;
    }

    return children;
}

function App() {
    return (
        <HashRouter>

            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/iniciar-sesion" element={<Login />} />

                <Route
                    path="/registro"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="*"
                    element={<Navigate to="/iniciar-sesion" replace />}
                />

            </Routes>

        </HashRouter>
    );
}

export default App;
