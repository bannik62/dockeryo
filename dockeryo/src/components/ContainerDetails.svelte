<script>
    import { projectData, isRunningState } from "../stores/store.js";
    import { onMount } from "svelte";
  
    export let title = "Détails du projet";
    let localRunningState = {}; // Etat local pour chaque conteneur
  
    // Fonction pour récupérer l'état des conteneurs
    async function fetchContainerStatus() {
      if (!$projectData || !$projectData.project_name) {
        console.error("projectData est nul ou non défini.");
        return;
      }
  
      try {
        const response = await fetch(
          `http://localhost:3000/containers/${$projectData.project_name}/status`
        );
        if (response.ok) {
          const statusData = await response.json();
          
          // Mise à jour des états de chaque conteneur
          const updatedState = {};
          statusData.forEach((container) => {
            updatedState[container.name] = container.status === "running";
          });
          isRunningState.set(updatedState);
          localRunningState = updatedState;
  
          console.log("Conteneur status mis à jour:", localRunningState);
        } else {
          console.error("Erreur lors de la récupération de l'état des conteneurs");
        }
      } catch (error) {
        console.error("Erreur lors de la requête de l'état :", error);
      }
    }
  
    // Fonction pour démarrer un conteneur
    async function startCompose(projectName, containerName) {
      try {
        const response = await fetch(
          `http://localhost:3000/containers/${projectName}/start`,
          { method: "POST" }
        );
        if (response.ok) {
          localRunningState[containerName] = true;
          isRunningState.update((state) => ({ ...state, [containerName]: true }));
          console.log(`${containerName} démarré avec succès.`);
        } else {
          console.error("Erreur lors du démarrage du conteneur");
        }
      } catch (error) {
        console.error("Erreur lors de la requête de démarrage :", error);
      }
    }
  
    // Fonction pour arrêter un conteneur
    async function stopContainer(projectName, containerName) {
      try {
        const response = await fetch(
          `http://localhost:3000/containers/${projectName}/containers/${containerName}/stop`,
          { method: "POST" }
        );
        if (response.ok) {
          localRunningState[containerName] = false;
          isRunningState.update((state) => ({ ...state, [containerName]: false }));
          console.log(`${containerName} arrêté avec succès.`);
          await fetchContainerStatus(); // Rafraîchit l'état
        } else {
          console.error("Erreur lors de l'arrêt du conteneur");
        }
      } catch (error) {
        console.error("Erreur lors de la requête d'arrêt :", error);
      }
    }
  
    // Appel initial pour mettre à jour l'état des conteneurs
    onMount(() => {
      fetchContainerStatus();
    });
  
    // Mise à jour à chaque changement de `projectData`
    $: if ($projectData) {
      fetchContainerStatus();
    }
  </script>
  
  <div class="container-details">
    <div class="container-title">{title}</div>
    <div class="container-content">
      {#if $projectData}
        <h1>Nom du projet sélectionné : {$projectData.project_name}</h1>
        <h2>Description : {$projectData.description}</h2>
        <h3>Conteneurs associés :</h3>
        <ul class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {#each $projectData.containers as container}
            <li class="max-w-sm rounded overflow-hidden shadow-lg bg-white p-6">
              <h3 class="font-bold text-xl mb-2 text-blue-600">
                Nom : {container.name}
              </h3>
  
              <p class="text-gray-700">
                <strong>Image :</strong> {container.image}
              </p>
  
              <p class="text-gray-700">
                <strong>État :</strong>
                <span
                  class={localRunningState[container.name]
                    ? "text-green-500"
                    : "text-red-500"}
                >
                  {localRunningState[container.name] ? "running" : "stopped"}
                </span>
              </p>
              <p class="text-gray-700">
                <strong>Networks :</strong> {container.networks}
              </p>
  
              <p class="text-gray-700">
                <strong>Ports :</strong> 
                {container.ports.length > 0 
                  ? container.ports.map((port) => `${port}`).join(", ")
                  : "Aucun port exposé"}
              </p>
  
              {#if localRunningState[container.name]}
                <!-- Bouton "Arrêter" si le conteneur est en cours d'exécution -->
                <button
                  class="start-button start-button-red mt-4"
                  on:click={() =>
                    stopContainer($projectData.project_name, container.name)}
                >
                  Arrêter
                </button>
              {:else}
                <!-- Bouton "Démarrer" si le conteneur est arrêté -->
                <button
                  class="start-button start-button-green mt-4"
                  on:click={() =>
                    startCompose($projectData.project_name, container.name)}
                >
                  Démarrer
                </button>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <p>Chargement des données du projet...</p>
      {/if}
    </div>
  </div>
  
  <style>
    .container-details {
      width: 100%;
      height: 80vh;
      padding: 20px;
      background-color: #f9f9f9;
      overflow-y: auto;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
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
      transition: background-color 0.3s ease;
    }
    .start-button-green {
      background-color: green;
    }
    .start-button-red {
      background-color: red;
    }
  </style>
  