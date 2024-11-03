// store.js
import { writable } from 'svelte/store';

export const activeModule = writable(null); // Initialise avec un module nul
export const ProjectName = writable("");
export const infoContainer = writable([]); // Stocke les informations des conteneurs pour le projet sélectionné
export const projectData = writable(null); // Initialise avec `null` ou un objet vide si besoin
export const isRunningState = writable({}); // Statut de chaque conteneur, clé étant le nom du conteneur

