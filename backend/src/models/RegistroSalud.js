const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tipos de examen médico
const TIPOS_EXAMEN = [
    'pre_ocupacional',
    'periodico',
    'post_ocupacional',
    'retorno_trabajo',
];

// Resultados posibles
const RESULTADOS = [
    'apto',
    'apto_preexistencias',
    'no_apto',
];

const RegistroSalud = sequelize.define('RegistroSalud', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tipoExamen: {
        type: DataTypes.ENUM(...TIPOS_EXAMEN),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El tipo de examen es requerido' },
            isIn: {
                args: [TIPOS_EXAMEN],
                msg: 'Tipo de examen inválido',
            },
        },
    },
    resultado: {
        type: DataTypes.ENUM(...RESULTADOS),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El resultado es requerido' },
            isIn: {
                args: [RESULTADOS],
                msg: 'Resultado inválido',
            },
        },
    },
    fechaRealizacion: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La fecha de realización es requerida' },
            isDate: { msg: 'Debe ser una fecha válida' },
        },
    },
    fechaVencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La fecha de vencimiento es requerida' },
            isDate: { msg: 'Debe ser una fecha válida' },
        },
    },
    comprobante: {
        type: DataTypes.TEXT, // Base64 encoded file (legacy single file)
        allowNull: true,
    },
    comprobanteNombre: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    comprobanteTipo: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    comprobantes: {
        type: DataTypes.JSON, // Array of { data, nombre, tipo }
        allowNull: true,
        defaultValue: [],
        get() {
            const rawValue = this.getDataValue('comprobantes');
            if (!rawValue) return [];
            if (typeof rawValue === 'string') {
                try {
                    return JSON.parse(rawValue);
                } catch {
                    return [];
                }
            }
            return rawValue;
        },
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    empleadoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'empleados',
            key: 'id'
        }
    },
}, {
    tableName: 'registros_salud',
    timestamps: true,
});

// Hook para validar que fechaVencimiento no sea anterior a fechaRealizacion
RegistroSalud.addHook('beforeValidate', (registro) => {
    if (registro.fechaVencimiento && registro.fechaRealizacion) {
        if (new Date(registro.fechaVencimiento) < new Date(registro.fechaRealizacion)) {
            throw new Error('La fecha de vencimiento no puede ser anterior a la fecha de realización');
        }
    }
});

module.exports = RegistroSalud;
