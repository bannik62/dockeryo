<script>
    export let projectName; // Recevoir le `projectName` en prop
    let logs = ["Démarrage du build pour " + projectName + "..."]; // Utilisation de `projectName`
  
    // Exemple de fonction pour ajouter un log spécifique
    function addLog(message) {
        logs = [...logs, message];
    }
  </script>
  
  <div class="terminal">
    {#each logs as log}
      <div>{log}</div>
    {/each}
  </div>
  
  <style>
    .terminal {
      background-color: black;
      color: white;
      width: 100vw;
      height: 10vh;
      overflow-y: scroll;
      padding: 10px;
    }
  </style>
   