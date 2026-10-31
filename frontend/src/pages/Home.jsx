import { Link } from "react-router-dom";
import "./Home.css";

function Brand({ light = false }) {
    return (
        <Link className={`home-brand${light ? " home-brand-light" : ""}`} to="/" aria-label="PagaYA, inicio">
            <span className="brand-symbol" aria-hidden="true">
                <svg viewBox="0 0 36 36" fill="none">
                    <path d="M8 18.5 14.2 25 28 11" stroke="currentColor" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 2.5c8.56 0 15.5 6.94 15.5 15.5S26.56 33.5 18 33.5 2.5 26.56 2.5 18 9.44 2.5 18 2.5Z" stroke="currentColor" strokeWidth="2.2" />
                </svg>
            </span>
            <span>Paga<span>YA</span></span>
        </Link>
    );
}

function ArrowIcon() {
    return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M10 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function SectionLink({ section, children, className }) {
    const scrollToSection = (event) => {
        event.preventDefault();
        document.getElementById(section)?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
    };

    return <a href="/" className={className} onClick={scrollToSection}>{children}</a>;
}

function FeatureIcon({ type }) {
    const icons = {
        transfer: <><path d="M4 8h14M14 4l4 4-4 4" /><path d="M20 16H6m4-4-4 4 4 4" /></>,
        wallet: <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 9h18m-5 5h.01" /><path d="M6 5V3h12v2" /></>,
        control: <><path d="M4 19V9m8 10V5m8 14v-7" /><path d="M2 19h20" /><circle cx="4" cy="7" r="2" /><circle cx="12" cy="3" r="2" /><circle cx="20" cy="10" r="2" /></>,
        shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    };
    return <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[type]}</svg>;
}

