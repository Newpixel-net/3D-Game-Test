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

        // Camera settings
        this.cameraDistance = 25;
        this.cameraHeight = 15;
        this.cameraAngle = Math.PI / 6; // 30 degrees

        // Player target for camera follow
        this.playerTarget = null;
        this.cameraOffset = new THREE.Vector3(0, this.cameraHeight, this.cameraDistance);
        this.cameraLookAtOffset = new THREE.Vector3(0, 2, 0);

        // Camera shake
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
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

    updateCamera(deltaTime) {
        if (!this.playerTarget) return;

        // Smooth camera follow
        const targetPosition = this.playerTarget.position.clone();
        const desiredPosition = targetPosition.clone().add(this.cameraOffset);

        // Lerp camera position
        this.camera.position.lerp(desiredPosition, 0.1);

        // Look at player with offset
        const lookAtTarget = targetPosition.clone().add(this.cameraLookAtOffset);
        this.camera.lookAt(lookAtTarget);

        // Apply camera shake
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            const shake = new THREE.Vector3(
                (Math.random() - 0.5) * this.shakeIntensity,
                (Math.random() - 0.5) * this.shakeIntensity,
                (Math.random() - 0.5) * this.shakeIntensity
            );
            this.camera.position.add(shake);
        }
    }

    shakeCamera(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
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
