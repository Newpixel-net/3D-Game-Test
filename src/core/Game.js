/**
 * Core Game Class - Main game loop and orchestration
 */

import * as THREE from 'three';
import { GAME_CONFIG } from '../config/game.config.js';
import { SceneManager } from './SceneManager.js';
import { InputManager } from './InputManager.js';
import { StateManager } from './StateManager.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { WaveManager } from '../managers/WaveManager.js';
import { Player } from '../entities/Player.js';

export class Game {
    constructor(assetManager, uiManager) {
        this.assetManager = assetManager;
        this.uiManager = uiManager;

        // Core systems
        this.sceneManager = null;
        this.inputManager = null;
        this.stateManager = null;
        this.physicsSystem = null;
        this.audioSystem = null;
        this.waveManager = null;

        // Game entities
        this.player = null;
        this.enemies = [];
        this.collectibles = [];
        this.projectiles = [];

        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.clock = new THREE.Clock();
        this.deltaTime = 0;

        // Performance monitoring
        this.fps = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;

        // Animation frame ID
        this.animationFrameId = null;
    }

    async initialize() {
        console.log('🎮 Initializing game systems...');

        // Initialize scene and rendering
        this.sceneManager = new SceneManager();
        this.sceneManager.initialize();

        // Initialize input handling
        this.inputManager = new InputManager();
        this.inputManager.initialize();

        // Initialize game state
        this.stateManager = new StateManager();

        // Initialize physics
        this.physicsSystem = new PhysicsSystem();

        // Initialize audio
        this.audioSystem = new AudioSystem(this.assetManager);
        this.audioSystem.initialize();

        // Initialize wave manager
        this.waveManager = new WaveManager(this, this.assetManager);

        // Create arena
        this.sceneManager.createArena(this.assetManager);

        // Create player
        this.player = new Player(this, this.assetManager);
        await this.player.initialize();
        this.sceneManager.scene.add(this.player.mesh);

        // Setup camera to follow player
        this.sceneManager.setPlayerTarget(this.player.mesh);

        console.log('✅ Game systems initialized');
    }

    start() {
        console.log('🎮 Starting game...');

        this.isRunning = true;
        this.isPaused = false;
        this.clock.start();

        // Reset game state
        this.stateManager.resetGame();
        this.player.reset();
        this.clearAllEntities();

        // Request pointer lock for mouse look (modern TPS controls)
        this.inputManager.requestPointerLock();

        // Show HUD
        this.uiManager.showHUD();
        this.uiManager.updateHUD(this.stateManager.getGameState());

        // Start background music
        this.audioSystem.playMusic('game_music');

        // Start first wave
        this.waveManager.startWave(1);

        // Start game loop
        this.gameLoop();
    }

    stop() {
        console.log('🛑 Stopping game...');

        this.isRunning = false;
        this.isPaused = false;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Stop music
        this.audioSystem.stopMusic();

        // Hide HUD
        this.uiManager.hideHUD();

        // Clear all entities
        this.clearAllEntities();
    }

    pause() {
        if (!this.isRunning) return;

        console.log('⏸️ Game paused');
        this.isPaused = true;
        this.clock.stop();

        // Pause audio
        this.audioSystem.pauseMusic();
    }

    resume() {
        if (!this.isRunning || !this.isPaused) return;

        console.log('▶️ Game resumed');
        this.isPaused = false;
        this.clock.start();

        // Resume audio
        this.audioSystem.resumeMusic();
    }

    restart() {
        console.log('🔄 Restarting game...');
        this.stop();
        this.start();
    }

    gameLoop() {
        if (!this.isRunning) return;

        // Request next frame
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());

        // Skip update if paused, but still render
        if (!this.isPaused) {
            this.deltaTime = this.clock.getDelta();
            this.update(this.deltaTime);
        }

