/**
 * Main Entry Point - Warzone - Tactical Survival Shooter
 */

import { Game } from './core/Game.js';
import { UIManager } from './managers/UIManager.js';
import { AssetManager } from './managers/AssetManager.js';
import { VERSION_CONFIG } from './config/version.config.js';

let game = null;
let uiManager = null;

// Initialize the game
async function init() {
    try {
        console.log(`🎮 Initializing ${VERSION_CONFIG.GAME_NAME} ${VERSION_CONFIG.DISPLAY_VERSION}...`);
        console.log(`📦 Build: ${VERSION_CONFIG.FULL_VERSION} (${VERSION_CONFIG.BUILD_DATE})`);

        // Create UI Manager
        uiManager = new UIManager();
        uiManager.showLoadingScreen();

        // Inject version info into UI
        const versionDisplay = document.getElementById('versionDisplay');
        if (versionDisplay) {
            versionDisplay.textContent = VERSION_CONFIG.DISPLAY_VERSION;
        }

        // Load all assets
        const assetManager = new AssetManager();

        await assetManager.loadAllAssets((progress) => {
            uiManager.updateLoadingProgress(progress);
        });

        console.log('✅ Assets loaded successfully');

        // Create game instance
        game = new Game(assetManager, uiManager);
        await game.initialize();

        console.log('✅ Game initialized');

        // Hide loading screen and show main menu
        uiManager.hideLoadingScreen();
        uiManager.showMainMenu();

        // Setup menu event listeners
        setupMenuListeners();

        console.log(`🎮 ${VERSION_CONFIG.GAME_NAME} ready! Press START to play`);

    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        alert('Failed to load game. Please refresh the page.');
    }
}

// Setup all menu button listeners
function setupMenuListeners() {
    // Main Menu
    document.getElementById('startButton')?.addEventListener('click', () => {
        uiManager.hideMainMenu();
        game.start();
    });

    document.getElementById('settingsButton')?.addEventListener('click', () => {
        console.log('Settings clicked - TODO: Implement settings menu');
    });

    document.getElementById('achievementsButton')?.addEventListener('click', () => {
        console.log('Achievements clicked - TODO: Implement achievements menu');
    });

    // Pause Menu
    document.getElementById('resumeButton')?.addEventListener('click', () => {
        game.resume();
        uiManager.hidePauseMenu();
    });

    document.getElementById('restartButton')?.addEventListener('click', () => {
        uiManager.hidePauseMenu();
        game.restart();
    });

    document.getElementById('mainMenuButton')?.addEventListener('click', () => {
        uiManager.hidePauseMenu();
        game.stop();
        uiManager.showMainMenu();
    });

    // Game Over Menu
    document.getElementById('retryButton')?.addEventListener('click', () => {
        uiManager.hideGameOverMenu();
        game.restart();
    });

    document.getElementById('menuButton')?.addEventListener('click', () => {
        uiManager.hideGameOverMenu();
        game.stop();
        uiManager.showMainMenu();
    });

    // Wave Complete Menu
    document.getElementById('upgradeButton')?.addEventListener('click', () => {
        console.log('Upgrade shop - TODO: Implement upgrade system');
        // For now, just continue to next wave
        uiManager.hideWaveCompleteMenu();
        game.startNextWave();
    });

    document.getElementById('nextWaveButton')?.addEventListener('click', () => {
        uiManager.hideWaveCompleteMenu();
        game.startNextWave();
    });

    // Pause on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && game && game.isRunning) {
            if (game.isPaused) {
                game.resume();
                uiManager.hidePauseMenu();
            } else {
                game.pause();
                uiManager.showPauseMenu();
            }
        }
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    if (game) {
        game.onWindowResize();
    }
});

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (game && game.isRunning) {
        if (document.hidden) {
            game.pause();
            uiManager.showPauseMenu();
        }
    }
});

// Prevent context menu on canvas
document.addEventListener('contextmenu', (e) => {
    if (e.target.id === 'gameCanvas') {
        e.preventDefault();
    }
});

// Start the game when page loads
window.addEventListener('load', init);

// Export for debugging
window.game = () => game;
