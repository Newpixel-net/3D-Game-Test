/**
 * UI Manager - Handles all UI updates and menu management
 */

export class UIManager {
    constructor() {
        // Get all UI elements
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loadingBar = document.getElementById('loadingBar');
        this.loadingText = document.getElementById('loadingText');

        this.hud = document.getElementById('hud');
        this.waveIndicator = document.getElementById('waveIndicator');

        // HUD elements
        this.healthValue = document.getElementById('healthValue');
        this.healthFill = document.getElementById('healthFill');
        this.ammoValue = document.getElementById('ammoValue');
        this.ammoFill = document.getElementById('ammoFill');
        this.scoreValue = document.getElementById('scoreValue');
        this.killsValue = document.getElementById('killsValue');
        this.comboValue = document.getElementById('comboValue');
        this.waveNumber = document.getElementById('waveNumber');

        // Menus
        this.mainMenu = document.getElementById('mainMenu');
        this.pauseMenu = document.getElementById('pauseMenu');
        this.gameOverMenu = document.getElementById('gameOverMenu');
        this.waveCompleteMenu = document.getElementById('waveCompleteMenu');

        // Game over stats
        this.finalScore = document.getElementById('finalScore');
        this.finalWave = document.getElementById('finalWave');
        this.finalKills = document.getElementById('finalKills');

        // Wave complete stats
        this.coinsEarned = document.getElementById('coinsEarned');
        this.totalCoins = document.getElementById('totalCoins');

        // Score popup container
        this.scorePopups = [];
    }

    // Loading screen
    showLoadingScreen() {
        this.loadingScreen?.classList.remove('hidden');
    }

    hideLoadingScreen() {
        setTimeout(() => {
            this.loadingScreen?.classList.add('hidden');
        }, 500);
    }

    updateLoadingProgress(percent) {
        if (this.loadingBar) {
            this.loadingBar.style.width = `${percent}%`;
        }
        if (this.loadingText) {
            this.loadingText.textContent = `Loading... ${Math.floor(percent)}%`;
        }
    }

    // HUD
    showHUD() {
        this.hud?.classList.remove('hidden');
        this.waveIndicator?.classList.remove('hidden');
    }

    hideHUD() {
        this.hud?.classList.add('hidden');
        this.waveIndicator?.classList.add('hidden');
    }

    updateHUD(gameState) {
        // Update score and kills
        if (this.scoreValue) {
            this.scoreValue.textContent = gameState.score.toLocaleString();
        }

        if (this.killsValue) {
            this.killsValue.textContent = gameState.kills;
        }

        // Update combo
        if (this.comboValue) {
            const comboText = `x${gameState.comboMultiplier.toFixed(1)}`;
            this.comboValue.textContent = comboText;

            // Color based on combo level
            if (gameState.comboMultiplier >= 5) {
                this.comboValue.style.color = '#ff0000'; // Red for high combo
            } else if (gameState.comboMultiplier >= 3) {
                this.comboValue.style.color = '#ff9900'; // Orange
            } else if (gameState.comboMultiplier > 1) {
                this.comboValue.style.color = '#ffd700'; // Gold
            } else {
                this.comboValue.style.color = 'white'; // Default
            }
        }

        // Update wave number
        if (this.waveNumber) {
            this.waveNumber.textContent = gameState.currentWave;
        }
    }

    updateHealth(current, max) {
        if (this.healthValue) {
            this.healthValue.textContent = Math.max(0, Math.floor(current));
        }

        if (this.healthFill) {
            const percent = Math.max(0, Math.min(100, (current / max) * 100));
            this.healthFill.style.width = `${percent}%`;

            // Color based on health level
            if (percent < 25) {
                this.healthFill.style.background = 'linear-gradient(90deg, #ff0000 0%, #ff3333 100%)';
            } else if (percent < 50) {
                this.healthFill.style.background = 'linear-gradient(90deg, #ff4444 0%, #ff6666 100%)';
            } else {
                this.healthFill.style.background = 'linear-gradient(90deg, #ff4444 0%, #ff6b6b 100%)';
            }
        }
    }

    updateAmmo(current, max, magazineSize) {
        if (this.ammoValue) {
            this.ammoValue.textContent = `${current}/${max}`;
        }

        if (this.ammoFill) {
            const percent = magazineSize > 0 ? (current / magazineSize) * 100 : 0;
            this.ammoFill.style.width = `${percent}%`;

            // Color warning when low
            if (percent < 25) {
                this.ammoFill.style.background = 'linear-gradient(90deg, #ff9900 0%, #ffaa00 100%)';
            } else {
                this.ammoFill.style.background = 'linear-gradient(90deg, #ffd700 0%, #ffed4e 100%)';
            }
        }
    }

    // Score popups (floating numbers)
    showScorePopup(score, position) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${Math.floor(score)}`;

        // Position based on 3D world position (simplified - would need proper screen projection)
        popup.style.left = `${window.innerWidth / 2 + Math.random() * 100 - 50}px`;
        popup.style.top = `${window.innerHeight / 2 + Math.random() * 100 - 50}px`;

        document.getElementById('ui').appendChild(popup);

        // Remove after animation
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }

    // Menus
    showMainMenu() {
        this.mainMenu?.classList.remove('hidden');
    }

    hideMainMenu() {
        this.mainMenu?.classList.add('hidden');
    }

    showPauseMenu() {
        this.pauseMenu?.classList.remove('hidden');
    }

    hidePauseMenu() {
        this.pauseMenu?.classList.add('hidden');
    }

    showGameOver(stats) {
        if (this.finalScore) {
            this.finalScore.textContent = stats.score.toLocaleString();
        }
        if (this.finalWave) {
            this.finalWave.textContent = stats.currentWave;
        }
        if (this.finalKills) {
            this.finalKills.textContent = stats.kills;
        }

        this.gameOverMenu?.classList.remove('hidden');
    }

    hideGameOverMenu() {
        this.gameOverMenu?.classList.add('hidden');
    }

    showWaveComplete(data) {
        if (this.coinsEarned) {
            this.coinsEarned.textContent = data.coinsEarned;
        }
        if (this.totalCoins) {
            this.totalCoins.textContent = data.totalCoins;
        }

        this.waveCompleteMenu?.classList.remove('hidden');
    }

    hideWaveCompleteMenu() {
        this.waveCompleteMenu?.classList.add('hidden');
    }

    // Notifications
    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // TODO: Implement visual notification system
    }

    showAchievement(achievement) {
        this.showNotification(`🏆 Achievement Unlocked: ${achievement.name}`, 'achievement');
    }
}
