const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const emailRoutes = require("./emailRoutes");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", emailRoutes); // Ajoute les routes d'email

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur Express en écoute sur le port ${PORT}`);
});
