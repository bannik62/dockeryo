import express from 'express';
import cors from 'cors';
import projectRoutes from './routes/projectRoutes.mjs';
import containerRoutes from './routes/containerRoutes.mjs';
import authMiddleware from './routes/authMiddleware.mjs'; // Vérifie la casse et le chemin
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3000;

// Middleware de configuration
app.use(cors());
app.use(express.json());

console.log('Configuration initiale des middlewares terminée.');


app.get('/', (req, res) => {
    res.send('Hello World'); // Répond avec "Hello World" pour une requête à la racine
});
// Routes pour les utilisateurs (accès aux projets et conteneurs)
app.use('/projects', (req, res, next) => {
    console.log('Accès à la route /projects');
    next();
}, projectRoutes);

app.use('/containers', (req, res, next) => {
    console.log(`Accès à la route ${req.method} ${req.url}`);
    console.log(`Corps de la requête :`, req.body); // Affiche le corps pour POST, PUT, etc.
    console.log(`Paramètres de la requête :`, req.params); // Affiche les paramètres de route
    console.log(`Query :`, req.query); // Affiche les paramètres de requête dans l'URL (pour GET)
    next();
}, containerRoutes);


// Middleware de redirection pour les administrateurs
app.use('/admin-service', authMiddleware, createProxyMiddleware({
    target: 'http://localhost:4000', // URL de votre adminServer
    changeOrigin: true,
    pathRewrite: { '^/admin-service': '' }, // Réécriture de l'URL si nécessaire
}));

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur utilisateur en écoute sur le port ${PORT}`);
});
