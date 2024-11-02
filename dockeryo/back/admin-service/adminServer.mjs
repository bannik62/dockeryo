import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/adminRoutes.mjs';

const app = express();
const PORT = 4000;

console.log('Démarrage du serveur adminServer...');

// Middleware de configuration
app.use(cors());
app.use(express.json());

console.log('Configuration initiale des middlewares pour adminServer terminée.');

// Routes pour l’administration (suppression des conteneurs et réseaux)
app.use('/admin', (req, res, next) => {
    console.log('Accès à la route /admin');
    next();
}, adminRoutes);

app.listen(PORT, () => {
    console.log(`Serveur adminServer en écoute sur le port ${PORT}`);
});
