<script>
    import { onMount } from "svelte";
    import { projectData } from "../stores/store.js"; // Import du store projectData

    let projects = [];

    onMount(async () => {
        try {
            const response = await fetch("http://localhost:3000/projects");
            
            if (!response.ok) throw new Error("Erreur de récupération des projets");

            // Récupère et déstructure chaque projet pour ne garder que `name` et `description`
            const data = await response.json();
            console.log("rep ", data);

            projects = data.map(({ name, description }) => ({ name, description }));
            
        } catch (error) {
            console.error("Erreur lors du chargement des projets :", error);
        }
    });

    let activeTooltip = null;

    function showTooltip(index) {
        activeTooltip = index;
    }

    function hideTooltip() {
        activeTooltip = null;
    }

    async function handleClick(project) {
        // Effectue la requête pour récupérer les conteneurs associés au projet
        try {
            const response = await fetch(`http://localhost:3000/containers/${project.name}/config`);

            if (!response.ok) throw new Error("Erreur de récupération des conteneurs");

            const projectInfo = await response.json();
            console.log("Conteneurs récupérés :", projectInfo);

            // Stocke les informations du projet dans le store projectData
            projectData.set({
                name: project.name,
                description: project.description,
                ...projectInfo
            });

        } catch (error) {
            console.error("Erreur lors de la récupération des conteneurs :", error);
        }
    }
</script>

<div>
    {#each projects as project, index}
        <div class="project" on:mouseover={() => showTooltip(index)} on:mouseout={hideTooltip} on:click={() => handleClick(project)}>
            <img src="/src/assets/docker.png" alt="Project Image" />
            <div>{project.name}</div>
            {#if activeTooltip === index}
                <div class="tooltip">{project.description}</div>
            {/if}
        </div>
    {/each}
</div>

<style>
    .project {
        display: inline-block;
        margin: 10px;
        text-align: center;
        position: relative;
        cursor: pointer;
    }
    .project img {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
    }
    .tooltip {
        display: inline-block;
        padding: 5px;
        background-color: rgba(0, 0, 0, 0.7);
        color: #fff;
        border-radius: 5px;
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        z-index: 1;
    }
</style>
