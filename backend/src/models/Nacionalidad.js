const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Nacionalidad = sequelize.define('Nacionalidad', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: 'El nombre de la nacionalidad es requerido',
            },
            len: {
                args: [2, 100],
                msg: 'El nombre debe tener entre 2 y 100 caracteres',
            },
        },
    },
}, {
    tableName: 'nacionalidades',
    timestamps: true,
});

module.exports = Nacionalidad;
