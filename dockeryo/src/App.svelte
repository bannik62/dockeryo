<script>
  import ContainerDetails from './components/ContainerDetails.svelte';
  import InfoTerminal from './components/InfoTerminal.svelte';
  import Navbar from './components/Navbar.svelte';
  import NavInfos from './components/NavInfos.svelte';
  import { projectData } from './stores/store.js';

  // Variable pour accéder à `projectData`
  let currentProjectData;
  $: currentProjectData = $projectData;

  // Extraire `projectName` pour le passer à `InfoTerminal`
  let projectName;
  $: projectName = currentProjectData ? currentProjectData.project_name : null;
</script>

<Navbar />
<NavInfos />

<main>
  <ContainerDetails />
  
  <!-- Vérifier que `projectName` existe avant d'afficher `InfoTerminal` -->
  {#if projectName}
    <InfoTerminal {projectName} />
  {/if}
</main>
