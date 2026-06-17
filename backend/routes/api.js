const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ status: 'success', data: ['hello','world'] });
});

module.exports = router;