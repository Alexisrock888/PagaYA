import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    // ==========================================
    // USUARIO - user
    // ==========================================

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("user") || "{}"
            );
        } catch {
            return {};
        }
    });

    // ==========================================
    // BILLETERA
    // ==========================================

    const [wallet, setWallet] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("wallet") || "null"
            );
        } catch {
            return null;
        }
    });

    // ==========================================
    // TRANSACCIONES
    // ==========================================

    const [transactions, setTransactions] = useState([]);

    // ==========================================
    // LOADING
    // ==========================================

    const [loading, setLoading] = useState(true);

    const [loadingTransactions, setLoadingTransactions] =
        useState(true);

    // ==========================================
    // ERRORES
    // ==========================================

    const [error, setError] = useState("");

    const [transactionsError, setTransactionsError] =
        useState("");

    // ==========================================
    // MODAL DE OPERACIÓN
    // recharge | transfer
    // ==========================================

    const [modal, setModal] = useState(null);

    // ==========================================
    // DATOS DEL FORMULARIO
    // ==========================================

    const [monto, setMonto] = useState("");

    const [descripcion, setDescripcion] = useState("");

    const [identificador, setIdentificador] =
        useState("");

    // ==========================================
    // PROCESANDO OPERACIÓN
    // ==========================================

    const [processing, setProcessing] = useState(false);

    const [operationError, setOperationError] =
        useState("");

    // ==========================================
    // COMPROBANTE
    // ==========================================

    const [receipt, setReceipt] = useState(null);

    const [loadingReceipt, setLoadingReceipt] =
        useState(false);

    const [receiptError, setReceiptError] =
        useState("");

    const [sharingReceipt, setSharingReceipt] =
        useState(false);

    const [shareMessage, setShareMessage] =
        useState("");

    // ==========================================
    // CONTROLAR TRANSACCIONES RECIBIDAS VISTAS
    // ==========================================

    const recibidasVistas = useRef(new Set());

    // ==========================================
    // CARGAR DATOS AL ENTRAR
    // ==========================================

    useEffect(() => {
        cargarDatos();
    }, []);

    // ==========================================
    // DETECTAR TRANSFERENCIAS RECIBIDAS NUEVAS
    // ==========================================

    useEffect(() => {
        if (
            loadingTransactions ||
            !Array.isArray(transactions) ||
            transactions.length === 0
        ) {
            return;
        }

        const transferenciaRecibida =
            transactions.find((transaction) => {
                if (
                    transaction.tipo?.toLowerCase() !==
                    "transferencia_recibida"
                ) {
                    return false;
                }

                if (!transaction.referencia) {
                    return false;
                }

                if (
                    recibidasVistas.current.has(
                        transaction.referencia
                    )
                ) {
                    return false;
                }

                return true;
            });

        if (!transferenciaRecibida) {
            return;
        }

        recibidasVistas.current.add(
            transferenciaRecibida.referencia
        );

        mostrarComprobante(
            transferenciaRecibida.referencia
        );
    }, [transactions, loadingTransactions]);

    // ==========================================
    // ACTUALIZACIÓN AUTOMÁTICA
    // ==========================================

    useEffect(() => {
        const intervalo = setInterval(() => {
            actualizarTransacciones();
        }, 5000);

        return () => {
            clearInterval(intervalo);
        };
    }, []);

    // ==========================================
    // CARGAR DATOS
    // ==========================================

    const cargarDatos = async () => {
        setLoading(true);
        setLoadingTransactions(true);

        setError("");
        setTransactionsError("");

        // ======================================
        // PERFIL
        // ======================================

        try {
            const profileData = await api.profile();

            if (profileData.usuario) {
                setUser(profileData.usuario);

                localStorage.setItem(
                    "user",
                    JSON.stringify(profileData.usuario)
                );
            }

            if (profileData.billetera) {
                setWallet(profileData.billetera);

                localStorage.setItem(
                    "wallet",
                    JSON.stringify(
                        profileData.billetera
                    )
                );
            }
        } catch (error) {
            console.error(
                "Error cargando perfil:",
                error
            );

            if (esErrorAutorizacion(error)) {
                logout();
                return;
            }

            setError(
                error.message ||
                "No se pudo cargar la información de la billetera"
            );
        } finally {
            setLoading(false);
        }

        // ======================================
        // TRANSACCIONES
        // ======================================

        try {
            const transactionData =
                await api.transactions();

            const movimientos =
                Array.isArray(
                    transactionData.movimientos
                )
                    ? transactionData.movimientos
                    : [];

            setTransactions(movimientos);

            // Marcar las transacciones recibidas
            // que ya existían como vistas.
            //
            // IMPORTANTE:
            // esto evita que al entrar nuevamente
            // se abra automáticamente un comprobante
            // antiguo.
            movimientos.forEach((transaction) => {
                if (
                    transaction.tipo?.toLowerCase() ===
                        "transferencia_recibida" &&
                    transaction.referencia
                ) {
                    recibidasVistas.current.add(
                        transaction.referencia
                    );
                }
            });
        } catch (error) {
            console.error(
                "Error cargando transacciones:",
                error
            );

            if (esErrorAutorizacion(error)) {
                logout();
                return;
            }

            setTransactionsError(
                error.message ||
                "No se pudo cargar el historial"
            );
        } finally {
            setLoadingTransactions(false);
        }
    };

    // ==========================================
    // ACTUALIZAR TRANSACCIONES
    // ==========================================

    const actualizarTransacciones = async () => {
        try {
            const transactionData =
                await api.transactions();

            setTransactions(
                Array.isArray(
                    transactionData.movimientos
                )
                    ? transactionData.movimientos
                    : []
            );

            // ==================================
            // ACTUALIZAR SALDO
            // ==================================

            try {
                const profileData =
                    await api.profile();

                if (profileData.billetera) {
                    const nuevaWallet =
                        profileData.billetera;

                    setWallet(nuevaWallet);

                    localStorage.setItem(
                        "wallet",
                        JSON.stringify(
                            nuevaWallet
                        )
                    );
                }

                if (profileData.usuario) {
                    setUser(
                        profileData.usuario
                    );

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            profileData.usuario
                        )
                    );
                }
            } catch (profileError) {
                console.error(
                    "Error actualizando saldo:",
                    profileError
                );
            }
        } catch (error) {
            console.error(
                "Error actualizando transacciones:",
                error
            );

            if (esErrorAutorizacion(error)) {
                logout();
            }
        }
    };

    // ==========================================
    // ERROR DE AUTORIZACIÓN
    // ==========================================

    const esErrorAutorizacion = (error) => {
        const mensaje =
            error?.message?.toLowerCase() || "";

        return (
            mensaje.includes("token") ||
            mensaje.includes("autoriz") ||
            mensaje.includes("unauthorized") ||
            mensaje.includes("401")
        );
    };

    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("wallet");

        navigate("/");
    };

    // ==========================================
    // FORMATEAR SALDO
    // ==========================================

    const formatoSaldo = (saldo) => {
        return new Intl.NumberFormat("es-CO", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(Number(saldo) || 0);
    };

    // ==========================================
    // FORMATEAR FECHA
    // ==========================================

    const formatoFecha = (fecha) => {
        if (!fecha) {
            return "";
        }

        const fechaObj = new Date(fecha);

        if (
            Number.isNaN(
                fechaObj.getTime()
            )
        ) {
            return "";
        }

        return fechaObj.toLocaleString(
            "es-CO",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    };

    // ==========================================
    // INFORMACIÓN DEL MOVIMIENTO
    // ==========================================

    const obtenerInfoMovimiento = (tipo) => {
        switch (
            tipo?.toLowerCase()
        ) {
            case "recarga":
                return {
                    titulo: "Recarga",
                    signo: "+",
                    clase: "positive",
                    icono: "↑"
                };

            case "transferencia_recibida":
                return {
                    titulo:
                        "Transferencia recibida",
                    signo: "+",
                    clase: "positive",
                    icono: "↑"
                };

            case "transferencia_enviada":
                return {
                    titulo:
                        "Transferencia enviada",
                    signo: "-",
                    clase: "negative",
                    icono: "↓"
                };

            case "pago":
                return {
                    titulo: "Pago",
                    signo: "-",
                    clase: "negative",
                    icono: "↓"
                };

            case "ingreso":
                return {
                    titulo: "Ingreso",
                    signo: "+",
                    clase: "positive",
                    icono: "↑"
                };

            case "retiro":
                return {
                    titulo: "Retiro",
                    signo: "-",
                    clase: "negative",
                    icono: "↓"
                };

            default:
                return {
                    titulo: "Movimiento",
                    signo: "",
                    clase: "",
                    icono: "•"
                };
        }
    };

    // ==========================================
    // DETERMINAR SI ES INGRESO
    // ==========================================

    const esMovimientoPositivo = (tipo) => {
        const tipoNormalizado =
            tipo?.toLowerCase();

        const tiposPositivos = [
            "recarga",
            "transferencia_recibida",
            "ingreso"
        ];

        return tiposPositivos.includes(
            tipoNormalizado
        );
    };

    // ==========================================
    // TITULO DEL COMPROBANTE
    // ==========================================

    const obtenerTituloComprobante = (tipo) => {
        switch (tipo?.toLowerCase()) {
            case "transferencia_recibida":
                return "Transferencia recibida";

            case "transferencia_enviada":
                return "Transferencia enviada";

            case "recarga":
                return "Recarga realizada";

            case "pago":
                return "Pago realizado";

            case "ingreso":
                return "Ingreso recibido";

            case "retiro":
                return "Retiro realizado";

            default:
                return tipo || "Movimiento";
        }
    };

    // ==========================================
    // ABRIR MODAL DE OPERACIÓN
    // ==========================================

    const abrirModal = (tipo) => {
        setModal(tipo);

        setMonto("");

        setDescripcion("");

        setIdentificador("");

        setOperationError("");
    };

    // ==========================================
    // CERRAR MODAL DE OPERACIÓN
    // ==========================================

    const cerrarModal = () => {
        if (processing) {
            return;
        }

        setModal(null);

        setMonto("");

        setDescripcion("");

        setIdentificador("");

        setOperationError("");
    };

    // ==========================================
    // MOSTRAR COMPROBANTE
    // ==========================================

    const mostrarComprobante = async (
        referencia
    ) => {
        if (!referencia) {
            return;
        }

        try {
            setLoadingReceipt(true);

            setReceipt(null);

            setReceiptError("");

            setShareMessage("");

            const respuesta =
                await api.receipt(
                    referencia
                );

            if (
                respuesta?.comprobante
            ) {
                setReceipt(
                    respuesta.comprobante
                );
            } else {
                setReceiptError(
                    "No se pudo obtener el comprobante."
                );
            }
        } catch (error) {
            console.error(
                "Error obteniendo comprobante:",
                error
            );

            if (
                esErrorAutorizacion(error)
            ) {
                logout();
                return;
            }

            setReceiptError(
                error.message ||
                "No se pudo obtener el comprobante."
            );
        } finally {
            setLoadingReceipt(false);
        }
    };

    // ==========================================
    // CERRAR COMPROBANTE
    // ==========================================

    const cerrarComprobante = () => {
        if (loadingReceipt) {
            return;
        }

        setReceipt(null);

        setReceiptError("");

        setShareMessage("");
    };

    // ==========================================
    // CREAR IMAGEN DEL COMPROBANTE
    // ==========================================

    const crearImagenComprobante = () => {
        return new Promise((resolve, reject) => {
            if (!receipt) {
                reject(
                    new Error(
                        "No existe un comprobante."
                    )
                );

                return;
            }

            const canvas =
                document.createElement("canvas");

            const width = 1000;
            const height = 1500;

            canvas.width = width;
            canvas.height = height;

            const ctx =
                canvas.getContext("2d");

            if (!ctx) {
                reject(
                    new Error(
                        "No se pudo crear la imagen."
                    )
                );

                return;
            }

            // ==================================
            // FONDO
            // ==================================

            ctx.fillStyle = "#f4f7fb";
            ctx.fillRect(
                0,
                0,
                width,
                height
            );

            // ==================================
            // TARJETA
            // ==================================

            ctx.fillStyle = "#ffffff";

            ctx.beginPath();

            ctx.roundRect(
                70,
                60,
                860,
                1380,
                35
            );

            ctx.fill();

            // ==================================
            // ENCABEZADO VERDE
            // ==================================

            ctx.fillStyle = "#087f5b";

            ctx.beginPath();

            ctx.roundRect(
                70,
                60,
                860,
                210,
                35
            );

            ctx.fill();

            // Tapar bordes inferiores redondeados
            ctx.fillRect(
                70,
                200,
                860,
                70
            );

            // ==================================
            // MARCA
            // ==================================

            ctx.fillStyle = "#ffffff";

            ctx.font =
                "bold 44px Arial";

            ctx.textAlign = "center";

            ctx.fillText(
                "PagaYA",
                width / 2,
                120
            );

            ctx.font =
                "bold 32px Arial";

            ctx.fillText(
                obtenerTituloComprobante(
                    receipt.tipo
                ),
                width / 2,
                175
            );

            ctx.font =
                "24px Arial";

            ctx.fillText(
                String(
                    receipt.estado ||
                    "COMPLETADA"
                ).toUpperCase(),
                width / 2,
                220
            );

            // ==================================
            // ICONO DE ÉXITO
            // ==================================

            ctx.fillStyle = "#e6f8f1";

            ctx.beginPath();

            ctx.arc(
                width / 2,
                340,
                55,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.fillStyle = "#087f5b";

            ctx.font =
                "bold 60px Arial";

            ctx.fillText(
                "✓",
                width / 2,
                360
            );

            // ==================================
            // MONTO
            // ==================================

            const positivo =
                esMovimientoPositivo(
                    receipt.tipo
                );

            const signo =
                positivo
                    ? "+"
                    : "-";

            ctx.fillStyle =
                positivo
                    ? "#087f5b"
                    : "#c92a2a";

            ctx.font =
                "bold 58px Arial";

            ctx.fillText(
                `${signo}$${formatoSaldo(
                    receipt.monto
                )} ${
                    receipt.moneda ||
                    "COP"
                }`,
                width / 2,
                470
            );

            // ==================================
            // DESCRIPCIÓN
            // ==================================

            let y = 535;

            if (receipt.descripcion) {
                ctx.fillStyle = "#f4f7fb";

                ctx.beginPath();

                ctx.roundRect(
                    120,
                    y,
                    760,
                    110,
                    18
                );

                ctx.fill();

                ctx.textAlign = "left";

                ctx.fillStyle = "#98a2b3";

                ctx.font =
                    "20px Arial";

                ctx.fillText(
                    "Descripción",
                    150,
                    y + 35
                );

                ctx.fillStyle = "#344054";

                ctx.font =
                    "bold 23px Arial";

                const descripcionTexto =
                    String(
                        receipt.descripcion
                    );

                const lineasDescripcion =
                    dividirTexto(
                        ctx,
                        descripcionTexto,
                        690
                    );

                lineasDescripcion
                    .slice(0, 2)
                    .forEach(
                        (
                            linea,
                            index
                        ) => {
                            ctx.fillText(
                                linea,
                                150,
                                y +
                                    70 +
                                    index *
                                        28
                            );
                        }
                    );

                y += 145;
            }

            // ==================================
            // DETALLES
            // ==================================

            const dibujarFila = (
                etiqueta,
                valor
            ) => {
                ctx.fillStyle =
                    "#667085";

                ctx.font =
                    "22px Arial";

                ctx.textAlign = "left";

                ctx.fillText(
                    etiqueta,
                    140,
                    y
                );

                ctx.fillStyle =
                    "#172033";

                ctx.font =
                    "bold 22px Arial";

                ctx.textAlign =
                    "right";

                const textoValor =
                    String(
                        valor ?? "-"
                    );

                const maxWidth = 560;

                if (
                    ctx.measureText(
                        textoValor
                    ).width <= maxWidth
                ) {
                    ctx.fillText(
                        textoValor,
                        860,
                        y
                    );
                } else {
                    ctx.textAlign =
                        "left";

                    const lineas =
                        dividirTexto(
                            ctx,
                            textoValor,
                            maxWidth
                        );

                    lineas
                        .slice(0, 2)
                        .forEach(
                            (
                                linea,
                                index
                            ) => {
                                ctx.fillText(
                                    linea,
                                    350,
                                    y +
                                        index *
                                            27
                                );
                            }
                        );
                }

                ctx.strokeStyle =
                    "#edf0f4";

                ctx.lineWidth = 2;

                ctx.beginPath();

                ctx.moveTo(
                    140,
                    y + 22
                );

                ctx.lineTo(
                    860,
                    y + 22
                );

                ctx.stroke();

                y += 72;
            };

            dibujarFila(
                "Fecha",
                formatoFecha(
                    receipt.fecha
                )
            );

            dibujarFila(
                "Referencia",
                receipt.referencia
            );

                    

            // ==================================
            // PIE
            // ==================================

            ctx.textAlign = "center";

            ctx.fillStyle = "#98a2b3";

            ctx.font =
                "20px Arial";

            ctx.fillText(
                "Comprobante generado por PagaYA",
                width / 2,
                1360
            );

            ctx.font =
                "18px Arial";

            ctx.fillText(
                "Conserva este comprobante como respaldo.",
                width / 2,
                1390
            );

            // ==================================
            // CONVERTIR CANVAS A BLOB
            // ==================================

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(
                            new Error(
                                "No se pudo generar la imagen."
                            )
                        );

                        return;
                    }

                    resolve(blob);
                },
                "image/png",
                1
            );
        });
    };

    // ==========================================
    // DIVIDIR TEXTO PARA LA IMAGEN
    // ==========================================

    const dividirTexto = (
        ctx,
        texto,
        maxWidth
    ) => {
        const palabras =
            String(texto)
                .split(" ");

        const lineas = [];

        let lineaActual = "";

        palabras.forEach(
            (palabra) => {
                const prueba =
                    lineaActual
                        ? `${lineaActual} ${palabra}`
                        : palabra;

                const ancho =
                    ctx.measureText(
                        prueba
                    ).width;

                if (
                    ancho > maxWidth &&
                    lineaActual
                ) {
                    lineas.push(
                        lineaActual
                    );

                    lineaActual =
                        palabra;
                } else {
                    lineaActual =
                        prueba;
                }
            }
        );

        if (lineaActual) {
            lineas.push(
                lineaActual
            );
        }

        return lineas;
    };

    // ==========================================
    // COMPARTIR COMPROBANTE COMO IMAGEN
    // ==========================================

    const compartirComprobante = async () => {
        if (!receipt) {
            return;
        }

        try {
            setSharingReceipt(true);

            setShareMessage("");

            // ==================================
            // GENERAR IMAGEN
            // ==================================

            const blob =
                await crearImagenComprobante();

            const nombreArchivo =
                `comprobante-pagaya-${
                    receipt.referencia ||
                    "movimiento"
                }.png`;

            const archivo =
                new File(
                    [blob],
                    nombreArchivo,
                    {
                        type: "image/png"
                    }
                );

            // ==================================
            // COMPARTIR IMAGEN
            // ==================================

            if (
                navigator.share &&
                navigator.canShare &&
                navigator.canShare({
                    files: [archivo]
                })
            ) {
                await navigator.share({
                    title:
                        "Comprobante PagaYA",
                    files: [archivo]
                });

                setShareMessage(
                    "Imagen del comprobante compartida correctamente."
                );

                return;
            }

            // ==================================
            // ALGUNOS NAVEGADORES TIENEN SHARE
            // PERO NO CANSHARE
            // ==================================

            if (
                navigator.share &&
                !navigator.canShare
            ) {
                try {
                    await navigator.share({
                        title:
                            "Comprobante PagaYA",
                        files: [archivo]
                    });

                    setShareMessage(
                        "Imagen del comprobante compartida correctamente."
                    );

                    return;
                } catch (shareError) {
                    if (
                        shareError?.name ===
                        "AbortError"
                    ) {
                        return;
                    }

                    console.error(
                        "El navegador no pudo compartir el archivo:",
                        shareError
                    );
                }
            }

            // ==================================
            // DESCARGAR IMAGEN COMO FALLBACK
            // ==================================

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                nombreArchivo;

            document.body.appendChild(
                link
            );

            link.click();

            document.body.removeChild(
                link
            );

            URL.revokeObjectURL(url);

            setShareMessage(
                "Tu navegador no permite compartir imágenes directamente. Se descargó el comprobante como PNG."
            );
        } catch (error) {
            console.error(
                "Error compartiendo comprobante:",
                error
            );

            if (
                error?.name ===
                "AbortError"
            ) {
                return;
            }

            setShareMessage(
                "No se pudo compartir el comprobante."
            );
        } finally {
            setSharingReceipt(false);
        }
    };

    // ==========================================
    // REALIZAR OPERACIÓN
    // ==========================================

    const realizarOperacion = async () => {
        setOperationError("");

        const montoNumerico =
            Number(monto);

        // ======================================
        // VALIDAR MONTO
        // ======================================

        if (
            monto === "" ||
            !Number.isFinite(
                montoNumerico
            )
        ) {
            setOperationError(
                "Ingresa un monto válido."
            );

            return;
        }

        if (
            montoNumerico <= 0
        ) {
            setOperationError(
                "El monto debe ser mayor que 0."
            );

            return;
        }

        // ======================================
        // VALIDAR TRANSFERENCIA
        // ======================================

        if (
            modal === "transfer"
        ) {
            const destinatario =
                identificador.trim();

            if (!destinatario) {
                setOperationError(
                    "Ingresa el correo o número de teléfono del destinatario."
                );

                return;
            }

            if (
                destinatario.length < 3
            ) {
                setOperationError(
                    "El destinatario no es válido."
                );

                return;
            }
        }

        // ======================================
        // VALIDAR SALDO
        // ======================================

        if (
            modal === "transfer" &&
            montoNumerico >
                Number(
                    wallet?.saldo || 0
                )
        ) {
            setOperationError(
                "No tienes saldo suficiente para realizar esta transferencia."
            );

            return;
        }

        try {
            setProcessing(true);

            let respuesta;

            // ==================================
            // RECARGA
            // ==================================

            if (
                modal === "recharge"
            ) {
                respuesta =
                    await api.recharge({
                        monto:
                            montoNumerico,

                        descripcion:
                            descripcion.trim() ||
                            "Recarga desde PagaYA"
                    });
            }

            // ==================================
            // TRANSFERENCIA
            // ==================================

            if (
                modal === "transfer"
            ) {
                respuesta =
                    await api.transfer({
                        identificador:
                            identificador.trim(),

                        monto:
                            montoNumerico,

                        descripcion:
                            descripcion.trim() ||
                            "Transferencia desde PagaYA"
                    });
            }

            // ==================================
            // ACTUALIZAR BILLETERA
            // ==================================

            if (
                respuesta?.billetera
            ) {
                const nuevaWallet = {
                    ...wallet,

                    saldo:
                        respuesta
                            .billetera
                            .saldoNuevo,

                    moneda:
                        respuesta
                            .billetera
                            .moneda ||
                        wallet?.moneda ||
                        "COP",

                    estado:
                        wallet?.estado ||
                        "activa"
                };

                setWallet(
                    nuevaWallet
                );

                localStorage.setItem(
                    "wallet",
                    JSON.stringify(
                        nuevaWallet
                    )
                );
            }

            // ==================================
            // GUARDAR REFERENCIA
            // ==================================

            const referencia =
                respuesta
                    ?.transferencia
                    ?.referencia ||
                respuesta
                    ?.recarga
                    ?.referencia;

            // ==================================
            // CERRAR MODAL
            // ==================================

            setModal(null);

            setMonto("");

            setDescripcion("");

            setIdentificador("");

            setOperationError("");

            // ==================================
            // ACTUALIZAR HISTORIAL
            // ==================================

            const transactionData =
                await api.transactions();

            const movimientos =
                Array.isArray(
                    transactionData.movimientos
                )
                    ? transactionData.movimientos
                    : [];

            setTransactions(
                movimientos
            );

            // ==================================
            // MOSTRAR COMPROBANTE
            // ==================================

            if (referencia) {
                await mostrarComprobante(
                    referencia
                );
            }
        } catch (error) {
            console.error(
                "Error realizando operación:",
                error
            );

            if (
                esErrorAutorizacion(error)
            ) {
                logout();

                return;
            }

            setOperationError(
                error.message ||
                "No se pudo realizar la operación."
            );
        } finally {
            setProcessing(false);
        }
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="dashboard">

            {/* ======================================
                HEADER
            ====================================== */}

            <header className="dashboard-header">

                <div>
                    <strong>
                        PagaYA
                    </strong>
                </div>

                <button
                    className="logout-button"
                    onClick={logout}
                >
                    Cerrar sesión
                </button>

            </header>

            <main className="dashboard-content">

                {/* ==================================
                    BIENVENIDA
                ================================== */}

                <section className="welcome">

                    <p>
                        Bienvenido
                    </p>

                    <h1>
                        {user.nombre ||
                            "Usuario"}{" "}
                        {user.apellido ||
                            ""}
                    </h1>

                </section>

                {/* ==================================
                    ERROR
                ================================== */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* ==================================
                    SALDO
                ================================== */}

                <section className="balance-card">

                    <p>
                        Saldo disponible
                    </p>

                    {loading ? (
                        <h2>
                            Cargando...
                        </h2>
                    ) : (
                        <h2>
                            $
                            {formatoSaldo(
                                wallet?.saldo
                            )}{" "}
                            {wallet?.moneda ||
                                "COP"}
                        </h2>
                    )}

                    <div className="wallet-status">
                        ●{" "}
                        {wallet?.estado ===
                        "activa"
                            ? "Billetera activa"
                            : "Billetera inactiva"}
                    </div>

                </section>

                {/* ==================================
                    ACCIONES
                ================================== */}

                <section className="actions">

                    <button
                        onClick={() =>
                            abrirModal(
                                "recharge"
                            )
                        }
                        disabled={
                            wallet?.estado !==
                            "activa"
                        }
                    >
                        💵 Recargar
                    </button>

                    <button
                        onClick={() =>
                            abrirModal(
                                "transfer"
                            )
                        }
                        disabled={
                            wallet?.estado !==
                            "activa"
                        }
                    >
                        💸 Transferir
                    </button>

                    <button
                        onClick={() => {
                            document
                                .getElementById(
                                    "historial"
                                )
                                ?.scrollIntoView({
                                    behavior:
                                        "smooth"
                                });
                        }}
                    >
                        📜 Historial
                    </button>

                </section>

                {/* ==================================
                    HISTORIAL
                ================================== */}

                <section
                    className="transactions"
                    id="historial"
                >

                    <div className="transactions-header">

                        <div>

                            <h2>
                                Últimas
                                transacciones
                            </h2>

                            <p>
                                Historial de
                                movimientos de
                                tu billetera
                            </p>

                        </div>

                        <span className="transaction-count">
                            {
                                transactions.length
                            }
                        </span>

                    </div>

                    {/* LOADING */}

                    {loadingTransactions && (
                        <div className="empty-state">
                            <p>
                                Cargando
                                transacciones...
                            </p>
                        </div>
                    )}

                    {/* ERROR */}

                    {!loadingTransactions &&
                        transactionsError && (
                            <div className="empty-state">

                                <p>
                                    {
                                        transactionsError
                                    }
                                </p>

                                <button
                                    className="primary-button"
                                    onClick={
                                        cargarDatos
                                    }
                                >
                                    Reintentar
                                </button>

                            </div>
                        )}

                    {/* VACÍO */}

                    {!loadingTransactions &&
                        !transactionsError &&
                        transactions.length ===
                            0 && (
                            <div className="empty-state">

                                <p>
                                    No tienes
                                    transacciones
                                    todavía.
                                </p>

                            </div>
                        )}

                    {/* LISTA */}

                    {!loadingTransactions &&
                        !transactionsError &&
                        transactions.length >
                            0 && (

                            <div className="transaction-list">

                                {transactions.map(
                                    (
                                        transaction
                                    ) => {

                                        const info =
                                            obtenerInfoMovimiento(
                                                transaction.tipo
                                            );

                                        return (
                                            <div
                                                className="transaction-item"
                                                key={
                                                    transaction._id ||
                                                    transaction.referencia
                                                }
                                            >

                                                {/* ICONO */}

                                                <div
                                                    className={`transaction-icon ${info.clase}`}
                                                >
                                                    {
                                                        info.icono
                                                    }
                                                </div>

                                                {/* INFORMACIÓN */}

                                                <div className="transaction-info">

                                                    <div className="transaction-title">

                                                        <strong>
                                                            {
                                                                info.titulo
                                                            }
                                                        </strong>

                                                        <span
                                                            className={`transaction-status ${
                                                                transaction.estado?.toLowerCase() ||
                                                                "completada"
                                                            }`}
                                                        >
                                                            {
                                                                transaction.estado ||
                                                                "completada"
                                                            }
                                                        </span>

                                                    </div>

                                                    <span className="transaction-description">

                                                        {
                                                            transaction.descripcion ||
                                                            "Movimiento de billetera"
                                                        }

                                                    </span>

                                                    <small>

                                                        {
                                                            formatoFecha(
                                                                transaction.createdAt ||
                                                                transaction.fecha
                                                            )
                                                        }

                                                    </small>

                                                    {transaction.referencia && (
                                                        <small className="transaction-reference">

                                                            Ref:{" "}

                                                            {
                                                                transaction.referencia
                                                            }

                                                        </small>
                                                    )}

                                                    {/* =================================
                                                        VER COMPROBANTE
                                                    ================================= */}

                                                    {transaction.referencia && (
                                                        <button
                                                            type="button"
                                                            className="view-receipt-button"
                                                            onClick={() =>
                                                                mostrarComprobante(
                                                                    transaction.referencia
                                                                )
                                                            }
                                                        >
                                                            👁️ Ver comprobante
                                                        </button>
                                                    )}

                                                </div>

                                                {/* MONTO */}

                                                <div
                                                    className={`transaction-amount ${info.clase}`}
                                                >

                                                    {
                                                        info.signo
                                                    }

                                                    $

                                                    {
                                                        formatoSaldo(
                                                            transaction.monto
                                                        )
                                                    }

                                                    {" "}

                                                    {
                                                        wallet?.moneda ||
                                                        "COP"
                                                    }

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        )}

                </section>

            </main>

            {/* ======================================
                MODAL DE OPERACIÓN
            ====================================== */}

            {modal && (

                <div
                    className="modal-overlay"
                    onClick={
                        cerrarModal
                    }
                >

                    <div
                        className="operation-modal"
                        onClick={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>

                                <span className="modal-icon">

                                    {modal ===
                                    "recharge"
                                        ? "💵"
                                        : "💸"}

                                </span>

                                <div>

                                    <h2>

                                        {modal ===
                                        "recharge"
                                            ? "Recargar billetera"
                                            : "Transferir dinero"}

                                    </h2>

                                    <p>

                                        {modal ===
                                        "recharge"
                                            ? "Agrega saldo a tu billetera"
                                            : "Envía dinero a otro usuario"}

                                    </p>

                                </div>

                            </div>

                            <button
                                className="modal-close"
                                onClick={
                                    cerrarModal
                                }
                                disabled={
                                    processing
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="modal-balance">

                            <span>
                                Saldo actual
                            </span>

                            <strong>
                                $
                                {
                                    formatoSaldo(
                                        wallet?.saldo
                                    )
                                }{" "}
                                {
                                    wallet?.moneda ||
                                    "COP"
                                }
                            </strong>

                        </div>

                        {operationError && (
                            <div className="operation-error">
                                {
                                    operationError
                                }
                            </div>
                        )}

                        <div className="operation-form">

                            {modal ===
                                "transfer" && (
                                <>
                                    <label htmlFor="identificador">
                                        Destinatario
                                    </label>

                                    <input
                                        id="identificador"
                                        className="description-input"
                                        type="text"
                                        value={
                                            identificador
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setIdentificador(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Correo o número de teléfono"
                                        disabled={
                                            processing
                                        }
                                        autoFocus
                                    />
                                </>
                            )}

                            <label htmlFor="monto">
                                Monto
                            </label>

                            <div className="amount-input">

                                <span>
                                    $
                                </span>

                                <input
                                    id="monto"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={
                                        monto
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setMonto(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="0"
                                    disabled={
                                        processing
                                    }
                                    autoFocus={
                                        modal ===
                                        "recharge"
                                    }
                                />

                                <span>
                                    {
                                        wallet?.moneda ||
                                        "COP"
                                    }
                                </span>

                            </div>

                            <label htmlFor="descripcion">

                                Descripción{" "}

                                <small>
                                    (opcional)
                                </small>

                            </label>

                            <input
                                id="descripcion"
                                className="description-input"
                                type="text"
                                value={
                                    descripcion
                                }
                                onChange={(
                                    event
                                ) =>
                                    setDescripcion(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder={
                                    modal ===
                                    "recharge"
                                        ? "Ej: Recarga personal"
                                        : "Ej: Pago de arriendo"
                                }
                                maxLength={
                                    100
                                }
                                disabled={
                                    processing
                                }
                            />

                            <button
                                className="operation-button"
                                onClick={
                                    realizarOperacion
                                }
                                disabled={
                                    processing
                                }
                            >

                                {processing
                                    ? "Procesando..."
                                    : modal ===
                                      "recharge"
                                        ? "Recargar billetera"
                                        : "Transferir dinero"}

                            </button>

                            <button
                                className="cancel-button"
                                onClick={
                                    cerrarModal
                                }
                                disabled={
                                    processing
                                }
                            >
                                Cancelar
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* ======================================
                MODAL DE COMPROBANTE
            ====================================== */}

            {(loadingReceipt ||
                receipt ||
                receiptError) && (

                <div
                    className="modal-overlay"
                    onClick={
                        cerrarComprobante
                    }
                >

                    <div
                        className="receipt-modal"
                        onClick={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >

                        {/* ==============================
                            CARGANDO
                        ============================== */}

                        {loadingReceipt && (
                            <div className="receipt-loading">

                                <div className="receipt-loading-icon">
                                    ⏳
                                </div>

                                <h2>
                                    Cargando comprobante
                                </h2>

                                <p>
                                    Espera un momento...
                                </p>

                            </div>
                        )}

                        {/* ==============================
                            ERROR
                        ============================== */}

                        {!loadingReceipt &&
                            receiptError && (
                                <div className="receipt-error">

                                    <div className="receipt-error-icon">
                                        ⚠️
                                    </div>

                                    <h2>
                                        No se pudo obtener
                                        el comprobante
                                    </h2>

                                    <p>
                                        {
                                            receiptError
                                        }
                                    </p>

                                    <button
                                        className="cancel-button"
                                        onClick={
                                            cerrarComprobante
                                        }
                                    >
                                        Cerrar
                                    </button>

                                </div>
                            )}

                        {/* ==============================
                            COMPROBANTE
                        ============================== */}

                        {!loadingReceipt &&
                            receipt &&
                            !receiptError && (

                            <>

                                {/* CERRAR */}

                                <button
                                    className="receipt-close"
                                    onClick={
                                        cerrarComprobante
                                    }
                                    aria-label="Cerrar comprobante"
                                >
                                    ×
                                </button>

                                {/* HEADER */}

                                <div className="receipt-header">

                                    <div className="receipt-success-icon">
                                        ✓
                                    </div>

                                    <h2>
                                        {
                                            obtenerTituloComprobante(
                                                receipt.tipo
                                            )
                                        }
                                    </h2>

                                    <span className="receipt-status">
                                        {
                                            receipt.estado ||
                                            "COMPLETADA"
                                        }
                                    </span>

                                </div>

                                {/* MONTO */}

                                <div
                                    className={`receipt-amount ${
                                        esMovimientoPositivo(
                                            receipt.tipo
                                        )
                                            ? "positive"
                                            : "negative"
                                    }`}
                                >

                                    {
                                        esMovimientoPositivo(
                                            receipt.tipo
                                        )
                                            ? "+"
                                            : "-"
                                    }

                                    $

                                    {
                                        formatoSaldo(
                                            receipt.monto
                                        )
                                    }{" "}

                                    {
                                        receipt.moneda ||
                                        "COP"
                                    }

                                </div>

                                {/* DESCRIPCIÓN */}

                                {receipt.descripcion && (
                                    <div className="receipt-description">

                                        <span>
                                            Descripción
                                        </span>

                                        <strong>
                                            {
                                                receipt.descripcion
                                            }
                                        </strong>

                                    </div>
                                )}

                                {/* DETALLES */}

                                <div className="receipt-details">

                                    <div className="receipt-row">

                                        <span>
                                            Fecha
                                        </span>

                                        <strong>
                                            {
                                                formatoFecha(
                                                    receipt.fecha
                                                )
                                            }
                                        </strong>

                                    </div>

                                    <div className="receipt-row">

                                        <span>
                                            Referencia
                                        </span>

                                        <strong className="receipt-reference-value">
                                            {
                                                receipt.referencia
                                            }
                                        </strong>

                                    </div>

                                    

                                </div>

                                {/* MENSAJE */}

                                {shareMessage && (
                                    <div className="share-message">
                                        {shareMessage}
                                    </div>
                                )}

                                {/* BOTONES */}

                                <div className="receipt-actions">

                                    <button
                                        type="button"
                                        className="share-receipt-button"
                                        onClick={
                                            compartirComprobante
                                        }
                                        disabled={
                                            sharingReceipt
                                        }
                                    >
                                        {sharingReceipt
                                            ? "Generando imagen..."
                                            : "📤 Compartir imagen"}
                                    </button>

                                    <button
                                        type="button"
                                        className="operation-button"
                                        onClick={
                                            cerrarComprobante
                                        }
                                    >
                                        Cerrar comprobante
                                    </button>

                                </div>

                            </>
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}

export default Dashboard;