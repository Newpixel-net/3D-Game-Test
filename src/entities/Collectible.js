/**
 * Collectible Entity - Coins, health kits, ammo, and power-ups
 */

import * as THREE from 'three';
import { GAME_CONFIG } from '../config/game.config.js';

export class Collectible {
    constructor(game, assetManager, type) {
        this.game = game;
        this.assetManager = assetManager;
        this.type = type; // 'coin', 'health', 'ammo'

        this.mesh = null;
        this.lifetime = 0;
        this.maxLifetime = 0;
        this.isCollected = false;
        this.isExpired = false;

        // Animation
        this.rotationSpeed = Math.PI;
        this.bobSpeed = 2;
        this.bobAmount = 0.3;
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    initialize(position) {
        // Get config for this type
        let config, modelKey, value;

        switch (this.type) {
            case 'coin':
                config = GAME_CONFIG.COLLECTIBLES.COIN;
                modelKey = 'coin';
                value = config.VALUE;
                break;

            case 'health':
                config = GAME_CONFIG.COLLECTIBLES.HEALTH_KIT;
                modelKey = 'healthkit';
                value = config.HEAL_AMOUNT;
                break;

            case 'ammo':
                config = GAME_CONFIG.COLLECTIBLES.AMMO_CRATE;
                modelKey = 'ammo';
                value = config.AMMO_AMOUNT;
                break;

            default:
                console.error('Unknown collectible type:', this.type);
                return;
        }

        this.config = config;
        this.value = value;
        this.maxLifetime = config.LIFETIME;
        this.magneticRange = config.MAGNETIC_RANGE;

        // Load model
        const model = this.assetManager.getModel(modelKey);
        if (model) {
            this.mesh = model;
        } else {
            // Fallback: Create a simple shape
            let geometry, color;

            switch (this.type) {
                case 'coin':
                    geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
                    color = 0xffd700;
                    break;
                case 'health':
                    geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                    color = 0x00ff00;
                    break;
                case 'ammo':
                    geometry = new THREE.BoxGeometry(0.4, 0.6, 0.4);
                    color = 0xffaa00;
                    break;
            }

            const material = new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: 0.3,
            });
            this.mesh = new THREE.Mesh(geometry, material);
        }

        this.mesh.position.copy(position);
        this.mesh.position.y = 0.5;
        this.mesh.castShadow = false;
        this.mesh.receiveShadow = false;

        // Add glow effect
        this.addGlowEffect();
    }

    addGlowEffect() {
        // Add point light for glow
        let color;
        switch (this.type) {
            case 'coin':
                color = 0xffd700;
                break;
            case 'health':
                color = 0x00ff00;
                break;
            case 'ammo':
                color = 0xffaa00;
                break;
        }

        const light = new THREE.PointLight(color, 0.5, 5);
        light.position.y = 0.5;
        this.mesh.add(light);
    }

    update(deltaTime, playerPosition) {
        if (this.isCollected || this.isExpired) return;

        // Update lifetime
        this.lifetime += deltaTime;

        if (this.lifetime >= this.maxLifetime) {
            this.expire();
            return;
        }

        // Animate: Rotate and bob
        this.mesh.rotation.y += this.rotationSpeed * deltaTime;

        const bobValue = Math.sin(this.lifetime * this.bobSpeed + this.bobOffset) * this.bobAmount;
        this.mesh.position.y = 0.5 + bobValue;

        // Check for magnetic collection
        const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);

        if (distanceToPlayer <= this.magneticRange) {
            this.collect();
        } else if (distanceToPlayer <= this.magneticRange * 2) {
            // Move towards player (magnetic effect)
            const direction = new THREE.Vector3()
                .subVectors(playerPosition, this.mesh.position)
                .normalize();

            this.mesh.position.addScaledVector(direction, deltaTime * 3);
        }

        // Fade out near expiration
        const timeLeft = this.maxLifetime - this.lifetime;
        if (timeLeft < 3) {
            const opacity = timeLeft / 3;
            this.mesh.traverse((child) => {
                if (child.material) {
                    child.material.opacity = opacity;
                    child.material.transparent = true;
                }
            });
        }
    }

    collect() {
        this.isCollected = true;

        // Apply effect to player
        switch (this.type) {
            case 'coin':
                this.game.stateManager.addCoins(this.value);
                this.game.stateManager.addScore(this.value * 10);
                this.game.audioSystem.playRandomSound('take_dollar', this.mesh.position);
                break;

            case 'health':
                this.game.player.heal(this.value);
                this.game.audioSystem.playSound('continue', this.mesh.position);
                break;

            case 'ammo':
                this.game.player.addAmmo(this.value);
                this.game.audioSystem.playSound('button', this.mesh.position);
                break;
        }

        console.log(`✨ Collected ${this.type}!`);
    }

    expire() {
        this.isExpired = true;
        console.log(`⏰ ${this.type} expired`);
    }

    dispose() {
        // Cleanup
    }
}
