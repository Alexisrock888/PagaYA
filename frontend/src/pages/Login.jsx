import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [loginMethod, setLoginMethod] = useState("email");
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberDevice, setRememberDevice] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value
        });
        if (name === "password") {
            setPasswordStrength(calculateStrength(value));
        }
    };

    const calculateStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return Math.min(strength, 4);
    };

    const getStrengthLabel = () => {
        const labels = ["", "Débil", "Regular", "Buena", "Muy fuerte"];
        return labels[passwordStrength];
    };

    const handleBiometricLogin = () => {
        console.log("Intentar login con biometría");
        setError("Biometría aún no disponible en esta versión");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await api.login(form);

            if (!data.token) {
                throw new Error("El servidor no devolvió un token");
            }

            localStorage.setItem("token", data.token);

            if (data.usuario) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.usuario)
                );
            }

            if (data.billetera) {
                localStorage.setItem(
                    "wallet",
                    JSON.stringify(data.billetera)
                );
            }

            if (rememberDevice) {
                localStorage.setItem("rememberDevice", "true");
                localStorage.setItem("deviceId", data.deviceId || "device-" + Date.now());
            }

            navigate("/dashboard");
        } catch (error) {
            console.error("Error en login:", error);
            setError(
                error.message || "No fue posible iniciar sesión"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <span className="shape" aria-hidden="true"></span>
            <span className="shape-two" aria-hidden="true"></span>
            <span className="shape-three" aria-hidden="true"></span>

            <div className="auth-card">
                <div className="brand" aria-label="Logo de PagaYA">
                    <div className="brand-wordmark">
                        <span className="brand-paga">Paga</span>
                        <span className="brand-ya">Ya</span>
                    </div>
                </div>

                <h2>Iniciar sesión</h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* Tabs para email/teléfono */}
                <div className="login-method-tabs">
                    <button
                        type="button"
                        className={`tab-button ${loginMethod === "email" ? "active" : ""}`}
                        onClick={() => setLoginMethod("email")}
                    >
                        <svg viewBox="0 0 24 24" className="tab-icon" aria-hidden="true">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" strokeWidth="1.5" stroke="currentColor" fill="none" />
                            <path d="m4 6 8 5 8-5" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Correo</span>
                    </button>
                    <button
                        type="button"
                        className={`tab-button ${loginMethod === "phone" ? "active" : ""}`}
                        onClick={() => setLoginMethod("phone")}
                    >
                        <svg viewBox="0 0 24 24" className="tab-icon" aria-hidden="true">
                            <path d="M17 2H7c-1.1 0-1.99.9-1.99 2v14c0 1.1.89 2 1.99 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Zm0 16H7V4h10v14Zm-5-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3Z" fill="currentColor" />
                        </svg>
                        <span>Teléfono</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="field-group">
                        <label htmlFor="email">
                            {loginMethod === "email" ? "Correo Electrónico" : "Número de Teléfono"}
                        </label>
                        <input
                            id="email"
                            type={loginMethod === "email" ? "email" : "tel"}
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder={loginMethod === "email" ? "tu@correo.com" : "+57 300 123 4567"}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="password-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Ingrese su contraseña"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? (
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M3 3l18 18" />
                                        <path d="M10.58 10.58A2 2 0 0013.41 13.41" />
                                        <path d="M9.88 5.3A10.94 10.94 0 0112 5c4.97 0 9.28 3.2 11 7-1.14 2.17-2.87 3.98-4.9 5.08" />
                                        <path d="M14.12 18.7A10.94 10.94 0 0112 19c-4.97 0-9.28-3.2-11-7 1.02-1.95 2.44-3.49 4.1-4.58" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                        <circle cx="12" cy="12" r="3.5" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Indicador de fortaleza de contraseña */}
                        {form.password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className={`strength-fill strength-${passwordStrength}`}
                                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                                    ></div>
                                </div>
                                <span className={`strength-label strength-${passwordStrength}`}>
                                    {getStrengthLabel()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Opciones adicionales de seguridad */}
                    <div className="security-options">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={rememberDevice}
                                onChange={(e) => setRememberDevice(e.target.checked)}
                            />
                            Recordar este dispositivo
                        </label>
                    </div>

                    {/* Biometría - Opción Principal */}
                    <button
                        type="button"
                        className="biometric-primary-button"
                        onClick={handleBiometricLogin}
                        aria-label="Iniciar sesión con biometría"
                    >
                        <svg viewBox="0 0 64 64" className="fingerprint-icon" aria-hidden="true">
                            <path d="M32 8C19.3 8 9 18.3 9 31c0 4.1.8 8 2.3 11.6M32 8c12.7 0 23 10.3 23 23 0 4.1-.8 8-2.3 11.6" strokeWidth="2" stroke="currentColor" fill="none" />
                            <path d="M32 16C23.2 16 16 23.2 16 32c0 2.8.6 5.5 1.7 8M32 16c8.8 0 16 7.2 16 16 0 2.8-.6 5.5-1.7 8" strokeWidth="2" stroke="currentColor" fill="none" />
                            <circle cx="32" cy="32" r="6" fill="currentColor" />
                            <path d="M32 24C27.6 24 24 27.6 24 32s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Z" strokeWidth="2" stroke="currentColor" fill="none" />
                        </svg>
                        <div className="biometric-content">
                            <span className="biometric-label">Biometría</span>
                            <span className="biometric-hint">Huella o Face ID</span>
                        </div>
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading ? "Ingresando..." : "INICIAR SESIÓN"}
                    </button>
                </form>

                <div className="auth-links">
                    <Link to="/" className="forgot-password-link">
                        <span>¿Olvidó su contraseña?</span>
                    </Link>
                </div>

                <div className="signup-card">
                    <div className="signup-content">
                        <div className="signup-text">
                            <p className="signup-question">¿No tienes cuenta unete a nosotros?</p>
                            <p className="signup-description">Crea una nueva y accede a todos nuestros beneficios</p>
                        </div>
                        <Link to="/registro" className="signup-button">
                            <span>Crear Cuenta</span>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;