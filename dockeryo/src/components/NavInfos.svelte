<!-- NavInfos.svelte -->
<script>
    import { activeModule } from '../stores/store.js';
    import ProjectList from './ProjectList.svelte';
</script>

<nav class="navbar-info">
    <div class="content-info">
        {#if $activeModule === 'projects'}
            <ProjectList />
        {:else}
            <p>Sélectionnez un module depuis la barre de navigation pour l'afficher ici.</p>
        {/if}
    </div>
</nav>

<style>
    .navbar-info {
        position: relative;
        height: 150px;
        min-height: 60px;
        max-height: 250px;
        background-color: #585353;
        color: white;
        overflow-y: hidden;
        overflow-x: auto;
    }
    .navbar-info a {
        color: white;
        text-decoration: none;
    }
    .content-info {
        display: flex;
        justify-content: space-between;
        flex-wrap: nowrap;
        position: absolute;
        width: 100%;
        height: 100%;
    }
</style>
