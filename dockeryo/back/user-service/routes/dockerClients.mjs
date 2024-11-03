import Docker from 'dockerode';

// Détecte le système d'exploitation et configure Dockerode en conséquence
const docker = process.platform === 'win32'
    ? new Docker({ host: 'localhost', port: 2375 })  // Utilisation de l'API TCP pour Windows
    : new Docker({ socketPath: '/var/run/docker.sock' }); // Utilisation du socket UNIX pour Linux/macOS

// Log pour confirmer la configuration Docker
if (process.platform === 'win32') {
    console.log("Docker configuré pour Windows avec l'API TCP sur localhost:2375");
} else {
    console.log("Docker configuré pour Linux/macOS avec le socket UNIX à /var/run/docker.sock");
}

// Tester la connexion Docker
docker.info((err, info) => {
    if (err) {
        console.error("Erreur lors de la connexion à Docker :", err);
    } else {
        console.log("Connexion réussie à Docker. Informations système :", info);
    }
});

export default docker;
