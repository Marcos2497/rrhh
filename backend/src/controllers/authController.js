const { Usuario, Empleado } = require('../models');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

/**
 * Login de usuario
 */
const login = async (req, res) => {
    try {
        const { email, contrasena, recordarme } = req.body;

        // Validación básica
        if (!email || !contrasena) {
            return res.status(400).json({
                error: 'Email y contraseña son requeridos'
            });
        }

        // Buscar usuario por email
        const usuario = await Usuario.findOne({
            where: { email, activo: true }
        });

        if (!usuario) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!isMatch) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Crear sesión
        req.session.usuarioId = usuario.id;
        req.session.empleadoId = usuario.id; // Retrocompatibilidad temporal: ID de usuario
        req.session.esAdministrador = usuario.esAdministrador;

        // Si "recordarme" está activo, extender duración de la cookie
        if (recordarme) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
        }

        // Buscar un empleo asociado para mezclar datos (compatibilidad frontend)
        const empleoAsociado = await Empleado.findOne({
            where: {
                usuarioId: usuario.id
                // idealmente filtrar por espacioTrabajoId si lo tenemos
            }
        });

        const userData = {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            tipoDocumento: usuario.tipoDocumento,
            numeroDocumento: usuario.numeroDocumento,
            cuil: usuario.cuil,
            esAdministrador: usuario.esAdministrador,
            esEmpleado: usuario.esEmpleado,
            activo: usuario.activo,
            createdAt: usuario.createdAt,
            updatedAt: usuario.updatedAt,
            // Datos de empleo si existen
            ...(empleoAsociado ? {
                empleadoId: empleoAsociado.id,
                espacioTrabajoId: empleoAsociado.espacioTrabajoId,
            } : {})
        };

        // Guardar sesión y retornar datos
        req.session.save((err) => {
            if (err) {
                console.error('Error al guardar sesión:', err);
                return res.status(500).json({ error: 'Error al iniciar sesión' });
            }

            res.json({
                message: 'Inicio de sesión exitoso',
                usuario: userData
            });
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
};

/**
 * Logout de usuario
 */
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Sesión cerrada exitosamente' });
    });
};

/**
 * Registro público de usuario (esEmpleado = false)
 */
const register = [
    // Validaciones
    body('email').isEmail().withMessage('Email inválido'),
    body('contrasena')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula')
        .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
        .matches(/[@$!%*?&#]/).withMessage('La contraseña debe contener al menos un carácter especial'),
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('apellido').notEmpty().withMessage('El apellido es requerido'),

    async (req, res) => {
        try {
            // Validar errores
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: errors.array()[0].msg
                });
            }

            const usuarioData = {
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                email: req.body.email,
                contrasena: req.body.contrasena,
                esEmpleado: false, // Registro público
                esAdministrador: false,
                activo: true,
                // Campos obligatorios nuevos - Valores por defecto temporales para evitar bloqueo en registro público
                tipoDocumento: req.body.tipoDocumento || 'cedula',
                numeroDocumento: req.body.numeroDocumento || '00000000',
                cuil: req.body.cuil,
                fechaNacimiento: req.body.fechaNacimiento || '2000-01-01',
                nacionalidadId: req.body.nacionalidadId || 1,
                genero: req.body.genero || 'otro',
                estadoCivil: req.body.estadoCivil || 'soltero',
                calle: req.body.calle || 'Sin especificar',
                numero: req.body.numero || '0',
                provinciaId: req.body.provinciaId || 1, // Asumiendo ID 1 existe
            };

            // Crear usuario
            const nuevoUsuario = await Usuario.create(usuarioData);

            // Auto-login después del registro
            req.session.usuarioId = nuevoUsuario.id;
            req.session.empleadoId = nuevoUsuario.id; // Retrocompatibilidad
            req.session.esAdministrador = false;

            req.session.save((err) => {
                if (err) {
                    console.error('Error al guardar sesión:', err);
                    return res.status(500).json({ error: 'Registro exitoso pero error al iniciar sesión' });
                }

                res.status(201).json({
                    message: 'Registro exitoso',
                    usuario: {
                        id: nuevoUsuario.id,
                        nombre: nuevoUsuario.nombre,
                        apellido: nuevoUsuario.apellido,
                        email: nuevoUsuario.email,
                        esAdministrador: false,
                        esEmpleado: false,
                        activo: true,
                        createdAt: nuevoUsuario.createdAt,
                        updatedAt: nuevoUsuario.updatedAt,
                    }
                });
            });

        } catch (error) {
            console.error('Error en registro:', error);

            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({
                    error: 'El email ya está registrado'
                });
            }

            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    error: error.errors[0].message
                });
            }

            res.status(500).json({ error: 'Error al procesar el registro' });
        }
    }
];

/**
 * Obtener usuario actual en sesión
 */
const getCurrentUser = async (req, res) => {
    try {
        const usuarioId = req.session.usuarioId || req.session.empleadoId;
        const usuario = await Usuario.findByPk(usuarioId, {
            attributes: { exclude: ['contrasena'] },
            include: [{
                model: Empleado,
                as: 'empleos',
                required: false,
                limit: 1
            }]
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const plainUser = usuario.get({ plain: true });
        // Aplanar si tiene empleo
        let result = { ...plainUser };
        if (plainUser.empleos && plainUser.empleos.length > 0) {
            const emp = plainUser.empleos[0];
            result = {
                ...result,
                empleadoId: emp.id,
                tipoDocumento: emp.tipoDocumento,
                numeroDocumento: emp.numeroDocumento,
                cuil: emp.cuil,
                espacioTrabajoId: emp.espacioTrabajoId
            };
            delete result.empleos;
        }

        res.json(result);

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener información del usuario' });
    }
};

/**
 * Cambiar contraseña
 */
const updatePassword = [
    body('nuevaContrasena')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula')
        .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
        .matches(/[@$!%*?&#]/).withMessage('La contraseña debe contener al menos un carácter especial'),

    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: errors.array()[0].msg
                });
            }

            const { usuarioId, contrasenaActual, nuevaContrasena } = req.body;
            const usuarioIdSesion = req.session.usuarioId || req.session.empleadoId;
            const esAdmin = req.session.esAdministrador;

            const targetId = usuarioId || usuarioIdSesion;

            // Verificar permisos
            if (targetId !== usuarioIdSesion && !esAdmin) {
                return res.status(403).json({
                    error: 'No tiene permisos para cambiar esta contraseña'
                });
            }

            const usuario = await Usuario.findByPk(targetId);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Si no es admin y está cambiando su propia contraseña, verificar la actual
            if (!esAdmin && targetId === usuarioIdSesion) {
                if (!contrasenaActual) {
                    return res.status(400).json({
                        error: 'Debe proporcionar la contraseña actual'
                    });
                }

                const isMatch = await bcrypt.compare(contrasenaActual, usuario.contrasena);
                if (!isMatch) {
                    return res.status(401).json({
                        error: 'Contraseña actual incorrecta'
                    });
                }
            }

            usuario.contrasena = nuevaContrasena;
            await usuario.save(); // Hook hashea

            res.json({ message: 'Contraseña actualizada exitosamente' });

        } catch (error) {
            console.error('Error al actualizar contraseña:', error);
            res.status(500).json({ error: 'Error al actualizar contraseña' });
        }
    }
];

module.exports = {
    login,
    logout,
    register,
    getCurrentUser,
    updatePassword,
};
