const cron = require('node-cron');
const RegistroSalud = require('../models/RegistroSalud');
const { Op } = require('sequelize');

cron.schedule('0 0 * * *', async () => {
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const registrosSalud = await RegistroSalud.findAll({
            where: {
                vigente: true,
                fechaVencimiento: {
                    [Op.lt]: hoy,
                },
            },
        });

        registrosSalud.forEach(async (registro) => {
            registro.vigente = false;
            await registro.save();
        });
    } catch (error) {
        console.error('Error al actualizar registros de salud:', error);
    }
});

module.exports = {
    startRegistroSaludCron: () => {
        console.log('✅ Cron de registros de salud iniciado');
    }
};