/**
 * State Manager - Manages game state, score, waves, combos, and progression
 */

import { GAME_CONFIG } from '../config/game.config.js';

export class StateManager {
    constructor() {
        this.resetGame();
    }

    resetGame() {
        // Core stats
        this.score = 0;
        this.kills = 0;
        this.deaths = 0;
        this.currentWave = 0;

        // Currency
        this.coins = 0;
        this.totalCoinsEarned = 0;

        // Combat stats
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.headshots = 0;

        // Combo system
        this.currentCombo = 0;
        this.maxCombo = 0;
        this.comboTimer = 0;
        this.comboMultiplier = 1;

        // Wave stats
        this.waveStartTime = 0;
        this.waveDamageTaken = 0;
        this.perfectWaves = 0;

        // Upgrades (persistent across runs - could be saved to localStorage)
        this.upgradeLevels = {
            HEALTH: 0,
            DAMAGE: 0,
            FIRE_RATE: 0,
            AMMO_CAPACITY: 0,
            MOVEMENT_SPEED: 0,
            HEALTH_REGEN: 0,
        };

        // Achievements (persistent)
        this.achievements = this.loadAchievements();

        // Session stats
        this.sessionStartTime = Date.now();
        this.totalPlayTime = 0;
    }

    // Score management
    addScore(points) {
        this.score += points;
        this.checkAchievements();
    }

    // Kill tracking
    addKill() {
        this.kills++;
        this.incrementCombo();
        this.checkAchievements();
    }

    addHeadshot() {
        this.headshots++;
        this.checkAchievements();
    }

    // Combo system
    incrementCombo() {
        this.currentCombo++;
        if (this.currentCombo > this.maxCombo) {
            this.maxCombo = this.currentCombo;
        }

        // Reset combo timer
        this.comboTimer = GAME_CONFIG.SCORING.COMBO.TIMEOUT;

        // Calculate multiplier
        this.updateComboMultiplier();
    }

    updateComboMultiplier() {
        const comboConfig = GAME_CONFIG.SCORING.COMBO;
        const index = Math.min(this.currentCombo - 1, comboConfig.MULTIPLIERS.length - 1);
        this.comboMultiplier = comboConfig.MULTIPLIERS[Math.max(0, index)];
    }

    updateComboTimer(deltaTime) {
        if (this.currentCombo > 0) {
            this.comboTimer -= deltaTime;

            if (this.comboTimer <= 0) {
                // Combo broken
                this.currentCombo = 0;
                this.comboMultiplier = 1;
            }
        }
    }

    getComboMultiplier() {
        return this.comboMultiplier;
    }

