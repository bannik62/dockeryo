<!-- Navbar.svelte -->
<script>
    import { activeModule } from '../stores/store.js';

    // Fonction pour définir le module actif sur "projects" quand on clique sur le bouton
    function showProjects() {
        activeModule.set('projects');
    }
</script>

<nav class="navbar">
    <div class="logo">
        <a href="/">Mon Portfolio Docker</a>
    </div>
    <div class="nav-links">
        <a on:click={showProjects}>Projets</a>
        <a href="/about">À Propos</a>
        <a href="/contact">Contact</a>
    </div>
</nav>

<style>
    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: #333;
        color: white;
    }
    .navbar a {
        color: white;
        text-decoration: none;
        margin: 0 1rem;
        cursor: pointer;
    }
</style>
