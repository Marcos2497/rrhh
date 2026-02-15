const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');
const { parseLocalDate } = require('../utils/fechas');

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre es requerido' },
            len: { args: [2, 100], msg: 'El nombre debe tener entre 2 y 100 caracteres' },
        },
    },
    apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El apellido es requerido' },
            len: { args: [2, 100], msg: 'El apellido debe tener entre 2 y 100 caracteres' },
        },
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: 'El email es requerido' },
            isEmail: { msg: 'Debe ser un email válido' },
        },
    },
    contrasena: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La contraseña es requerida' },
            len: {
                args: [8, 255],
                msg: 'La contraseña debe tener al menos 8 caracteres'
            },
            is: {
                args: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
                msg: 'La contraseña debe contener al menos una mayúscula, un número y un carácter especial (@$!%*?&#)'
            }
        }
    },
    // Booleano para determinar si es Admin
    esAdministrador: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    // Booleano para determinar si es Empleado
    esEmpleado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    creadoPorRrhh: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Por defecto es registro público
    },
    // Información personal y contacto
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            is: {
                args: /^[0-9+\-\s()]*$/,
                msg: 'El teléfono solo puede contener números, +, -, espacios y paréntesis',
            },
        },
    },
    tipoDocumento: {
        type: DataTypes.ENUM('cedula', 'pasaporte'),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El tipo de documento es requerido' },
            isIn: {
                args: [['cedula', 'pasaporte']],
                msg: 'El tipo de documento debe ser cedula o pasaporte',
            },
        },
    },
    numeroDocumento: {
        type: DataTypes.STRING(20),
        allowNull: false,
        // unique: true, // Eliminado unique global, debería ser unique por espacio de trabajo si se desea, pero dejémoslo simple por ahora
        validate: {
            notEmpty: { msg: 'El número de documento es requerido' },
            is: {
                args: /^(\d{8}|[MF]\d{7})$/,
                msg: 'El documento debe ser 8 números o comenzar con M/F seguido de 7 números',
            },
        },
    },
    cuil: {
        type: DataTypes.STRING(13),
        allowNull: true,
        // unique: true, // Idem numeroDocumento
        set(value) {
            this.setDataValue('cuil', value === '' ? null : value);
        },
        validate: {
            is: {
                args: /^(\d{2}-\d{8}-\d{1})?$/,
                msg: 'El CUIL debe tener el formato XX-XXXXXXXX-X',
            },
        },
    },
    fechaNacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La fecha de nacimiento es requerida' },
            isDate: { msg: 'Debe ser una fecha válida' },
            isAfter: {
                args: '1899-12-31',
                msg: 'La fecha de nacimiento no es válida',
            },
            isNotFuture(value) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                value = parseLocalDate(value);
                value.setHours(0, 0, 0, 0);
                if (value >= today) {
                    throw new Error('La fecha de nacimiento debe ser anterior a hoy');
                }
            },
        },
    },
    nacionalidadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La nacionalidad es requerida' },
        },
    },
    genero: {
        type: DataTypes.ENUM('masculino', 'femenino', 'otro'),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El género es requerido' },
            isIn: {
                args: [['masculino', 'femenino', 'otro']],
                msg: 'El género debe ser masculino, femenino u otro',
            },
        },
    },
    estadoCivil: {
        type: DataTypes.ENUM('soltero', 'casado', 'divorciado', 'viudo', 'union_convivencial'),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El estado civil es requerido' },
            isIn: {
                args: [['soltero', 'casado', 'divorciado', 'viudo', 'union_convivencial']],
                msg: 'El estado civil debe ser uno de los permitidos',
            },
        },
    },
    // Dirección legal
    calle: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La calle es requerida' },
            len: { args: [1, 200], msg: 'La calle debe tener entre 1 y 200 caracteres' },
        },
    },
    numero: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El número es requerido' },
            len: { args: [1, 20], msg: 'El número debe tener entre 1 y 20 caracteres' },
        },
    },
    piso: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
            len: { args: [0, 10], msg: 'El piso no puede exceder 10 caracteres' },
        },
    },
    departamento: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
            len: { args: [0, 10], msg: 'El departamento no puede exceder 10 caracteres' },
        },
    },
    codigoPostal: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
            len: { args: [0, 10], msg: 'El código postal no puede exceder 10 caracteres' },
            is: { args: /^[A-Z0-9]*$/i, msg: 'El código postal solo puede contener letras y números' },
        },
    },
    provinciaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La provincia es requerida' },
        },
    },
    ciudadId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    // Booleano para indicar si el usuario está activo
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'usuarios',
    timestamps: true,
    hooks: {
        beforeCreate: async (usuario) => {
            if (usuario.contrasena) {
                const salt = await bcrypt.genSalt(10);
                usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
            }
        },
        beforeUpdate: async (usuario) => {
            if (usuario.changed('contrasena')) {
                const salt = await bcrypt.genSalt(10);
                usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
            }
        },
    },
});

module.exports = Usuario;
