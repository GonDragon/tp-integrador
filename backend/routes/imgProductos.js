const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Carpeta de imágenes.
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(__dirname, '../../storage');

/**
 * GET /:filename
 *
 * Sirve una imagen de producto desde el directorio de almacenamiento (STORAGE_DIR).
 *
 * @route   GET /:filename
 * @param   {string} req.params.filename - Nombre del archivo de imagen solicitado.
 * @returns {file}   200 - El archivo de imagen solicitado (vía res.sendFile).
 * @returns {string} 404 - "Imagen no encontrada" si el archivo no existe en STORAGE_DIR.
 */
router.get('/:filename', (req, res) => {
    const filename = path.basename(req.params.filename); //Necesario para evitar un path traversal
    const filePath = path.join(STORAGE_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Imagen no encontrada');
    }

    res.sendFile(filePath);
});

module.exports = router;
