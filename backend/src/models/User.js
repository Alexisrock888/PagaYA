const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },

        apellido: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        telefono: {
            type: String,
            required: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 8
        },

        rol: {
            type: String,
            enum: ["usuario", "admin"],
            default: "usuario"
        },

        estado: {
            type: String,
            enum: ["activo", "bloqueado", "inactivo"],
            default: "activo"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);