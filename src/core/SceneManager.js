/**
 * Scene Manager - Handles Three.js scene, camera, renderer, and lighting
 */

import * as THREE from 'three';
import { GAME_CONFIG } from '../config/game.config.js';

export class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;

        // Modern third-person camera settings
        this.cameraDistance = 6;        // Much closer for TPS
        this.cameraHeight = 2.5;        // Shoulder height
        this.cameraSideOffset = 1.2;    // Over-the-shoulder offset
        this.cameraLerpSpeed = 0.15;    // Smooth but responsive

        // Camera rotation (controlled by mouse)
        this.cameraRotationY = 0;       // Horizontal rotation
        this.cameraRotationX = 0.3;     // Vertical rotation (pitch)
        this.minPitch = -0.5;           // Look down limit
        this.maxPitch = 1.2;            // Look up limit

        // Mouse sensitivity
        this.mouseSensitivity = 0.002;

        // Player target for camera follow
        this.playerTarget = null;
        this.cameraLookAtOffset = new THREE.Vector3(0, 1.6, 0); // Eye level

        // Camera shake with direction
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeDirection = new THREE.Vector3();

        // Camera bob for movement feel
        this.bobIntensity = 0;
        this.bobSpeed = 0;
    }

    initialize() {
        // Get canvas element
        this.canvas = document.getElementById(GAME_CONFIG.CANVAS_ID);
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 150);

        // Create camera
        this.createCamera();

        // Create renderer
        this.createRenderer();

        // Setup lighting
        this.setupLighting();

        // Handle window resize
        this.onWindowResize();

        console.log('✅ Scene initialized');
    }

    createCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(0, this.cameraHeight, this.cameraDistance);
        this.camera.lookAt(0, 0, 0);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false,
        });

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = GAME_CONFIG.ENABLE_SHADOWS;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 30);
        directionalLight.castShadow = GAME_CONFIG.ENABLE_SHADOWS;

        if (GAME_CONFIG.ENABLE_SHADOWS) {
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 500;
            directionalLight.shadow.camera.left = -50;
            directionalLight.shadow.camera.right = 50;
            directionalLight.shadow.camera.top = 50;
            directionalLight.shadow.camera.bottom = -50;
        }

        this.scene.add(directionalLight);

        // Hemisphere light for better color
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x8B7355, 0.3);
        this.scene.add(hemiLight);
    }

    createArena(assetManager) {
        const arenaSize = GAME_CONFIG.ARENA.SIZE;

        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(arenaSize, arenaSize);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x7c6f64,
            roughness: 0.8,
            metalness: 0.2,
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Arena boundaries (walls)
        this.createBoundaryWalls(arenaSize);

        // Add road segments for visual interest
        this.addRoadSegments(assetManager, arenaSize);

        // Add obstacles/cover
        if (GAME_CONFIG.ARENA.SPAWN_OBSTACLES) {
            this.addObstacles(assetManager);
        }
    }

    createBoundaryWalls(size) {
        const wallHeight = 5;
        const wallThickness = 1;
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.9,
        });

        // North wall
        const northWall = new THREE.Mesh(
            new THREE.BoxGeometry(size, wallHeight, wallThickness),
            wallMaterial
        );
        northWall.position.set(0, wallHeight / 2, -size / 2);
        northWall.receiveShadow = true;
        northWall.castShadow = true;
        this.scene.add(northWall);

        // South wall
        const southWall = northWall.clone();
        southWall.position.z = size / 2;
        this.scene.add(southWall);

        // East wall
        const eastWall = new THREE.Mesh(
            new THREE.BoxGeometry(wallThickness, wallHeight, size),
            wallMaterial
        );
        eastWall.position.set(size / 2, wallHeight / 2, 0);
        eastWall.receiveShadow = true;
        eastWall.castShadow = true;
        this.scene.add(eastWall);

        // West wall
        const westWall = eastWall.clone();
        westWall.position.x = -size / 2;
        this.scene.add(westWall);
    }

    addRoadSegments(assetManager, arenaSize) {
        // Add a few road segments for visual variety
        const roadModel = assetManager.getModel('road');
        if (!roadModel) return;

        const roadCount = 3;
        const spacing = arenaSize / (roadCount + 1);

        for (let i = 0; i < roadCount; i++) {
            const road = roadModel.clone();
            road.position.set(
                -arenaSize / 2 + spacing * (i + 1),
                0,
                0
            );
            road.rotation.y = Math.PI / 2;
            this.scene.add(road);
        }
    }

    addObstacles(assetManager) {
        const obstacleTypes = ['crate', 'barrel', 'barrier'];
        const arenaSize = GAME_CONFIG.ARENA.SIZE;
        const count = GAME_CONFIG.ARENA.OBSTACLE_COUNT;

        for (let i = 0; i < count; i++) {
            // Random obstacle type
            const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
            const model = assetManager.getModel(type);

            if (model) {
                const obstacle = model.clone();

                // Random position (avoid center where player spawns)
                let x, z;
                do {
                    x = (Math.random() - 0.5) * (arenaSize - 10);
                    z = (Math.random() - 0.5) * (arenaSize - 10);
                } while (Math.sqrt(x * x + z * z) < 10); // Keep center clear

                obstacle.position.set(x, 0, z);
                obstacle.rotation.y = Math.random() * Math.PI * 2;

                this.scene.add(obstacle);
            }
        }
    }

    setPlayerTarget(playerMesh) {
        this.playerTarget = playerMesh;
    }

    updateCamera(deltaTime, inputManager, isMoving = false) {
        if (!this.playerTarget) return;

        // Update camera rotation from mouse input (if pointer is locked)
        if (inputManager && inputManager.pointerLocked && inputManager.mouse.deltaX !== undefined) {
            this.cameraRotationY -= inputManager.mouse.deltaX * this.mouseSensitivity;
            this.cameraRotationX -= inputManager.mouse.deltaY * this.mouseSensitivity;

            // Clamp vertical rotation
            this.cameraRotationX = Math.max(this.minPitch, Math.min(this.maxPitch, this.cameraRotationX));

            // Reset mouse deltas
            inputManager.mouse.deltaX = 0;
            inputManager.mouse.deltaY = 0;
        }

        // Calculate camera position based on rotation
        const playerPos = this.playerTarget.position.clone();

        // Calculate offset based on camera rotation
        const horizontalDistance = this.cameraDistance * Math.cos(this.cameraRotationX);
        const verticalDistance = this.cameraDistance * Math.sin(this.cameraRotationX);

        const offsetX = Math.sin(this.cameraRotationY) * horizontalDistance +
                       Math.cos(this.cameraRotationY) * this.cameraSideOffset;
        const offsetZ = Math.cos(this.cameraRotationY) * horizontalDistance -
                       Math.sin(this.cameraRotationY) * this.cameraSideOffset;

        const desiredPosition = new THREE.Vector3(
            playerPos.x - offsetX,
            playerPos.y + this.cameraHeight + verticalDistance,
            playerPos.z - offsetZ
        );

        // Smooth camera movement
        this.camera.position.lerp(desiredPosition, this.cameraLerpSpeed);

        // Camera bob when moving
        if (isMoving) {
            this.bobIntensity = Math.min(this.bobIntensity + deltaTime * 5, 1);
            this.bobSpeed += deltaTime * 8;
            const bobOffset = Math.sin(this.bobSpeed) * 0.05 * this.bobIntensity;
            this.camera.position.y += bobOffset;
        } else {
            this.bobIntensity = Math.max(this.bobIntensity - deltaTime * 5, 0);
        }

        // Look at point ahead of player
        const lookAtTarget = playerPos.clone().add(this.cameraLookAtOffset);
        const lookDirection = new THREE.Vector3(
            Math.sin(this.cameraRotationY),
            -Math.sin(this.cameraRotationX),
            Math.cos(this.cameraRotationY)
        );
        lookAtTarget.add(lookDirection.multiplyScalar(3));

        this.camera.lookAt(lookAtTarget);

        // Apply camera shake with directional bias
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            const shakeProgress = this.shakeDuration / 0.3;
            const shake = new THREE.Vector3(
                (Math.random() - 0.5 + this.shakeDirection.x) * this.shakeIntensity * shakeProgress,
                (Math.random() - 0.5 + this.shakeDirection.y) * this.shakeIntensity * shakeProgress,
                (Math.random() - 0.5 + this.shakeDirection.z) * this.shakeIntensity * shakeProgress
            );
            this.camera.position.add(shake);
        }
    }

    shakeCamera(intensity, duration, direction = null) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        if (direction) {
            this.shakeDirection.copy(direction);
        } else {
            this.shakeDirection.set(0, 0, 0);
        }
    }

    // Get camera forward direction for player movement
    getCameraForward() {
        return new THREE.Vector3(
            Math.sin(this.cameraRotationY),
            0,
            Math.cos(this.cameraRotationY)
        ).normalize();
    }

    // Get camera right direction for strafing
    getCameraRight() {
        return new THREE.Vector3(
            Math.cos(this.cameraRotationY),
            0,
            -Math.sin(this.cameraRotationY)
        ).normalize();
    }

    // Get camera rotation for player aiming
    getCameraRotationY() {
        return this.cameraRotationY;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }
}