        this.render();
        this.updateFPS();
    }

    update(deltaTime) {
        // Cap delta time to prevent huge jumps
        deltaTime = Math.min(deltaTime, 0.1);

        // Update physics
        this.physicsSystem.update(deltaTime);

        // Update player
        this.player.update(deltaTime, this.inputManager);

        // Update wave manager
        this.waveManager.update(deltaTime);

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime, this.player.mesh.position);

            // Check if enemy is dead
            if (enemy.isDead) {
                this.removeEnemy(i);
            }
        }

        // Update collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            collectible.update(deltaTime, this.player.mesh.position);

            // Check if collected or expired
            if (collectible.isCollected || collectible.isExpired) {
                this.removeCollectible(i);
            }
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);

            if (projectile.isExpired) {
                this.removeProjectile(i);
            }
        }

        // Update UI
        this.uiManager.updateHUD(this.stateManager.getGameState());

        // Check game over
        if (this.player.health <= 0) {
            this.gameOver();
        }
    }

    render() {
        this.sceneManager.render();
    }

    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();

        if (currentTime >= this.fpsUpdateTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.fpsUpdateTime));
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;

            if (GAME_CONFIG.SHOW_FPS) {
                // Update FPS display if needed
                // console.log('FPS:', this.fps);
            }
        }
    }

    onWindowResize() {
        this.sceneManager.onWindowResize();
    }

    clearAllEntities() {
        // Clear enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.removeEnemy(i);
        }

        // Clear collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            this.removeCollectible(i);
        }

        // Clear projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.removeProjectile(i);
        }
    }

    removeEnemy(index) {
        const enemy = this.enemies[index];
        if (enemy.mesh) {
            this.sceneManager.scene.remove(enemy.mesh);
        }
        enemy.dispose();
        this.enemies.splice(index, 1);
    }

    removeCollectible(index) {
        const collectible = this.collectibles[index];
        if (collectible.mesh) {
            this.sceneManager.scene.remove(collectible.mesh);
        }
        collectible.dispose();
        this.collectibles.splice(index, 1);
    }

    removeProjectile(index) {
        const projectile = this.projectiles[index];
        if (projectile.mesh) {
            this.sceneManager.scene.remove(projectile.mesh);
        }
        projectile.dispose();
        this.projectiles.splice(index, 1);
    }

    gameOver() {
        console.log('💀 Game Over!');

        this.isRunning = false;
        this.audioSystem.stopMusic();
        this.audioSystem.playSound('scream_1');

        // Show game over menu with final stats
        const stats = this.stateManager.getGameState();
        this.uiManager.showGameOver(stats);
    }

    startNextWave() {
        console.log('🌊 Starting next wave...');
        const nextWave = this.stateManager.currentWave + 1;
        this.waveManager.startWave(nextWave);
    }

    onEnemyKilled(enemy) {
        // Update stats
        this.stateManager.addKill();

        // Add score with combo multiplier
        const score = GAME_CONFIG.SCORING.KILL_BASE_SCORE * this.stateManager.getComboMultiplier();
        this.stateManager.addScore(Math.floor(score));

        // Show score popup
        this.uiManager.showScorePopup(score, enemy.mesh.position);

        // Spawn collectibles
        this.waveManager.spawnCollectiblesFromEnemy(enemy);

        // Play death sound
        const randomScream = 'scream_' + Math.ceil(Math.random() * 3);
        this.audioSystem.playSound(randomScream, enemy.mesh.position);
    }

    onWaveComplete(waveNumber) {
        console.log('✅ Wave', waveNumber, 'complete!');

        // Calculate wave rewards
        const coinsEarned = waveNumber * 50;
        this.stateManager.addCoins(coinsEarned);

        // Show wave complete menu
        this.uiManager.showWaveComplete({
            waveNumber,
            coinsEarned,
            totalCoins: this.stateManager.coins
        });

        // Play applause sound
        this.audioSystem.playSound('applause');
    }
}
