
import express from 'express';
import Docker from 'dockerode';

const router = express.Router();
const docker = new Docker();

console.log('Initialisation des routes pour adminServer...');

// Route pour supprimer un conteneur
router.delete('/containers/:id', async (req, res) => {
    const containerId = req.params.id;
    console.log(`[adminServer] Suppression demandée pour le conteneur ID : ${containerId}`);
    
    try {
        const container = docker.getContainer(containerId);
        await container.stop();
        console.log(`[adminServer] Conteneur arrêté : ${containerId}`);
        
        await container.remove();
        console.log(`[adminServer] Conteneur supprimé : ${containerId}`);
        
        res.json({ message: `Conteneur ${containerId} supprimé avec succès` });
    } catch (error) {
        console.error(`[adminServer] Erreur lors de la suppression du conteneur ${containerId}:`, error);
        res.status(500).json({ message: `Erreur lors de la suppression du conteneur ${containerId}` });
    }
});

// Route pour supprimer un réseau
router.delete('/networks/:id', async (req, res) => {
    const networkId = req.params.id;
    console.log(`[adminServer] Suppression demandée pour le réseau ID : ${networkId}`);
    
    try {
        const network = docker.getNetwork(networkId);
        await network.remove();
        
        console.log(`[adminServer] Réseau supprimé : ${networkId}`);
        res.json({ message: `Réseau ${networkId} supprimé avec succès` });
    } catch (error) {
        console.error(`[adminServer] Erreur lors de la suppression du réseau ${networkId}:`, error);
        res.status(500).json({ message: `Erreur lors de la suppression du réseau ${networkId}` });
    }
});

console.log('Routes de adminServer prêtes pour la suppression des conteneurs et réseaux.');

export default router;
