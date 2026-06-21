const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Carpeta de imágenes.
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(__dirname, '../../storage');

router.get('/:filename', (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(STORAGE_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Imagen no encontrada');
    }

    res.sendFile(filePath);
});

module.exports = router;
