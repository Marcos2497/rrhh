const { Nacionalidad, Empleado } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las nacionalidades
const getAll = async (req, res) => {
    try {
        const { search } = req.query;
        const where = {};

        if (search) {
            where.nombre = { [Op.like]: `%${search}%` };
        }

        const nacionalidades = await Nacionalidad.findAll({
            where,
            order: [['nombre', 'ASC']],
        });

        res.json(nacionalidades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener nacionalidad por ID
const getById = async (req, res) => {
    try {
        const nacionalidad = await Nacionalidad.findByPk(req.params.id);

        if (!nacionalidad) {
            return res.status(404).json({ error: 'Nacionalidad no encontrada' });
        }

        res.json(nacionalidad);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear nacionalidad
const create = async (req, res) => {
    try {
        const nacionalidad = await Nacionalidad.create(req.body);
        res.status(201).json(nacionalidad);
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const messages = error.errors.map(e => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: error.message });
    }
};

// Actualizar nacionalidad
const update = async (req, res) => {
    try {
        const nacionalidad = await Nacionalidad.findByPk(req.params.id);

        if (!nacionalidad) {
            return res.status(404).json({ error: 'Nacionalidad no encontrada' });
        }

        await nacionalidad.update(req.body);
        res.json(nacionalidad);
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const messages = error.errors.map(e => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: error.message });
    }
};

// Eliminar nacionalidad
const remove = async (req, res) => {
    try {
        const nacionalidad = await Nacionalidad.findByPk(req.params.id);

        if (!nacionalidad) {
            return res.status(404).json({ error: 'Nacionalidad no encontrada' });
        }

        // Verificar si hay empleados con esta nacionalidad
        const empleadosCount = await Empleado.count({ where: { nacionalidadId: req.params.id } });
        if (empleadosCount > 0) {
            return res.status(400).json({
                error: `No se puede eliminar. Hay ${empleadosCount} empleado(s) con esta nacionalidad`
            });
        }

        await nacionalidad.destroy();
        res.json({ message: 'Nacionalidad eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};
