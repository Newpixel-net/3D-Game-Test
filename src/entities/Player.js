/**
 * Player Entity - Player character controller with movement, shooting, and health
 */

import * as THREE from 'three';
import { GAME_CONFIG } from '../config/game.config.js';

export class Player {
    constructor(game, assetManager) {
        this.game = game;
        this.assetManager = assetManager;

        this.mesh = null;
        this.weapon = null;

        // Stats
        this.health = GAME_CONFIG.PLAYER.HEALTH;
        this.maxHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;
        this.speed = GAME_CONFIG.PLAYER.SPEED;

        // Weapon
        this.currentAmmo = GAME_CONFIG.PLAYER.WEAPON.MAGAZINE_SIZE;
        this.totalAmmo = GAME_CONFIG.PLAYER.WEAPON.MAX_AMMO;
        this.magazineSize = GAME_CONFIG.PLAYER.WEAPON.MAGAZINE_SIZE;
        this.isReloading = false;
        this.reloadTimer = 0;
        this.shootCooldown = 0;

        // Movement
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.rotationAngle = 0;

        // Health regen
        this.healthRegenTimer = 0;
        this.timeSinceLastDamage = 0;

        // Animation
        this.mixer = null;
        this.currentAction = null;
    }

    async initialize() {
        // Load player model
        const playerModel = this.assetManager.getModel('player');
        if (playerModel) {
            this.mesh = playerModel;

            // Setup animations if available
            if (playerModel.userData.animations) {
                this.mixer = new THREE.AnimationMixer(playerModel);

                // Play idle animation
                const idleClip = playerModel.userData.animations[0];
                if (idleClip) {
                    this.currentAction = this.mixer.clipAction(idleClip);
                    this.currentAction.play();
                }
            }
        } else {
            // Fallback: Create a simple capsule
            const geometry = new THREE.CapsuleGeometry(0.5, 1.5, 8, 16);
            const material = new THREE.MeshStandardMaterial({ color: 0x3366ff });
            this.mesh = new THREE.Mesh(geometry, material);
        }

        this.mesh.position.set(0, 0, 0);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        // Add weapon
        const weaponModel = this.assetManager.getModel('rifle');
        if (weaponModel) {
            this.weapon = weaponModel;
            this.weapon.position.set(0.5, 1, 0.5);
            this.weapon.rotation.y = -Math.PI / 4;
            this.weapon.scale.setScalar(0.5);
            this.mesh.add(this.weapon);
        }

        console.log('✅ Player initialized');
    }

    reset() {
        this.health = this.maxHealth;
        this.currentAmmo = this.magazineSize;
        this.totalAmmo = GAME_CONFIG.PLAYER.WEAPON.MAX_AMMO;
        this.isReloading = false;
        this.shootCooldown = 0;
        this.mesh.position.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
    }

    update(deltaTime, inputManager) {
        // Update timers
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }

        if (this.isReloading) {
            this.reloadTimer -= deltaTime;
            if (this.reloadTimer <= 0) {
                this.finishReload();
            }
        }

        // Movement
        this.updateMovement(deltaTime, inputManager);

        // Shooting
        if (!this.isReloading && inputManager.isShootPressed()) {
            this.shoot();
        }

        // Reload
        if (inputManager.isReloadPressed() && !this.isReloading) {
            this.reload();
        }

        // Health regeneration
        this.updateHealthRegen(deltaTime);

