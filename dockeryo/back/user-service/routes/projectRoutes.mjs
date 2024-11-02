import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml'; // Assurez-vous d'importer js-yaml

// Obtention du chemin du fichier courant
const __filename = fileURLToPath(import.meta.url); // Chemin complet du fichier courant
const __dirname = path.dirname(__filename); // Chemin du dossier courant

const router = express.Router();
const projectsPath = path.join(__dirname, '../project'); // Chemin vers le dossier 'project'

// Fonction pour charger la configuration du projet
const loadProjectConfig = async (projectPath) => {
    try {
        const fileContents = await fs.readFile(projectPath, 'utf8');
        return yaml.load(fileContents);
    } catch (e) {
        console.error('Erreur lors du chargement du fichier de configuration:', e);
        return null;
    }
};

router.get('/', async (req, res) => {
    try {
        const projectFolders = await fs.readdir(projectsPath);
        console.log('Dossiers trouvés:', projectFolders); // Log des dossiers trouvés

        const projects = await Promise.all(projectFolders.map(async (folder) => {
            const configPath = path.join(projectsPath, folder, 'config.yaml'); // Chemin vers le fichier config.yaml
            const config = await loadProjectConfig(configPath); // Charger la configuration

            return {
                name: folder, // Nom du projet basé sur le dossier
                description: config ? config.description : 'Aucune description disponible', // Description du config.yaml
            };
        }));

        res.json(projects); // Renvoyer les projets avec descriptions
    } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des projets' });
    }
});

export default router; // Exportation du routeur
