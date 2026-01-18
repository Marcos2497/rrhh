const { Empleado, Nacionalidad } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los empleados con filtros
const getAll = async (req, res) => {
    try {
        const { nombre, apellido, email, nacionalidadId, genero, estadoCivil } = req.query;
        const where = {};

        if (nombre) {
            where.nombre = { [Op.like]: `%${nombre}%` };
        }
        if (apellido) {
            where.apellido = { [Op.like]: `%${apellido}%` };
        }
        if (email) {
            where.email = { [Op.like]: `%${email}%` };
        }
        if (nacionalidadId) {
            where.nacionalidadId = nacionalidadId;
        }
        if (genero) {
            where.genero = genero;
        }
        if (estadoCivil) {
            where.estadoCivil = estadoCivil;
        }

        const empleados = await Empleado.findAll({
            where,
            include: [{ model: Nacionalidad, as: 'nacionalidad' }],
            order: [['apellido', 'ASC'], ['nombre', 'ASC']],
        });

        res.json(empleados);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener empleado por ID
const getById = async (req, res) => {
    try {
        const empleado = await Empleado.findByPk(req.params.id, {
            include: [{ model: Nacionalidad, as: 'nacionalidad' }],
        });

        if (!empleado) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        res.json(empleado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear empleado
const create = async (req, res) => {
    try {
        // Verificar que la nacionalidad existe
        const nacionalidad = await Nacionalidad.findByPk(req.body.nacionalidadId);
        if (!nacionalidad) {
            return res.status(400).json({ error: 'La nacionalidad especificada no existe' });
        }

        const empleado = await Empleado.create(req.body);

        // Recargar con la relación
        const empleadoConNacionalidad = await Empleado.findByPk(empleado.id, {
            include: [{ model: Nacionalidad, as: 'nacionalidad' }],
        });

        res.status(201).json(empleadoConNacionalidad);
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const messages = error.errors.map(e => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: error.message });
    }
};

// Actualizar empleado
const update = async (req, res) => {
    try {
        const empleado = await Empleado.findByPk(req.params.id);

        if (!empleado) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        // Si se actualiza la nacionalidad, verificar que existe
        if (req.body.nacionalidadId) {
            const nacionalidad = await Nacionalidad.findByPk(req.body.nacionalidadId);
            if (!nacionalidad) {
                return res.status(400).json({ error: 'La nacionalidad especificada no existe' });
            }
        }

        await empleado.update(req.body);

        // Recargar con la relación
        const empleadoActualizado = await Empleado.findByPk(empleado.id, {
            include: [{ model: Nacionalidad, as: 'nacionalidad' }],
        });

        res.json(empleadoActualizado);
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const messages = error.errors.map(e => e.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: error.message });
    }
};

// Eliminar empleado
const remove = async (req, res) => {
    try {
        const empleado = await Empleado.findByPk(req.params.id);

        if (!empleado) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        await empleado.destroy();
        res.json({ message: 'Empleado eliminado correctamente' });
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
