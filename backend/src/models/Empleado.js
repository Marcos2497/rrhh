const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { parseLocalDate } = require('../utils/fechas');

const Empleado = sequelize.define('Empleado', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    espacioTrabajoId: {
        type: DataTypes.INTEGER,
        allowNull: false, // Ahora es obligatorio
        references: {
            model: 'espacios_trabajo',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'empleados',
    timestamps: true,
});

module.exports = Empleado;
