const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Ton email
        pass: process.env.EMAIL_PASS, // Ton mot de passe (ou App Password)
    },
});

// Route pour envoyer l'email de vérification
router.post("/send-verification-email", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "L'email est requis" });
    }

    // Générer un code aléatoire à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    try {
        await transporter.sendMail({
            from: `"CargoWheen" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Code de vérification - CargoWheen",
            text: `Votre code de vérification est : ${verificationCode}`,
            html: `<p>Votre code de vérification est : <strong>${verificationCode}</strong></p>`,
        });

        res.json({ message: "Email envoyé avec succès", code: verificationCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
    }
});

module.exports = router;
