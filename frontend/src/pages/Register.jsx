import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [agreedTerms, setAgreedTerms] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!agreedTerms) {
            setError("Debes aceptar los términos y condiciones");
            return;
        }

        setLoading(true);

        try {
            await api.register(form);
            setSuccess("Cuenta creada correctamente. Redirigiendo...");
            setTimeout(() => {
                navigate("/iniciar-sesion", {
                    state: {
                        message: "Cuenta creada correctamente"
                    }
                });
            }, 2000);
        } catch (error) {
            setError(error.message || "Error al crear la cuenta");
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

                <h2>Crear una cuenta</h2>
                <p className="register-subtitle">Únete a nuestra comunidad fintech</p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="field-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                id="nombre"
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Tu nombre"
                                required
                            />
                        </div>
                        <div className="field-group">
                            <label htmlFor="apellido">Apellido</label>
                            <input
                                id="apellido"
                                type="text"
                                name="apellido"
                                value={form.apellido}
                                onChange={handleChange}
                                placeholder="Tu apellido"
                                required
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="tu@correo.com"
                            required
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="telefono">Número de Teléfono</label>
                        <input
                            id="telefono"
                            type="tel"
                            name="telefono"
                            value={form.telefono}
                            onChange={handleChange}
                            placeholder="+57 300 123 4567"
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
                                placeholder="Mínimo 8 caracteres"
                                minLength="8"
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

                    <div className="terms-checkbox">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={agreedTerms}
                                onChange={(e) => setAgreedTerms(e.target.checked)}
                            />
                            Acepto los <Link to="/">términos y condiciones</Link>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading || !agreedTerms}
                    >
                        {loading ? "Creando cuenta..." : "CREAR CUENTA"}
                    </button>
                </form>

                <div className="login-card">
                    <div className="login-content">
                        <div className="login-text">
                            <p className="login-question">¿Ya tienes cuenta?</p>
                            <p className="login-description">Accede rápidamente a tu cuenta</p>
                        </div>
                        <Link to="/iniciar-sesion" className="login-button">
                            <span>Iniciar Sesión</span>
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

export default Register;
