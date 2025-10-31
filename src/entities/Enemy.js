/**
 * Enemy Entity - Enemy AI with pathfinding, attacking, and health
 */

import * as THREE from 'three';
import { GAME_CONFIG } from '../config/game.config.js';

export class Enemy {
    constructor(game, assetManager) {
        this.game = game;
        this.assetManager = assetManager;

        this.mesh = null;
        this.mixer = null;

        // Stats
        this.health = GAME_CONFIG.ENEMY.HEALTH;
        this.maxHealth = GAME_CONFIG.ENEMY.HEALTH;
        this.speed = GAME_CONFIG.ENEMY.SPEED;
        this.damage = GAME_CONFIG.ENEMY.DAMAGE;

        // AI state
        this.state = 'idle'; // idle, chase, attack
        this.target = null;
        this.attackCooldown = 0;

        // Properties
        this.isDead = false;
        this.scale = 1.0;
    }

    initialize(position) {
        // Load enemy model
        const enemyModel = this.assetManager.getModel('enemy');
        if (enemyModel) {
            this.mesh = enemyModel;

            // Setup animations
            if (enemyModel.userData.animations) {
                this.mixer = new THREE.AnimationMixer(enemyModel);
            }
        } else {
            // Fallback: Create a simple cube
            const geometry = new THREE.BoxGeometry(1, 2, 1);
            const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            this.mesh = new THREE.Mesh(geometry, material);
        }

        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // Add health bar (optional visual feedback)
        this.createHealthBar();
    }

    createHealthBar() {
        // Simple sprite-based health bar above enemy
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 8;

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        this.healthBarSprite = new THREE.Sprite(material);
        this.healthBarSprite.scale.set(2, 0.25, 1);
        this.healthBarSprite.position.y = 2.5;

        this.mesh.add(this.healthBarSprite);
        this.updateHealthBar();
    }

    updateHealthBar() {
        if (!this.healthBarSprite) return;

        const canvas = this.healthBarSprite.material.map.image;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffaa00' : '#ff0000';
        ctx.fillRect(0, 0, canvas.width * healthPercent, canvas.height);

        this.healthBarSprite.material.map.needsUpdate = true;
    }

    update(deltaTime, playerPosition) {
        if (this.isDead) return;

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }

        // AI behavior
        this.updateAI(deltaTime, playerPosition);

        // Update animations
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }

        // Health bar always faces camera
        if (this.healthBarSprite) {
            this.healthBarSprite.quaternion.copy(this.game.sceneManager.camera.quaternion);
        }
    }

    updateAI(deltaTime, playerPosition) {
        const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);

        // Determine state
        if (distanceToPlayer <= GAME_CONFIG.ENEMY.ATTACK_RANGE) {
            this.state = 'attack';
        } else if (distanceToPlayer <= GAME_CONFIG.ENEMY.CHASE_RANGE) {
            this.state = 'chase';
        } else {
            this.state = 'idle';
        }

        // Execute behavior
        switch (this.state) {
            case 'chase':
                this.chasePlayer(deltaTime, playerPosition);
                break;

            case 'attack':
                this.attackPlayer();
                break;

            case 'idle':
                // Do nothing or wander
                break;
        }
    }

    chasePlayer(deltaTime, playerPosition) {
        // Move towards player
        const direction = new THREE.Vector3()
            .subVectors(playerPosition, this.mesh.position)
            .normalize();

        direction.y = 0; // Don't move vertically

        this.mesh.position.addScaledVector(direction, this.speed * deltaTime);

        // Face the player
        const angle = Math.atan2(direction.x, direction.z);
        this.mesh.rotation.y = angle;
    }

    attackPlayer() {
        if (this.attackCooldown > 0) return;

        // Deal damage to player
        this.game.player.takeDamage(this.damage);
        this.attackCooldown = GAME_CONFIG.ENEMY.ATTACK_COOLDOWN;

        console.log(`👾 Enemy attacked player for ${this.damage} damage`);
    }

    takeDamage(amount) {
        this.health -= amount;
        this.updateHealthBar();

        console.log(`Enemy took ${amount} damage (${Math.floor(this.health)} HP remaining)`);

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        console.log('💀 Enemy killed');

        // Notify game
        this.game.onEnemyKilled(this);
    }

    dispose() {
        if (this.mixer) {
            this.mixer.stopAllAction();
        }

        if (this.healthBarSprite) {
            this.healthBarSprite.material.map.dispose();
            this.healthBarSprite.material.dispose();
        }
    }
}
