import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState("");

    const passwordValid = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        if (!token) {
            setError("El enlace no contiene un código válido.");
            return;
        }
        if (!passwordValid) {
            setError("La contraseña debe tener mínimo 8 caracteres, una letra y un número.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        setLoading(true);
        try {
            await api.resetPassword({ token, password });
            setCompleted(true);
        } catch (requestError) {
            setError(requestError.message || "No fue posible restablecer la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page recovery-page">
            <section className="auth-card recovery-card" aria-labelledby="reset-title">
                <div className="brand" aria-label="PagaYA"><span className="brand-wordmark"><span className="brand-paga">Paga</span><span className="brand-ya">YA</span></span></div>
                <h2 id="reset-title">Restablecer contraseña</h2>
                {completed ? (
                    <div className="recovery-confirmation" role="status">
                        <div className="recovery-confirmation-icon" aria-hidden="true">✓</div>
                        <h3>Contraseña actualizada</h3>
                        <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
                        <Link className="primary-button recovery-back" to="/">Ir al inicio de sesión</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {!token && <div className="error-message" role="alert">El enlace es inválido o ya no está disponible.</div>}
                        {error && <div className="error-message" role="alert">{error}</div>}
                        <div className="field-group">
                            <label htmlFor="new-password">Nueva contraseña</label>
                            <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required />
                        </div>
                        <div className="field-group">
                            <label htmlFor="confirm-password">Confirmar contraseña</label>
                            <input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required />
                        </div>
                        <button className="primary-button" type="submit" disabled={loading || !token}>{loading ? "Actualizando..." : "Restablecer contraseña"}</button>
                        <Link className="recovery-back-link" to="/">Volver al inicio de sesión</Link>
                    </form>
                )}
            </section>
        </main>
    );
}

export default ResetPassword;
