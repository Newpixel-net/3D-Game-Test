/**
 * Wave Manager - Manages enemy waves, spawning, and wave progression
 */

import * as THREE from 'three';
import { GAME_CONFIG } from '../config/game.config.js';
import { Enemy } from '../entities/Enemy.js';
import { Collectible } from '../entities/Collectible.js';

export class WaveManager {
    constructor(game, assetManager) {
        this.game = game;
        this.assetManager = assetManager;

        this.currentWave = 0;
        this.enemiesRemaining = 0;
        this.enemiesSpawned = 0;
        this.waveActive = false;

        this.spawnTimer = 0;
        this.nextSpawnDelay = 0;
    }

    startWave(waveNumber) {
        console.log(`🌊 Starting Wave ${waveNumber}`);

        this.currentWave = waveNumber;
        this.waveActive = true;

        // Update game state
        this.game.stateManager.startWave(waveNumber);

        // Calculate enemies for this wave
        const baseEnemies = GAME_CONFIG.WAVES.ENEMIES_BASE;
        const perWave = GAME_CONFIG.WAVES.ENEMIES_PER_WAVE;
        const multiplier = GAME_CONFIG.WAVES.ENEMIES_MULTIPLIER;

        this.enemiesRemaining = Math.floor(
            baseEnemies + (waveNumber - 1) * perWave * Math.pow(multiplier, (waveNumber - 1) * 0.1)
        );

        this.enemiesSpawned = 0;
        this.spawnTimer = 0;
        this.nextSpawnDelay = this.getRandomSpawnDelay();

        // Play wave start sound
        this.game.audioSystem.playSound('start');
    }

    update(deltaTime) {
        if (!this.waveActive) return;

        // Spawn enemies
        if (this.enemiesSpawned < this.enemiesRemaining) {
            this.spawnTimer += deltaTime;

            if (this.spawnTimer >= this.nextSpawnDelay) {
                this.spawnEnemy();
                this.spawnTimer = 0;
                this.nextSpawnDelay = this.getRandomSpawnDelay();
            }
        }

        // Check if wave is complete
        if (this.enemiesSpawned >= this.enemiesRemaining && this.game.enemies.length === 0) {
            this.completeWave();
        }

        // Update combo timer
        this.game.stateManager.updateComboTimer(deltaTime);
    }

    spawnEnemy() {
        const spawnPos = this.getRandomSpawnPosition();
        const enemy = new Enemy(this.game, this.assetManager);

        // Scale enemy stats based on wave
        const healthScale = GAME_CONFIG.ENEMY.HEALTH_SCALE_PER_WAVE * (this.currentWave - 1);
        const speedScale = GAME_CONFIG.ENEMY.SPEED_SCALE * (this.currentWave - 1);

        enemy.initialize(spawnPos);
        enemy.health += healthScale;
        enemy.maxHealth = enemy.health;
        enemy.speed += speedScale;

        // Check for boss wave
        if (this.currentWave % GAME_CONFIG.WAVES.BOSS_INTERVAL === 0 && this.enemiesSpawned === 0) {
            enemy.health *= GAME_CONFIG.WAVES.BOSS_HEALTH_MULTIPLIER;
            enemy.maxHealth = enemy.health;
            enemy.damage *= GAME_CONFIG.WAVES.BOSS_DAMAGE_MULTIPLIER;
            enemy.scale = 1.5;
            enemy.mesh.scale.setScalar(enemy.scale);
        }

        this.game.enemies.push(enemy);
        this.game.sceneManager.scene.add(enemy.mesh);

        this.enemiesSpawned++;

        console.log(`👾 Enemy spawned (${this.enemiesSpawned}/${this.enemiesRemaining})`);
    }

    getRandomSpawnPosition() {
        const angle = Math.random() * Math.PI * 2;
        const distance = GAME_CONFIG.WAVES.SPAWN_DISTANCE;

        const playerPos = this.game.player.mesh.position;

        return new THREE.Vector3(
            playerPos.x + Math.cos(angle) * distance,
            0,
            playerPos.z + Math.sin(angle) * distance
        );
    }

    getRandomSpawnDelay() {
        const min = GAME_CONFIG.WAVES.SPAWN_DELAY_MIN;
        const max = GAME_CONFIG.WAVES.SPAWN_DELAY_MAX;

        // Spawn faster in later waves
        const scaleFactor = Math.max(0.3, 1 - (this.currentWave * 0.05));

        return (min + Math.random() * (max - min)) * scaleFactor;
    }

    completeWave() {
        console.log(`✅ Wave ${this.currentWave} complete!`);

        this.waveActive = false;
        this.game.stateManager.completeWave();

        // Notify game
        this.game.onWaveComplete(this.currentWave);
    }

    spawnCollectiblesFromEnemy(enemy) {
        const position = enemy.mesh.position.clone();

        // Coin drop
        if (Math.random() < GAME_CONFIG.COLLECTIBLES.COIN.DROP_CHANCE) {
            this.spawnCollectible('coin', position);
        }

        // Health kit drop
        if (Math.random() < GAME_CONFIG.COLLECTIBLES.HEALTH_KIT.DROP_CHANCE) {
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            );
            this.spawnCollectible('health', position.clone().add(offset));
        }

        // Ammo drop
        if (Math.random() < GAME_CONFIG.COLLECTIBLES.AMMO_CRATE.DROP_CHANCE) {
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            );
            this.spawnCollectible('ammo', position.clone().add(offset));
        }
    }

    spawnCollectible(type, position) {
        const collectible = new Collectible(this.game, this.assetManager, type);
        collectible.initialize(position);

        this.game.collectibles.push(collectible);
        this.game.sceneManager.scene.add(collectible.mesh);
    }
}
