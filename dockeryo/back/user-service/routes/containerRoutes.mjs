import express from 'express';
import fs from 'fs/promises'; // Ajout de fs pour la lecture des fichiers
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml'; // Assurez-vous d'importer js-yaml
import docker from './dockerClients.mjs';
import { exec } from 'child_process';


// Création de l'équivalent de `__dirname` dans un module ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const projectsPath = path.join(__dirname, '../project');

// Fonction pour charger et parser le fichier YAML
const loadProjectConfig = async (filePath) => {
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        return yaml.load(fileContents);
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier YAML :', error);
        return null;
    }
};

// Route pour obtenir la configuration d'un projet (placez-la en premier)
router.get('/:project/config', async (req, res) => {
    const projectName = req.params.project;
    console.log("Projet demandé pour le fichier config.yaml :", projectName);

    try {
        const configPath = path.join(projectsPath, projectName, 'config.yaml');
        const configData = await loadProjectConfig(configPath);
        if (!configData) {
            console.error(`Fichier config.yaml non trouvé ou vide pour le projet : ${projectName}`);
            return res.status(404).json({ error: "Fichier config.yaml non trouvé pour le projet spécifié." });
        }
        res.json(configData);
    } catch (error) {
        console.error(`Erreur lors de la récupération de la configuration pour le projet ${projectName}:`, error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la configuration du projet' });
    }
});

// Routes pour gérer les conteneurs d'un projet


router.post('/:project/start', async (req, res) => {
    const projectName = req.params.project;
    const composeFilePath = path.join(__dirname, '../project', projectName, 'docker-compose.yml');
    
    console.log(`Démarrage du projet ${projectName} avec dockerode, fichier : ${composeFilePath}`);

    try {
        // Lecture et parsing du fichier docker-compose.yml
        const fileContents = await fs.readFile(composeFilePath, 'utf8');
        const config = yaml.load(fileContents);

        // Gestion des réseaux
        if (config.networks) {
            for (const networkName of Object.keys(config.networks)) {
                try {
                    await docker.createNetwork({ Name: networkName });
                } catch (error) {
                    if (error.statusCode === 409) {
                        console.log(`Le réseau ${networkName} existe déjà, passage.`);
                    } else {
                        console.error(`Erreur lors de la création du réseau ${networkName}: ${error.message}`);
                    }
                }
            }
        }

        // Gestion des conteneurs
        const containers = config.services;
        for (const [containerName, containerConfig] of Object.entries(containers)) {
            // Supprimez le conteneur existant s'il existe déjà
            try {
                const existingContainer = docker.getContainer(containerName);
                await existingContainer.remove({ force: true });
                console.log(`Conteneur existant ${containerName} supprimé.`);
            } catch (error) {
                if (error.statusCode === 404) {
                    console.log(`Aucun conteneur existant nommé ${containerName}, passage.`);
                } else {
                    console.error(`Erreur lors de la suppression du conteneur ${containerName}: ${error.message}`);
                    throw error;
                }
            }

            // Transformation des variables d'environnement en tableau de chaînes de caractères
            const envArray = containerConfig.environment
                ? Object.entries(containerConfig.environment).map(([key, value]) => `${key}=${value}`)
                : [];

            // Configuration du conteneur
            const containerOptions = {
                Image: containerConfig.image,
                name: containerName,
                Env: envArray,
                HostConfig: {
                    PortBindings: (containerConfig.ports || []).reduce((acc, port) => {
                        const [hostPort, containerPort] = port.split(':');
                        acc[`${containerPort}/tcp`] = [{ HostPort: hostPort }];
                        return acc;
                    }, {}),
                    NetworkMode: containerConfig.networks ? containerConfig.networks[0] : undefined,
                },
            };

            // Créer et démarrer le conteneur
            const container = await docker.createContainer(containerOptions);
            await container.start();
            console.log(`Conteneur ${containerName} démarré.`);
        }

        res.json({ message: `Conteneurs pour ${projectName} démarrés avec succès.` });
    } catch (error) {
        console.error(`Erreur lors du démarrage du projet ${projectName} :`, error.message);
        res.status(500).json({ error: 'Erreur lors du démarrage des conteneurs.' });
    }
});

// Route pour obtenir le statut des conteneurs d'un projet
router.get('/:project/status', async (req, res) => {
    const projectName = req.params.project;
    console.log("project", projectName);
    
    console.log(`Récupération de l'état des conteneurs pour le projet : ${projectName}`);
    
    try {
        // Lecture et parsing du fichier docker-compose.yml pour obtenir les noms de conteneurs
        const composeFilePath = path.join(__dirname, '../project', projectName, 'docker-compose.yml');
        const fileContents = await fs.readFile(composeFilePath, 'utf8');
        const config = yaml.load(fileContents);
        
        const containersStatus = await Promise.all(
            Object.keys(config.services).map(async (containerName) => {
                const container = docker.getContainer(containerName);
                try {
                    const containerInfo = await container.inspect();
                    console.log("containerinfo ", containerInfo.State);
                    
                    return {
                        name: containerName,
                        status: containerInfo.State.Running ? 'running' : 'stopped'
                    };
                } catch (error) {
                    return { name: containerName, status: 'not_found' };
                }
            })
        );

        res.json(containersStatus);
    } catch (error) {
        console.error(`Erreur lors de la récupération de l'état des conteneurs pour ${projectName} :`, error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'état des conteneurs.' });
    }
});


// Crée une route pour l'événement de streaming des logs
router.get('/:project/logs', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const projectName = req.params.project;
    const composeFilePath = path.join(__dirname, '../project', projectName, 'docker-compose.yml');

    // Simulation de logs pour le conteneur, à remplacer par des appels docker
    res.write(`data: Initialisation du démarrage du projet ${projectName}\n\n`);

    // Démarrage du conteneur et envoi des logs en temps réel
    startContainer(projectName, composeFilePath, res);
});

function startContainer(projectName, composeFilePath, res) {
    // Ici, remplace par le code de démarrage réel de docker et transmet les logs
    res.write(`data: Démarrage du conteneur pour ${projectName}...\n\n`);
    setTimeout(() => res.write("data: Conteneur démarré avec succès\n\n"), 3000);
}




// Dans `containerRoutes.mjs` ou un fichier backend similaire
router.post('/:project/containers/:id/stop', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        await container.stop();
        res.json({ message: 'Conteneur arrêté', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'arrêt du conteneur' });
    }
});


router.get('/:project/containers/:id', async (req, res) => {
    try {
        console.log(`Récupération des informations pour le conteneur avec l'ID : ${req.params.id}`);
        const container = docker.getContainer(req.params.id);
        const info = await container.inspect();
        res.json(info);
    } catch (error) {
        console.error(`Erreur lors de la récupération des informations du conteneur ${req.params.id}:`, error);
        res.status(500).json({ message: 'Erreur lors de la récupération des informations du conteneur' });
    }
});

export default router;
