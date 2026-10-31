// ======================================================
// MOCK BACKEND (MODO DEMO SIN SERVIDOR)
// ======================================================
// Simula la API del backend usando localStorage para
// que la app funcione sin conexión al servidor.
// Incluye los 2 usuarios hardcodeados.
// ======================================================

const DB_KEY = "pagaya_mock_db_v1";

const SEED_USERS = [
    {
        id: "aaaa00000000000000000001",
        nombre: "Ana",
        apellido: "López",
        email: "ana@pagaya.com",
        telefono: "3001234567",
        password: "12345678",
        rol: "usuario",
        estado: "activo",
        saldo: 150000
    },
    {
        id: "aaaa00000000000000000002",
        nombre: "Carlos",
        apellido: "Martínez",
        email: "carlos@pagaya.com",
        telefono: "3007654321",
        password: "12345678",
        rol: "usuario",
        estado: "activo",
        saldo: 50000
    }
];

function generarId() {
    return `mock_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}

function generarReferencia(prefijo) {
    const hex = Array.from(
        { length: 16 },
        () =>
            "0123456789ABCDEF"[
                Math.floor(Math.random() * 16)
            ]
    ).join("");

    return `${prefijo}-${hex}`;
}

function cargarDb() {
    try {
        const raw = localStorage.getItem(DB_KEY);

        if (raw) {
            return JSON.parse(raw);
        }
    } catch (error) {
        console.warn("No se pudo leer la base mock", error);
    }

    const db = {
        users: SEED_USERS.map((u) => ({
            id: u.id,
            nombre: u.nombre,
            apellido: u.apellido,
            email: u.email,
            telefono: u.telefono,
            password: u.password,
            rol: u.rol,
            estado: u.estado
        })),
        wallets: {},
        transactions: [],
        tokens: {}
    };

    SEED_USERS.forEach((u) => {
        db.wallets[u.id] = {
            id: u.id,
            saldo: u.saldo,
            moneda: "COP",
            estado: "activa"
        };
    });

    guardarDb(db);

    return db;
}

function guardarDb(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function tokenActual() {
    return localStorage.getItem("token");
}

function usuarioActual(db) {
    const token = tokenActual();

    if (!token) {
        return null;
    }

    const usuarioId = db.tokens[token];

    if (!usuarioId) {
        return null;
    }

    return db.users.find((u) => u.id === usuarioId) || null;
}

function aRespuestaUsuario(usuario) {
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        estado: usuario.estado
    };
}

function aRespuestaBilletera(billetera) {
    return {
        id: billetera.id,
        saldo: billetera.saldo,
        moneda: billetera.moneda,
        estado: billetera.estado
    };
}

// ======================================================
// HANDLERS
// ======================================================

function mockLogin(db, body) {
    const { email, password } = body || {};

    if (!email || !password) {
        throw new Error(
            "El correo y la contraseña son obligatorios"
        );
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuario = db.users.find(
        (u) => u.email === emailNormalizado
    );

    if (!usuario || usuario.password !== password) {
        throw new Error("Credenciales incorrectas");
    }

    if (usuario.estado !== "activo") {
        throw new Error("El usuario se encuentra inactivo");
    }

    const token = generarId();

    db.tokens[token] = usuario.id;
    guardarDb(db);

    return {
        message: "Inicio de sesión exitoso",
        token,
        usuario: aRespuestaUsuario(usuario),
        billetera: aRespuestaBilletera(
            db.wallets[usuario.id]
        )
    };
}

function mockRegister(db, body) {
    const { nombre, apellido, email, telefono, password } =
        body || {};

    if (!nombre || !apellido || !email || !telefono || !password) {
        throw new Error("Todos los campos son obligatorios");
    }

    if (password.length < 8) {
        throw new Error(
            "La contraseña debe tener mínimo 8 caracteres"
        );
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (db.users.some((u) => u.email === emailNormalizado)) {
        throw new Error(
            "El correo electrónico ya está registrado"
        );
    }

    const usuario = {
        id: generarId(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: emailNormalizado,
        telefono: telefono.trim(),
        password,
        rol: "usuario",
        estado: "activo"
    };

    db.users.push(usuario);

    db.wallets[usuario.id] = {
        id: usuario.id,
        saldo: 0,
        moneda: "COP",
        estado: "activa"
    };

    guardarDb(db);

    return {
        message: "Usuario registrado correctamente",
        usuario: aRespuestaUsuario(usuario),
        billetera: aRespuestaBilletera(db.wallets[usuario.id])
    };
}

function mockProfile(db) {
    const usuario = usuarioActual(db);

    if (!usuario) {
        throw new Error("Token de autenticación requerido");
    }

    return {
        message: "Perfil obtenido correctamente",
        usuario: aRespuestaUsuario(usuario),
        billetera: aRespuestaBilletera(db.wallets[usuario.id])
    };
}

function mockTransactions(db) {
    const usuario = usuarioActual(db);

    if (!usuario) {
        throw new Error("Token de autenticación requerido");
    }

    const movimientos = db.transactions
        .filter((t) => t.usuario === usuario.id)
        .sort(
            (a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
        );

    return {
        message: "Movimientos obtenidos correctamente",
        cantidad: movimientos.length,
        movimientos
    };
}

function mockRecharge(db, body) {
    const usuario = usuarioActual(db);

    if (!usuario) {
        throw new Error("Token de autenticación requerido");
    }

    const { monto, descripcion } = body || {};

    const montoNumerico = Number(monto);

    if (!Number.isFinite(montoNumerico) || montoNumerico <= 0) {
        throw new Error("El monto debe ser un número mayor que 0");
    }

    const billetera = db.wallets[usuario.id];

    const saldoAnterior = billetera.saldo;

    billetera.saldo += montoNumerico;

    const referencia = generarReferencia("REC");

    const transaccion = {
        _id: generarId(),
        usuario: usuario.id,
        billetera: billetera.id,
        tipo: "recarga",
        monto: montoNumerico,
        saldoAnterior,
        saldoNuevo: billetera.saldo,
        descripcion:
            descripcion?.trim() || "Recarga desde PagaYA",
        estado: "completada",
        referencia,
        createdAt: new Date().toISOString()
    };

    db.transactions.push(transaccion);
    guardarDb(db);

    return {
        message: "Recarga realizada correctamente",
        recarga: {
            monto: transaccion.monto,
            referencia: transaccion.referencia,
            estado: transaccion.estado
        },
        billetera: {
            id: billetera.id,
            saldoAnterior,
            saldoNuevo: billetera.saldo,
            moneda: billetera.moneda
        }
    };
}

function mockTransfer(db, body) {
    const usuario = usuarioActual(db);

    if (!usuario) {
        throw new Error("Token de autenticación requerido");
    }

    const { identificador, monto, descripcion } = body || {};

    if (!identificador || !identificador.trim()) {
        throw new Error(
            "El correo o número de teléfono del destinatario es obligatorio"
        );
    }

    const montoNumerico = Number(monto);

    if (!Number.isFinite(montoNumerico) || montoNumerico <= 0) {
        throw new Error("El monto debe ser un número mayor que 0");
    }

    const identificadorLimpio = identificador.trim().toLowerCase();

    const destinatario = db.users.find(
        (u) =>
            u.email === identificadorLimpio ||
            u.telefono === identificadorLimpio
    );

    if (!destinatario) {
        throw new Error(
            "No encontramos una cuenta asociada a ese correo o número de teléfono"
        );
    }

    if (destinatario.id === usuario.id) {
        throw new Error(
            "No puedes transferir dinero a tu propia cuenta"
        );
    }

    const billeteraRemitente = db.wallets[usuario.id];
    const billeteraDestinatario = db.wallets[destinatario.id];

    if (billeteraRemitente.saldo < montoNumerico) {
        throw new Error(
            "Saldo insuficiente o la billetera no está activa"
        );
    }

    const saldoAnteriorRemitente = billeteraRemitente.saldo;
    const saldoAnteriorDestinatario = billeteraDestinatario.saldo;

    billeteraRemitente.saldo -= montoNumerico;
    billeteraDestinatario.saldo += montoNumerico;

    const referencia = generarReferencia("TRF");
    const ahora = new Date().toISOString();

    db.transactions.push({
        _id: generarId(),
        usuario: usuario.id,
        billetera: billeteraRemitente.id,
        tipo: "transferencia_enviada",
        monto: montoNumerico,
        saldoAnterior: saldoAnteriorRemitente,
        saldoNuevo: billeteraRemitente.saldo,
        descripcion:
            descripcion?.trim() ||
            `Transferencia a ${destinatario.nombre} ${destinatario.apellido}`,
        estado: "completada",
        referencia,
        createdAt: ahora
    });

    db.transactions.push({
        _id: generarId(),
        usuario: destinatario.id,
        billetera: billeteraDestinatario.id,
        tipo: "transferencia_recibida",
        monto: montoNumerico,
        saldoAnterior: saldoAnteriorDestinatario,
        saldoNuevo: billeteraDestinatario.saldo,
        descripcion: "Transferencia recibida",
        estado: "completada",
        referencia,
        createdAt: ahora
    });

    guardarDb(db);

    return {
        message: "Transferencia realizada correctamente",
        transferencia: {
            monto: montoNumerico,
            referencia,
            estado: "completada",
            destinatario: {
                nombre: destinatario.nombre,
                apellido: destinatario.apellido,
                email: destinatario.email
            }
        },
        billetera: {
            id: billeteraRemitente.id,
            saldoAnterior: saldoAnteriorRemitente,
            saldoNuevo: billeteraRemitente.saldo,
            moneda: billeteraRemitente.moneda
        }
    };
}

function mockPayment(db, body) {
    const usuario = usuarioActual(db);

    if (!usuario) {
        throw new Error("Token de autenticación requerido");
    }

    const { monto, descripcion } = body || {};

    const montoNumerico = Number(monto);

    if (!Number.isFinite(montoNumerico) || montoNumerico <= 0) {
        throw new Error("El monto debe ser un número mayor que 0");
    }

    const billetera = db.wallets[usuario.id];

    if (billetera.saldo < montoNumerico) {
        throw new Error(
            "Saldo insuficiente o la billetera no está activa"
        );
    }

    const saldoAnterior = billetera.saldo;

    billetera.saldo -= montoNumerico;

    const referencia = generarReferencia("PAY");

    const transaccion = {
        _id: generarId(),
        usuario: usuario.id,
        billetera: billetera.id,
        tipo: "pago",
        monto: montoNumerico,
        saldoAnterior,
        saldoNuevo: billetera.saldo,
        descripcion: descripcion?.trim() || "Pago PagaYA",
        estado: "completada",
        referencia,
        createdAt: new Date().toISOString()
    };

    db.transactions.push(transaccion);
    guardarDb(db);

    return {
        message: "Pago realizado correctamente",
        pago: {
            monto: transaccion.monto,
            referencia: transaccion.referencia,
            estado: transaccion.estado
        },
        billetera: {
            id: billetera.id,
            saldoAnterior,
            saldoNuevo: billetera.saldo,
            moneda: billetera.moneda
        }
    };
}

function mockReceipt(db, referencia) {
    const usuario = usuarioActual(db);

    if (!usuario) {
        throw new Error("Token de autenticación requerido");
    }

    const transaccion = db.transactions.find(
        (t) => t.referencia === referencia && t.usuario === usuario.id
    );

    if (!transaccion) {
        throw new Error("Comprobante no encontrado");
    }

    return {
        message: "Comprobante obtenido correctamente",
        comprobante: {
            tipo: transaccion.tipo.toUpperCase(),
            estado: transaccion.estado.toUpperCase(),
            referencia: transaccion.referencia,
            monto: transaccion.monto,
            moneda: "COP",
            saldoAnterior: transaccion.saldoAnterior,
            saldoNuevo: transaccion.saldoNuevo,
            descripcion: transaccion.descripcion,
            fecha: transaccion.createdAt
        }
    };
}

// ======================================================
// ROUTER MOCK
// ======================================================

export async function mockRequest(endpoint, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const url = endpoint.split("?")[0];
    const partes = url.split("/").filter(Boolean);
    let body = {};

    if (options.body) {
        try {
            body = JSON.parse(options.body);
        } catch {
            body = {};
        }
    }

    const db = cargarDb();

    if (method === "POST" && partes[0] === "auth" && partes[1] === "login") {
        return mockLogin(db, body);
    }

    if (method === "POST" && partes[0] === "auth" && partes[1] === "register") {
        return mockRegister(db, body);
    }

    if (method === "GET" && partes[0] === "auth" && partes[1] === "profile") {
        return mockProfile(db);
    }

    if (
        method === "GET" &&
        partes[0] === "wallet" &&
        partes[1] === "transactions" &&
        partes.length === 2
    ) {
        return mockTransactions(db);
    }

    if (method === "POST" && partes[0] === "wallet" && partes[1] === "recharge") {
        return mockRecharge(db, body);
    }

    if (method === "POST" && partes[0] === "wallet" && partes[1] === "payment") {
        return mockPayment(db, body);
    }

    if (method === "POST" && partes[0] === "wallet" && partes[1] === "transfer") {
        return mockTransfer(db, body);
    }

    if (
        method === "GET" &&
        partes[0] === "wallet" &&
        partes[1] === "transactions" &&
        partes.length === 4 &&
        partes[3] === "receipt"
    ) {
        return mockReceipt(db, decodeURIComponent(partes[2]));
    }

    if (
        method === "GET" &&
        partes[0] === "wallet" &&
        partes[1] === "transactions" &&
        partes.length === 3
    ) {
        return mockReceipt(db, decodeURIComponent(partes[2]));
    }

    throw new Error("Operación no disponible en modo demo");
}
