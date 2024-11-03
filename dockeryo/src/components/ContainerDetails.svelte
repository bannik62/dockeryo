<script>
    import { projectData ,infoContainer } from "../stores/store.js"; // Import du store projectData
    
    console.log("pp ", typeof infoContainer);
    
    export let title = "Détails du projet";
    let isRunning = []; // Tableau pour suivre l'état de chaque conteneur

    async function startCompose(projectName, index) {
        try {
            const response = await fetch(`http://localhost:3000/containers/${$projectData.project_name}/start`, { method: 'POST' });

            
            if (response.ok) {
                console.log(`Le projet ${projectName} a démarré avec succès.`);
                isRunning[index] = true; // Met à jour l'état pour ce conteneur spécifique
            } else {
                console.error("Erreur lors du démarrage du projet");
            }
        } catch (error) {
            console.error("Erreur lors de la requête de démarrage :", error);
        }
    }
</script>

<style>
    .container-details {
        width: 100%;
        height: 80vh;
        padding: 20px;
        box-sizing: border-box;
        background-color: #f9f9f9;
        overflow-y: auto;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
    }

    .container-title {
        font-size: 1.5em;
        font-weight: bold;
        margin-bottom: 10px;
        color: #333;
    }

    .start-button {
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
        color: #fff;
    }
    .start-button-green {
        background-color: green;
    }
    .start-button-red {
        background-color: red;
    }
</style>

<div class="container-details">
    <div class="container-title">{title}</div>
    <div class="container-content">
        {#if $projectData}
            <h1>Nom du projet sélectionné : {$projectData.project_name}</h1>
            <h2>Description : {$projectData.description}</h2>
            <h3>Conteneurs associés :</h3>
            <ul class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {#each $projectData.containers as container, index}
                    <li class="max-w-sm rounded overflow-hidden shadow-lg bg-white p-6">
                        <h3 class="font-bold text-xl mb-2 text-blue-600">Nom : {container.name}</h3>
                        
                        <p class="text-gray-700">
                            <strong>Image :</strong> {container.image}
                        </p>
                        
                        <p class="text-gray-700">
                            <strong>État :</strong> 
                            <span class="{container.status === 'running' ? 'text-green-500' : 'text-red-500'}">
                                {container.status}
                            </span>
                        </p>
                        <p class="text-gray-700">
                            <strong>Networks :</strong> {container.networks}
                        </p>
                        
                        <p class="text-gray-700">
                            <strong>Ports :</strong> 
                            {container.ports.length > 0 
                                ? container.ports.map(port => `${port}`).join(', ') 
                                : "Aucun port exposé"}
                        </p>
            
                        <!-- Bouton de démarrage/arrêt -->
                        <button
                            class="start-button {isRunning[index] ? 'start-button-red' : 'start-button-green'} mt-4"
                            on:click={() => startCompose(container.name, index)}>
                            {isRunning[index] ? 'Arrêter' : 'Démarrer'}
                        </button>
                    </li>
                {/each}
            </ul>
        {:else}
            <p>Chargement des données du projet...</p>
        {/if}
    </div>
</div>
