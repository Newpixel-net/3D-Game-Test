/**
 * Asset Manager - Loads and manages all game assets (3D models, sounds, textures)
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AssetManager {
    constructor() {
        this.models = new Map();
        this.sounds = new Map();
        this.textures = new Map();

        this.gltfLoader = new GLTFLoader();
        this.textureLoader = new THREE.TextureLoader();

        // Asset definitions (based on your files)
        this.assetList = {
            models: {
                // Player and weapons
                player: 'Low_poly_stylized_sol_1028213834_texture.glb',
                rifle: 'Low_poly_assault_rifl_1028222641_texture.glb',

                // Enemies
                enemy: 'Low_poly_enemy_soldie_1028215226_texture.glb',
                enemy_small: 'Tiny_low_poly_soldier_1028215444_texture.glb',

                // Environment
                road: 'Straight_road_segment_1028222555_texture.glb',
                fence: 'Simple_fence_railing__1028222631_texture.glb',
                gate: 'Rectangular_gate_obst_1028222702_texture.glb',
                gate2: 'Rectangular_gate_obst_1028223027_texture.glb',

                // Obstacles/Cover
                crate: 'Low_poly_wooden_crate_1028223015_texture.glb',
                barrel: 'Low_poly_barrel_meta_1028222541_texture.glb',
                barrier: 'Low_poly_road_barrier_1028222618_texture.glb',
                vehicle: 'Low_poly_military_veh_1028222936_texture.glb',

                // Collectibles
                coin: 'Low_poly_gold_coin_c_1028222958_texture.glb',
                healthkit: 'Low_poly_medical_kit__1028223006_texture.glb',
                ammo: 'Low_poly_3D_X2_or__1028222949_texture.glb',
            },

            sounds: {
                // UI Sounds
                button: 'button.webm',
                start: 'start.webm',
                continue: 'continue.webm',
                applause: 'applause.webm',

                // Combat Sounds
                guillotine_1: 'guillotine_1.webm',
                guillotine_2: 'guillotine_2.webm',
                guillotine_3: 'guillotine_3.webm',
                guillotine_4: 'guillotine_4.webm',
                guillotine_5: 'guillotine_5.webm',

                // Enemy Sounds
                scream_1: 'scream_1.webm',
                scream_2: 'scream_2.webm',
                scream_3: 'scream_3.webm',

                // Collectible Sounds
                take_dollar_1: 'take_dollar_1.webm',
                take_dollar_2: 'take_dollar_2.webm',
                take_dollar_3: 'take_dollar_3.webm',

                // Music
                game_music: 'game_music.webm',
            }
        };
    }

    async loadAllAssets(onProgress) {
        const totalAssets = Object.keys(this.assetList.models).length +
                          Object.keys(this.assetList.sounds).length;
        let loadedAssets = 0;
        let processedAssets = 0;

        console.log(`📦 Loading ${totalAssets} assets...`);

        // Load models
        for (const [key, filename] of Object.entries(this.assetList.models)) {
            try {
                console.log(`🔄 Loading model: ${key} (${filename})`);
                const model = await this.loadModel(filename);
                this.models.set(key, model);
                loadedAssets++;
                processedAssets++;

                if (onProgress) {
                    onProgress((processedAssets / totalAssets) * 100);
                }

                console.log(`✅ Model loaded: ${key}`);
            } catch (error) {
                processedAssets++;
                console.error(`❌ Failed to load model ${key} (${filename}):`, error);

                // Still update progress even on error
                if (onProgress) {
                    onProgress((processedAssets / totalAssets) * 100);
                }
            }
        }

        // Load sounds
        for (const [key, filename] of Object.entries(this.assetList.sounds)) {
            try {
                console.log(`🔄 Loading sound: ${key} (${filename})`);
                const sound = await this.loadSound(filename);
                this.sounds.set(key, sound);
                loadedAssets++;
                processedAssets++;

                if (onProgress) {
                    onProgress((processedAssets / totalAssets) * 100);
                }

                console.log(`✅ Sound loaded: ${key}`);
            } catch (error) {
                processedAssets++;
                console.error(`❌ Failed to load sound ${key} (${filename}):`, error);

                // Still update progress even on error
                if (onProgress) {
                    onProgress((processedAssets / totalAssets) * 100);
                }
            }
        }

        console.log(`✅ Asset loading complete: ${loadedAssets}/${totalAssets} loaded successfully`);

        if (loadedAssets === 0) {
            throw new Error('Failed to load any assets! Check console for errors.');
        }
    }

    loadModel(filename) {
        return new Promise((resolve, reject) => {
            const path = `${import.meta.env.BASE_URL}${filename}`;

            this.gltfLoader.load(
                path,
                (gltf) => {
                    const model = gltf.scene;

                    // Setup model for rendering
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;

                            // Ensure materials are properly set up
                            if (child.material) {
                                child.material.needsUpdate = true;
                            }
                        }
                    });

                    // Store animations if any
                    if (gltf.animations && gltf.animations.length > 0) {
                        model.userData.animations = gltf.animations;
                        model.userData.mixer = new THREE.AnimationMixer(model);
                    }

                    resolve(model);
                },
                (progress) => {
                    // Optional: track individual file progress
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    loadSound(filename) {
        return new Promise((resolve, reject) => {
            const path = `${import.meta.env.BASE_URL}${filename}`;

            fetch(path)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load sound: ${filename}`);
                    }
                    return response.arrayBuffer();
                })
                .then(arrayBuffer => {
                    resolve({
                        name: filename,
                        buffer: arrayBuffer,
                        url: path
                    });
                })
                .catch(error => reject(error));
        });
    }

    getModel(key) {
        const model = this.models.get(key);
        return model ? model.clone() : null;
    }

    getSound(key) {
        return this.sounds.get(key);
    }

    // Get random sound from a group (e.g., "scream" will return scream_1, scream_2, or scream_3)
    getRandomSound(prefix) {
        const sounds = Array.from(this.sounds.keys()).filter(key => key.startsWith(prefix));
        if (sounds.length === 0) return null;

        const randomKey = sounds[Math.floor(Math.random() * sounds.length)];
        return this.sounds.get(randomKey);
    }

    // Preload a specific animation for a model
    setupAnimation(model, animationName) {
        if (!model.userData.animations || !model.userData.mixer) {
            return null;
        }

        const clip = THREE.AnimationClip.findByName(model.userData.animations, animationName);
        if (!clip) return null;

        return model.userData.mixer.clipAction(clip);
    }

    dispose() {
        // Dispose models
        this.models.forEach(model => {
            model.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });

        this.models.clear();
        this.sounds.clear();
        this.textures.clear();
    }
}
