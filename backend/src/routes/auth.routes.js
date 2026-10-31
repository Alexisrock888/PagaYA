const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Wallet = require("../models/Wallet");
const verificarToken = require("../middleware/auth.middleware");
const sqlSync = require("../services/sqlSync");

const router = express.Router();


// ======================================================
// REGISTRO DE USUARIO
// POST /api/auth/register
// ======================================================

router.post("/register", async (req, res) => {
    try {
        const {
            nombre,
            apellido,
            email,
            telefono,
            password
        } = req.body;

        // --------------------------------------------------
        // 1. Validar campos obligatorios
        // --------------------------------------------------

        if (!nombre || !apellido || !email || !telefono || !password) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        // --------------------------------------------------
        // 2. Validar contraseña
        // --------------------------------------------------

        if (password.length < 8) {
            return res.status(400).json({
                message: "La contraseña debe tener mínimo 8 caracteres"
            });
        }

        // --------------------------------------------------
        // 3. Normalizar correo
        // --------------------------------------------------

        const emailNormalizado = email.trim().toLowerCase();

        // --------------------------------------------------
        // 4. Comprobar si el correo ya existe
        // --------------------------------------------------

        const usuarioExistente = await User.findOne({
            email: emailNormalizado
        });

        if (usuarioExistente) {
            return res.status(409).json({
                message: "El correo electrónico ya está registrado"
            });
        }

        // --------------------------------------------------
        // 5. Encriptar contraseña
        // --------------------------------------------------

        const passwordHash = await bcrypt.hash(password, 12);

        // --------------------------------------------------
        // 6. Crear usuario
        // --------------------------------------------------

        const usuario = await User.create({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: emailNormalizado,
            telefono: telefono.trim(),
            password: passwordHash
        });

        // --------------------------------------------------
        // 7. Crear billetera automáticamente
        // --------------------------------------------------

        const billetera = await Wallet.create({
            usuario: usuario._id,
            saldo: 0,
            moneda: "COP",
            estado: "activa"
        });

        // --------------------------------------------------
        // 8. Espejar en SQL Server (best-effort)
        // --------------------------------------------------

        try {
            const usuarioSqlId = await sqlSync.insertUsuario(usuario);
            await sqlSync.insertBilletera(billetera, usuarioSqlId);
        } catch (error) {
            console.error(
                "Error replicando registro en SQL Server:",
                error.message
            );
        }

        // --------------------------------------------------
        // 9. Respuesta
        // --------------------------------------------------

        return res.status(201).json({
            message: "Usuario registrado correctamente",

            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                telefono: usuario.telefono,
                rol: usuario.rol,
                estado: usuario.estado
            },

            billetera: {
                id: billetera._id,
                saldo: billetera.saldo,
                moneda: billetera.moneda,
                estado: billetera.estado
            }
        });

    } catch (error) {
        console.error("Error registrando usuario:", error);

        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
});


// ======================================================
// LOGIN DE USUARIO
// POST /api/auth/login
// ======================================================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // --------------------------------------------------
        // 1. Validar campos
        // --------------------------------------------------

        if (!email || !password) {
            return res.status(400).json({
                message: "El correo y la contraseña son obligatorios"
            });
        }

        // --------------------------------------------------
        // 2. Normalizar correo
        // --------------------------------------------------

        const emailNormalizado = email.trim().toLowerCase();

        // --------------------------------------------------
        // 3. Buscar usuario
        // --------------------------------------------------

        const usuario = await User.findOne({
            email: emailNormalizado
        });

        if (!usuario) {
            return res.status(401).json({
                message: "Credenciales incorrectas"
            });
        }

        // --------------------------------------------------
        // 4. Verificar contraseña
        // --------------------------------------------------

        const passwordCorrecta = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                message: "Credenciales incorrectas"
            });
        }

        // --------------------------------------------------
        // 5. Verificar estado del usuario
        // --------------------------------------------------

        if (usuario.estado !== "activo") {
            return res.status(403).json({
                message: "El usuario se encuentra inactivo"
            });
        }

        // --------------------------------------------------
        // 6. Verificar JWT_SECRET
        // --------------------------------------------------

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET no está configurado");

            return res.status(500).json({
                message: "Configuración de seguridad incompleta"
            });
        }

        // --------------------------------------------------
        // 7. Crear JWT
        // --------------------------------------------------

        const token = jwt.sign(
            {
                id: usuario._id.toString(),
                email: usuario.email,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "8h"
            }
        );

        // --------------------------------------------------
        // 8. Buscar billetera
        // --------------------------------------------------

        const billetera = await Wallet.findOne({
            usuario: usuario._id
        });

        // --------------------------------------------------
        // 9. Respuesta
        // --------------------------------------------------

        return res.status(200).json({
            message: "Inicio de sesión exitoso",

            token,

            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                telefono: usuario.telefono,
                rol: usuario.rol,
                estado: usuario.estado
            },

            billetera: billetera
                ? {
                    id: billetera._id,
                    saldo: billetera.saldo,
                    moneda: billetera.moneda,
                    estado: billetera.estado
                }
                : null
        });

    } catch (error) {
        console.error("Error en login:", error);

        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
});


// ======================================================
// PERFIL DEL USUARIO AUTENTICADO
// GET /api/auth/profile
// ======================================================

router.get("/profile", verificarToken, async (req, res) => {
    try {

        // --------------------------------------------------
        // 1. Buscar usuario
        // --------------------------------------------------

        const usuario = await User.findById(req.usuario.id)
            .select("-password");

        if (!usuario) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        // --------------------------------------------------
        // 2. Buscar billetera
        // --------------------------------------------------

        const billetera = await Wallet.findOne({
            usuario: usuario._id
        });

        // --------------------------------------------------
        // 3. Respuesta
        // --------------------------------------------------

        return res.status(200).json({
            message: "Perfil obtenido correctamente",

            usuario,

            billetera: billetera
                ? {
                    id: billetera._id,
                    saldo: billetera.saldo,
                    moneda: billetera.moneda,
                    estado: billetera.estado
                }
                : null
        });

    } catch (error) {
        console.error("Error obteniendo perfil:", error);

        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
});


module.exports = router;