function Home() {
    return (
        <div className="home-page">
            <header className="home-header">
                <div className="home-nav-wrap">
                    <Brand />
                    <nav className="home-nav" aria-label="Navegación principal">
                        <SectionLink section="funcionalidades">Funcionalidades</SectionLink>
                        <SectionLink section="beneficios">Beneficios</SectionLink>
                        <SectionLink section="seguridad">Seguridad</SectionLink>
                    </nav>
                    <div className="home-nav-actions">
                        <Link className="nav-login" to="/iniciar-sesion">Iniciar sesión</Link>
                        <Link className="button button-small" to="/registro">Crear cuenta <ArrowIcon /></Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="home-hero">
                    <div className="hero-inner">
                        <div className="hero-copy">
                            <div className="eyebrow"><span className="eyebrow-dot" /> TU DINERO, A TU MANERA</div>
                            <h1>Todo lo que necesitas para <span>llegar más lejos.</span></h1>
                            <p className="hero-description">Paga, transfiere y lleva tus finanzas contigo. Una billetera digital simple, segura y lista para tu día a día.</p>
                            <div className="hero-actions">
                                <Link className="button button-primary" to="/registro">Empieza gratis <ArrowIcon /></Link>
                                <Link className="button button-outline" to="/iniciar-sesion">Iniciar sesión</Link>
                            </div>
                            <div className="hero-assurance">
                                <div className="avatar-stack" aria-hidden="true"><span>CM</span><span>JL</span><span>AV</span></div>
                                <p><strong>Tu plata, siempre contigo.</strong><br />Simple. Rápido. Seguro.</p>
                            </div>
                        </div>

                        <div className="hero-visual" aria-label="Vista previa de la billetera PagaYA">
                            <div className="visual-orbit orbit-one" />
                            <div className="visual-orbit orbit-two" />
                            <div className="wallet-preview">
                                <div className="wallet-topline"><span className="wallet-brand"><span className="wallet-brand-dot">✓</span> PagaYA</span><span className="wallet-menu">•••</span></div>
                                <p className="wallet-label">Saldo disponible <span className="visibility-icon">◉</span></p>
                                <div className="wallet-balance">$ 2.450.800<span> COP</span></div>
                                <div className="wallet-change"><span>↗ 12,8%</span> <span>este mes</span></div>
                                <div className="wallet-chart" aria-hidden="true">
                                    <div className="chart-grid"><span /><span /><span /></div>
                                    <svg viewBox="0 0 460 100" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#93f4c4" stopOpacity=".32" /><stop offset="100%" stopColor="#93f4c4" stopOpacity="0" /></linearGradient></defs><path d="M0 76 C30 66 42 72 68 53 S108 66 135 49 174 58 203 35 242 49 270 38 307 47 337 22 382 43 410 19 438 27 460 8V100H0Z" fill="url(#chartFill)" /><path d="M0 76 C30 66 42 72 68 53 S108 66 135 49 174 58 203 35 242 49 270 38 307 47 337 22 382 43 410 19 438 27 460 8" fill="none" stroke="#a6f2c8" strokeWidth="3" strokeLinecap="round" /></svg>
                                </div>
                                <div className="wallet-period"><span>1S</span><span>1M</span><span className="period-active">3M</span><span>6M</span><span>1A</span></div>
                                <div className="wallet-actions">
                                    <div><span className="wallet-action-icon">↗</span><span>Enviar</span></div>
                                    <div><span className="wallet-action-icon">＋</span><span>Recargar</span></div>
                                    <div><span className="wallet-action-icon">▦</span><span>Movimientos</span></div>
                                </div>
                            </div>
                            <div className="floating-payment"><span className="payment-icon">↙</span><span><small>Transferencia recibida</small><strong>+$ 185.000</strong></span><span className="payment-check">✓</span></div>
                            <div className="floating-secure"><span>✓</span> Tu dinero está protegido</div>
                            <div className="hero-sparkle sparkle-one">✳</div><div className="hero-sparkle sparkle-two">✦</div>
                        </div>
                    </div>
                    <div className="hero-bottomline"><span>UNA FORMA MÁS SIMPLE DE MOVER TU DINERO</span><span className="bottomline-mark">PagaYA <b>•</b> Vive ligero</span></div>
                </section>

                <section className="trust-strip" aria-label="Ventajas de PagaYA">
                    <div><span className="trust-check">✓</span> Sin costos escondidos</div><i />
                    <div><span className="trust-check">✓</span> Disponible cuando quieras</div><i />
                    <div><span className="trust-check">✓</span> Tus finanzas, bajo control</div>
                </section>

                <section className="features-section section-wrap" id="funcionalidades">
                    <div className="section-heading">
                        <div className="eyebrow">TU DÍA A DÍA, MÁS FÁCIL</div>
                        <h2>Una app. <span>Todo resuelto.</span></h2>
                        <p>Lo esencial para manejar tu dinero, sin vueltas y desde un solo lugar.</p>
                    </div>
                    <div className="feature-grid">
                        <article className="feature-card"><div className="feature-icon-wrap icon-mint"><FeatureIcon type="transfer" /></div><h3>Transfiere al instante</h3><p>Envía dinero de forma rápida y sencilla. Solo necesitas los datos de quien recibe.</p><SectionLink section="seguridad">Así de fácil <ArrowIcon /></SectionLink></article>
                        <article className="feature-card"><div className="feature-icon-wrap icon-lime"><FeatureIcon type="wallet" /></div><h3>Tu dinero, siempre a mano</h3><p>Consulta tu saldo y mantén tu billetera lista para lo que venga, estés donde estés.</p><SectionLink section="beneficios">Conoce más <ArrowIcon /></SectionLink></article>
                        <article className="feature-card"><div className="feature-icon-wrap icon-sage"><FeatureIcon type="control" /></div><h3>Todo bajo control</h3><p>Revisa tus movimientos y entiende cómo se mueve tu plata con claridad.</p><SectionLink section="beneficios">Ver beneficios <ArrowIcon /></SectionLink></article>
                    </div>
                </section>

                <section className="benefits-section" id="beneficios">
                    <div className="benefits-inner">
                        <div className="benefit-art" aria-hidden="true">
                            <div className="benefit-circle circle-back" /><div className="benefit-circle circle-front" />
                            <div className="benefit-note"><div className="note-top"><span>PagaYA</span><span>✳</span></div><div className="note-amount">$ 500.000</div><div className="note-caption">Disponible para ti</div><div className="note-lines"><i /><i /><i /></div><div className="note-chip" /></div>
                            <div className="benefit-coins"><span>$</span><span>$</span><span>$</span></div>
                            <div className="benefit-sticker">Tu plata<br /><b>en movimiento</b> ↗</div>
                        </div>
                        <div className="benefits-copy">
                            <div className="eyebrow">HECHA PARA TU RITMO</div>
                            <h2>Menos vueltas.<br /><span>Más vida.</span></h2>
                            <p>Sabemos que tu tiempo vale. Por eso creamos una experiencia financiera sin complicaciones, para que te concentres en lo que realmente importa.</p>
                            <ul><li><span>✓</span> Empieza en minutos, sin papeleo</li><li><span>✓</span> Una experiencia clara y fácil de usar</li><li><span>✓</span> Tus movimientos, siempre a la vista</li></ul>
                            <Link className="text-link" to="/registro">Conoce PagaYA <ArrowIcon /></Link>
                        </div>
                    </div>
                </section>

                <section className="security-section section-wrap" id="seguridad">
                    <div className="security-card">
                        <div className="security-content"><div className="eyebrow">LA TRANQUILIDAD TAMBIÉN CUENTA</div><h2>Tu seguridad va<br />en <span>primer lugar.</span></h2><p>Protegemos tu información con tecnología de seguridad para que manejes tu dinero con confianza en cada paso.</p><div className="security-points"><div><span>✓</span> Acceso protegido</div><div><span>✓</span> Información segura</div></div></div>
                        <div className="security-art" aria-hidden="true"><div className="security-ring ring-large" /><div className="security-ring ring-small" /><div className="security-shield"><svg viewBox="0 0 100 100" fill="none"><path d="M50 8 82 20v25c0 22-13 38-32 48C31 83 18 67 18 45V20L50 8Z" fill="url(#shieldGradient)" /><path d="m36 49 10 10 20-22" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /><defs><linearGradient id="shieldGradient" x1="18" y1="8" x2="82" y2="93"><stop stopColor="#82e9ae" /><stop offset="1" stopColor="#11a66c" /></linearGradient></defs></svg></div><div className="security-spark">✦</div><div className="security-caption">Siempre<br /><b>de tu lado</b></div></div>
                    </div>
                </section>

                <section className="closing-section">
                    <div className="closing-inner"><span className="closing-spark" aria-hidden="true">✳</span><div className="eyebrow">EL SIGUIENTE PASO ES TUYO</div><h2>Tu dinero puede<br />llegar <span>más lejos.</span></h2><p>Únete a PagaYA y descubre una manera más simple de manejar tus finanzas.</p><Link className="button closing-button" to="/registro">Crea tu cuenta gratis <ArrowIcon /></Link><small>Es fácil empezar. Y se siente bien.</small></div>
                </section>
            </main>

            <footer className="home-footer"><div className="footer-main"><Brand /><p>Una forma más simple de estar<br />cerca de tu dinero.</p><div className="footer-links"><SectionLink section="funcionalidades">Funcionalidades</SectionLink><SectionLink section="beneficios">Beneficios</SectionLink><SectionLink section="seguridad">Seguridad</SectionLink></div><div className="footer-account"><span>¿Ya tienes cuenta?</span><Link to="/iniciar-sesion">Iniciar sesión <ArrowIcon /></Link></div></div><div className="footer-bottom"><span>© 2026 PagaYA. Todos los derechos reservados.</span><span>Hecho para hacerte la vida más fácil <b>✳</b></span></div></footer>
        </div>
    );
}

export default Home;
