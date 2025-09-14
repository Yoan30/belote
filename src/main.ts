// Entry point for Belote game
import { registerSW } from './pwa/registerSW.js';
import { GameApplication } from './ui/Application.js';

console.log('Belote Game v1.0.0');

// Main application will be implemented in subsequent commits
export const GAME_VERSION = '1.0.0';

// Register service worker for PWA
registerSW();

// Initialize and start the game application
let gameApp: GameApplication;

async function initGame() {
  try {
    gameApp = new GameApplication();
    await gameApp.initialize();
  } catch (error) {
    console.error('Failed to initialize game:', error);
    
    // Show error message
    const loading = document.getElementById('loading');
    if (loading) {
      loading.innerHTML = `
        <div style="color: #ff6b6b; text-align: center;">
          <h3>Erreur de chargement</h3>
          <p>Impossible de charger le jeu. Veuillez rafraîchir la page.</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Rafraîchir
          </button>
        </div>
      `;
    }
  }
}

// Start the application
initGame();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (gameApp) {
    gameApp.destroy();
  }
});

