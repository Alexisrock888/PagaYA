import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.forgotPassword(email.trim());
            setSent(true);
        } catch (requestError) {
            setError(requestError.message || "No fue posible procesar la solicitud");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page recovery-page">
            <section className="auth-card recovery-card" aria-labelledby="recovery-title">
                <div className="brand" aria-label="PagaYA"><span className="brand-wordmark"><span className="brand-paga">Paga</span><span className="brand-ya">YA</span></span></div>
                <h2 id="recovery-title">Recuperar contraseña</h2>
                {sent ? (
                    <div className="recovery-confirmation" role="status">
                        <div className="recovery-confirmation-icon" aria-hidden="true">✓</div>
                        <h3>Solicitud enviada</h3>
                        <p>Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.</p>
                        <Link className="primary-button recovery-back" to="/">Volver al inicio de sesión</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p className="recovery-description">Ingresa el correo asociado a tu cuenta.</p>
                        {error && <div className="error-message" role="alert">{error}</div>}
                        <div className="field-group">
                            <label htmlFor="recovery-email">Correo electrónico</label>
                            <input id="recovery-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" autoComplete="email" required />
                        </div>
                        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar instrucciones"}</button>
                        <Link className="recovery-back-link" to="/">Volver al inicio de sesión</Link>
                    </form>
                )}
            </section>
        </main>
    );
}

export default ForgotPassword;
