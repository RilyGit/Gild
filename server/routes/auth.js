const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const dbOperations = require('../db'); 

router.post('/register', async (req, res) => {
    try {  
        const { Email, Password } = req.body;
        if (!Email || !Email.includes('@') || !Email.includes('.')) {
            return res.status(400).json({ message: "Некоректний формат email!" });
        }
        if (!Password || Password.length < 8) {
            return res.status(400).json({ message: "Пароль має бути не менше 8 символів!" });
        }
        const User = await dbOperations.findUserByEmail(Email);
        if (User === null) {  
            const hashedPassword = await bcrypt.hash(Password, 10);
            await dbOperations.addUser({ email: Email, password: hashedPassword });
            return res.json({ status: "done", message: "Реєстрація успішна" }); 
        }
        res.status(400).json({ message: "Користувач із таким email вже існує!" });
    } catch(e) {
        console.log("Помилка реєстрації:", e);
        res.status(500).json({ error: "Server error", message: "Спробуй пізніше" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const user = await dbOperations.findUserByEmail(Email);
        if (!user) {
            return res.status(404).json({ message: "Користувача не знайдено!" });
        }
        const isPasswordValid = await bcrypt.compare(Password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Невірний пароль!" });
        }
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.SECRET_KEY,
            { expiresIn: '12h' }
        );
        res.json({ status: "success", message: "Успішний вхід!", token });
    } catch(e) {
        console.log("Помилка входу:", e);
        res.status(500).json({ error: "Server error", message: "Спробуй пізніше" });
    }
});

module.exports = router;