        // Update animations
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }

        // Update UI
        this.updateUI();
    }

    updateMovement(deltaTime, inputManager) {
        const movement = inputManager.getMovementInput();

        // Calculate movement direction relative to camera
        const cameraDirection = new THREE.Vector3(0, 0, -1);
        cameraDirection.applyQuaternion(this.game.sceneManager.camera.quaternion);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        const cameraRight = new THREE.Vector3(1, 0, 0);
        cameraRight.applyQuaternion(this.game.sceneManager.camera.quaternion);
        cameraRight.y = 0;
        cameraRight.normalize();

        // Calculate movement vector
        this.direction.set(0, 0, 0);
        this.direction.addScaledVector(cameraDirection, movement.y);
        this.direction.addScaledVector(cameraRight, movement.x);
        this.direction.normalize();

        // Apply movement
        if (this.direction.length() > 0) {
            this.velocity.copy(this.direction).multiplyScalar(this.speed);
            this.mesh.position.addScaledVector(this.velocity, deltaTime);

            // Rotate player to face movement direction
            this.rotationAngle = Math.atan2(this.direction.x, this.direction.z);
            this.mesh.rotation.y = this.rotationAngle;
        }

        // Keep player in bounds
        const arenaSize = GAME_CONFIG.ARENA.SIZE / 2 - 2;
        this.mesh.position.x = Math.max(-arenaSize, Math.min(arenaSize, this.mesh.position.x));
        this.mesh.position.z = Math.max(-arenaSize, Math.min(arenaSize, this.mesh.position.z));
    }

    shoot() {
        if (this.shootCooldown > 0 || this.currentAmmo <= 0) {
            return;
        }

        // Fire weapon
        this.currentAmmo--;
        this.shootCooldown = GAME_CONFIG.PLAYER.WEAPON.FIRE_RATE;

        // Record shot
        this.game.stateManager.recordShot();

        // Play shoot sound
        const shootSound = 'guillotine_' + (Math.ceil(Math.random() * 5));
        this.game.audioSystem.playSound(shootSound, this.mesh.position);

        // Raycast to check for hits
        const origin = this.mesh.position.clone();
        origin.y = 1.5; // Shoot from chest height

        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(this.mesh.quaternion);

        // Add spread
        const spread = GAME_CONFIG.PLAYER.WEAPON.SPREAD;
        direction.x += (Math.random() - 0.5) * spread;
        direction.z += (Math.random() - 0.5) * spread;
        direction.normalize();

        // Check for enemy hits
        const enemyMeshes = this.game.enemies.map(e => e.mesh);
        const hit = this.game.physicsSystem.raycast(
            origin,
            direction,
            GAME_CONFIG.PLAYER.WEAPON.RANGE,
            enemyMeshes
        );

        if (hit) {
            // Find the enemy that was hit
            const hitEnemy = this.game.enemies.find(e => {
                return hit.object === e.mesh || e.mesh.children.includes(hit.object);
            });

            if (hitEnemy) {
                this.game.stateManager.recordShot(true); // Hit!
                hitEnemy.takeDamage(GAME_CONFIG.PLAYER.WEAPON.DAMAGE);
            }
        }

        // Camera shake
        this.game.sceneManager.shakeCamera(
            GAME_CONFIG.EFFECTS.SCREEN_SHAKE.INTENSITY_SHOOT,
            0.1
        );

        // Auto-reload if magazine empty
        if (this.currentAmmo === 0 && this.totalAmmo > 0) {
            this.reload();
        }
    }

    reload() {
        if (this.isReloading || this.totalAmmo === 0 || this.currentAmmo === this.magazineSize) {
            return;
        }

        this.isReloading = true;
        this.reloadTimer = GAME_CONFIG.PLAYER.WEAPON.RELOAD_TIME;

        console.log('🔄 Reloading...');
    }

    finishReload() {
        const ammoNeeded = this.magazineSize - this.currentAmmo;
        const ammoToReload = Math.min(ammoNeeded, this.totalAmmo);

        this.currentAmmo += ammoToReload;
        this.totalAmmo -= ammoToReload;

        this.isReloading = false;

        console.log('✅ Reload complete');
    }

    takeDamage(amount) {
        this.health -= amount;
        this.timeSinceLastDamage = 0;

        // Record damage in state
        this.game.stateManager.recordDamage(amount);

        // Camera shake
        this.game.sceneManager.shakeCamera(
            GAME_CONFIG.EFFECTS.SCREEN_SHAKE.INTENSITY_HIT,
            0.3
        );

        console.log(`💔 Player took ${amount} damage (${Math.floor(this.health)} HP remaining)`);

        if (this.health <= 0) {
            this.die();
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        console.log(`💚 Player healed ${amount} HP`);
    }

    addAmmo(amount) {
        this.totalAmmo = Math.min(
            GAME_CONFIG.PLAYER.WEAPON.MAX_AMMO,
            this.totalAmmo + amount
        );
        console.log(`🔫 +${amount} ammo`);
    }

    updateHealthRegen(deltaTime) {
        if (!GAME_CONFIG.PLAYER.HEALTH_REGEN.ENABLED) return;

        this.timeSinceLastDamage += deltaTime;

        if (this.timeSinceLastDamage >= GAME_CONFIG.PLAYER.HEALTH_REGEN.DELAY) {
            if (this.health < this.maxHealth) {
                this.health += GAME_CONFIG.PLAYER.HEALTH_REGEN.RATE * deltaTime;
                this.health = Math.min(this.health, this.maxHealth);
            }
        }
    }

    updateUI() {
        this.game.uiManager.updateHealth(this.health, this.maxHealth);
        this.game.uiManager.updateAmmo(this.currentAmmo, this.totalAmmo, this.magazineSize);
    }

    die() {
        console.log('💀 Player died');
        this.health = 0;
    }

    dispose() {
        if (this.mixer) {
            this.mixer.stopAllAction();
        }
    }
}
