import express from 'express';
import Docker from 'dockerode';

const router = express.Router();
const docker = new Docker();

// Route pour obtenir tous les conteneurs d'un projet avec leurs détails
router.get('/:project/containers', async (req, res) => {
    try {
        console.log(`Récupération des conteneurs pour le projet : ${req.params.project}`);
        
        const containers = await docker.listContainers({ all: true });
        console.log(`Nombre total de conteneurs trouvés : ${containers.length}`);

        // Filtrer les conteneurs pour le projet spécifique
        const projectContainers = containers
            .filter(container => container.Labels.project === req.params.project)
            .map(container => {
                console.log(`Conteneur trouvé pour le projet ${req.params.project} : ${container.Names[0]}`);
                return {
                    id: container.Id,
                    name: container.Names[0].replace('/', ''),
                    image: container.Image,
                    status: container.State,
                    networkSettings: container.NetworkSettings.Networks,
                    ports: container.Ports,
                    connected: container.State === 'running'
                };
            });

        console.log(`Nombre de conteneurs pour le projet ${req.params.project} : ${projectContainers.length}`);
        res.json(projectContainers);
    } catch (error) {
        console.error(`Erreur lors de la récupération des conteneurs pour le projet ${req.params.project}:`, error);
        res.status(500).json({ message: 'Erreur lors de la récupération des conteneurs' });
    }
});

// Route pour démarrer un conteneur spécifique
router.post('/:project/containers/:id/start', async (req, res) => {
    try {
        console.log(`Démarrage du conteneur avec l'ID : ${req.params.id}`);
        
        const container = docker.getContainer(req.params.id);
        await container.start();
        
        console.log(`Conteneur démarré : ${req.params.id}`);
        res.json({ message: 'Conteneur démarré', id: req.params.id });
    } catch (error) {
        console.error(`Erreur lors du démarrage du conteneur ${req.params.id}:`, error);
        res.status(500).json({ message: 'Erreur lors du démarrage du conteneur' });
    }
});

// Route pour arrêter un conteneur spécifique
router.post('/:project/containers/:id/stop', async (req, res) => {
    try {
        console.log(`Arrêt du conteneur avec l'ID : ${req.params.id}`);
        
        const container = docker.getContainer(req.params.id);
        await container.stop();
        
        console.log(`Conteneur arrêté : ${req.params.id}`);
        res.json({ message: 'Conteneur arrêté', id: req.params.id });
    } catch (error) {
        console.error(`Erreur lors de l'arrêt du conteneur ${req.params.id}:`, error);
        res.status(500).json({ message: 'Erreur lors de l\'arrêt du conteneur' });
    }
});

// Route pour obtenir les informations détaillées d'un conteneur
router.get('/:project/containers/:id', async (req, res) => {
    try {
        console.log(`Récupération des informations pour le conteneur avec l'ID : ${req.params.id}`);
        
        const container = docker.getContainer(req.params.id);
        const info = await container.inspect();
        
        const containerInfo = {
            id: info.Id,
            name: info.Name.replace('/', ''),
            image: info.Config.Image,
            status: info.State.Status,
            networks: info.NetworkSettings.Networks,
            ports: info.NetworkSettings.Ports,
            connected: info.State.Running
        };

        console.log(`Informations du conteneur ${req.params.id} récupérées :`, containerInfo);
        res.json(containerInfo);
    } catch (error) {
        console.error(`Erreur lors de la récupération des informations du conteneur ${req.params.id}:`, error);
        res.status(500).json({ message: 'Erreur lors de la récupération des informations du conteneur' });
    }
});

export default router;