    // Coin management
    addCoins(amount) {
        this.coins += amount;
        this.totalCoinsEarned += amount;
        this.checkAchievements();
    }

    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            return true;
        }
        return false;
    }

    // Wave management
    startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.waveStartTime = Date.now();
        this.waveDamageTaken = 0;
    }

    completeWave() {
        const waveTime = (Date.now() - this.waveStartTime) / 1000;

        // Check for perfect wave
        if (this.waveDamageTaken === 0 && this.currentWave > 0) {
            this.perfectWaves++;
            this.addScore(GAME_CONFIG.SCORING.PERFECT_WAVE_BONUS);
        }

        // Speed bonus
        if (waveTime < GAME_CONFIG.SCORING.SPEED_BONUS_THRESHOLD) {
            this.addScore(GAME_CONFIG.SCORING.SPEED_BONUS);
        }

        // Wave completion bonus
        const bonus = Math.floor(
            GAME_CONFIG.SCORING.WAVE_COMPLETE_BONUS *
            Math.pow(GAME_CONFIG.SCORING.WAVE_BONUS_MULTIPLIER, this.currentWave - 1)
        );
        this.addScore(bonus);

        this.checkAchievements();
    }

    recordDamage(amount) {
        this.waveDamageTaken += amount;
    }

    // Combat stats
    recordShot(hit = false) {
        this.shotsFired++;
        if (hit) {
            this.shotsHit++;
        }
    }

    getAccuracy() {
        if (this.shotsFired === 0) return 0;
        return this.shotsHit / this.shotsFired;
    }

    // Upgrades
    getUpgradeCost(upgradeType) {
        const config = GAME_CONFIG.UPGRADES[upgradeType];
        const currentLevel = this.upgradeLevels[upgradeType];

        if (currentLevel >= config.maxLevel) {
            return -1; // Max level reached
        }

        return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
    }

    purchaseUpgrade(upgradeType) {
        const cost = this.getUpgradeCost(upgradeType);

        if (cost === -1) {
            return false; // Max level
        }

        if (this.spendCoins(cost)) {
            this.upgradeLevels[upgradeType]++;
            this.saveUpgrades();
            return true;
        }

        return false;
    }

    getUpgradeLevel(upgradeType) {
        return this.upgradeLevels[upgradeType];
    }

    getUpgradeBonus(upgradeType) {
        const config = GAME_CONFIG.UPGRADES[upgradeType];
        const level = this.upgradeLevels[upgradeType];
        return config.bonusPerLevel * level;
    }

    // Achievements
    checkAchievements() {
        const config = GAME_CONFIG.ACHIEVEMENTS;

        for (const [key, achievement] of Object.entries(config)) {
            if (this.achievements[key]) continue; // Already unlocked

            let unlocked = true;

            if (achievement.condition.kills !== undefined) {
                unlocked = unlocked && this.kills >= achievement.condition.kills;
            }
            if (achievement.condition.waves !== undefined) {
                unlocked = unlocked && this.currentWave >= achievement.condition.waves;
            }
            if (achievement.condition.headshots !== undefined) {
                unlocked = unlocked && this.headshots >= achievement.condition.headshots;
            }
            if (achievement.condition.maxCombo !== undefined) {
                unlocked = unlocked && this.maxCombo >= achievement.condition.maxCombo;
            }
            if (achievement.condition.totalScore !== undefined) {
                unlocked = unlocked && this.score >= achievement.condition.totalScore;
            }
            if (achievement.condition.coins !== undefined) {
                unlocked = unlocked && this.totalCoinsEarned >= achievement.condition.coins;
            }
            if (achievement.condition.perfectWaves !== undefined) {
                unlocked = unlocked && this.perfectWaves >= achievement.condition.perfectWaves;
            }
            if (achievement.condition.accuracy !== undefined) {
                unlocked = unlocked && this.getAccuracy() >= achievement.condition.accuracy;
            }

            if (unlocked) {
                this.unlockAchievement(key, achievement);
            }
        }
    }

    unlockAchievement(key, achievement) {
        this.achievements[key] = true;
        this.saveAchievements();

        console.log('🏆 Achievement Unlocked:', achievement.name);

        // TODO: Show achievement notification
    }

    loadAchievements() {
        try {
            const saved = localStorage.getItem('survival_shooter_achievements');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    saveAchievements() {
        try {
            localStorage.setItem('survival_shooter_achievements', JSON.stringify(this.achievements));
        } catch (e) {
            console.error('Failed to save achievements:', e);
        }
    }

    // Save/Load upgrades
    saveUpgrades() {
        try {
            localStorage.setItem('survival_shooter_upgrades', JSON.stringify(this.upgradeLevels));
        } catch (e) {
            console.error('Failed to save upgrades:', e);
        }
    }

    loadUpgrades() {
        try {
            const saved = localStorage.getItem('survival_shooter_upgrades');
            if (saved) {
                this.upgradeLevels = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load upgrades:', e);
        }
    }

    // High score
    saveHighScore() {
        try {
            const currentHigh = this.getHighScore();
            if (this.score > currentHigh) {
                localStorage.setItem('survival_shooter_highscore', this.score.toString());
            }
        } catch (e) {
            console.error('Failed to save high score:', e);
        }
    }

    getHighScore() {
        try {
            const saved = localStorage.getItem('survival_shooter_highscore');
            return saved ? parseInt(saved) : 0;
        } catch (e) {
            return 0;
        }
    }

    // Get current game state for UI
    getGameState() {
        return {
            score: this.score,
            kills: this.kills,
            currentWave: this.currentWave,
            currentCombo: this.currentCombo,
            comboMultiplier: this.comboMultiplier,
            coins: this.coins,
            accuracy: this.getAccuracy(),
            highScore: this.getHighScore(),
        };
    }
}
