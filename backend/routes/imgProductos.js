const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Carpeta de imágenes.
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(__dirname, '../../storage');

/**
 * GET /:filename
 * Sirve una imagen de producto desde el directorio de almacenamiento (`STORAGE_DIR`).
 * Protegemos contra path traversal usando `path.basename` antes de construir la ruta.
 *
 * @param {string} req.params.filename - Nombre del archivo de imagen solicitado (e.g. "abcd1234.jpg").
 * @returns {file} 200 - Envia el archivo con `res.sendFile`.
 * @returns {string} 404 - Texto "Imagen no encontrada" si no existe el fichero.
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
