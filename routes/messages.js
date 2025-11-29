const express = require('express');
const router = express.Router();
// Simple mock for now to prevent 404
router.post('/send', async (req, res) => {
    console.log("Message received:", req.body);
    res.status(200).json({ success: true, message: "Üzenet elküldve!" });
});
module.exports = router;
