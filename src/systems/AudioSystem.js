/**
 * Audio System - Manages all game audio including music, SFX, and 3D positional audio
 */

import * as THREE from 'three';
import { GAME_CONFIG } from '../config/game.config.js';

export class AudioSystem {
    constructor(assetManager) {
        this.assetManager = assetManager;

        // Audio context
        this.listener = new THREE.AudioListener();
        this.audioContext = null;

        // Audio pools
        this.musicTracks = new Map();
        this.soundEffects = new Map();

        // Current music
        this.currentMusic = null;
        this.musicVolume = GAME_CONFIG.AUDIO.MUSIC_VOLUME;
        this.sfxVolume = GAME_CONFIG.AUDIO.SFX_VOLUME;

        // Sound pools for frequently used sounds
        this.soundPools = new Map();
    }

    initialize() {
        console.log('🔊 Initializing audio system...');

        // Create audio context on first user interaction
        document.addEventListener('click', () => this.ensureAudioContext(), { once: true });
        document.addEventListener('touchstart', () => this.ensureAudioContext(), { once: true });

        return true;
    }

    ensureAudioContext() {
        if (!this.audioContext) {
            this.audioContext = THREE.AudioContext.getContext();
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }
    }

    playMusic(musicKey, loop = true) {
        this.ensureAudioContext();

        const soundData = this.assetManager.getSound(musicKey);
        if (!soundData) {
            console.warn(`Music not found: ${musicKey}`);
            return;
        }

        // Stop current music
        if (this.currentMusic) {
            this.currentMusic.stop();
        }

        // Create audio
        const sound = new THREE.Audio(this.listener);

        // Load and play
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(soundData.url, (buffer) => {
            sound.setBuffer(buffer);
            sound.setLoop(loop);
            sound.setVolume(this.musicVolume * GAME_CONFIG.AUDIO.MASTER_VOLUME);
            sound.play();
        });

        this.currentMusic = sound;
        console.log(`🎵 Playing music: ${musicKey}`);
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }

    pauseMusic() {
        if (this.currentMusic && this.currentMusic.isPlaying) {
            this.currentMusic.pause();
        }
    }

    resumeMusic() {
        if (this.currentMusic && !this.currentMusic.isPlaying) {
            this.currentMusic.play();
        }
    }

    playSound(soundKey, position = null, volume = 1.0) {
        this.ensureAudioContext();

        const soundData = this.assetManager.getSound(soundKey);
        if (!soundData) {
            console.warn(`Sound not found: ${soundKey}`);
            return;
        }

        // Create positional or regular audio
        let sound;

        if (position && GAME_CONFIG.AUDIO.POSITIONAL_AUDIO) {
            // 3D Positional Audio
            sound = new THREE.PositionalAudio(this.listener);
            sound.setRefDistance(GAME_CONFIG.AUDIO.MAX_AUDIO_DISTANCE / 5);
            sound.setRolloffFactor(GAME_CONFIG.AUDIO.ROLLOFF_FACTOR);
            sound.setDistanceModel('exponential');
            sound.setMaxDistance(GAME_CONFIG.AUDIO.MAX_AUDIO_DISTANCE);

            // Create a temporary object for position
            const audioObject = new THREE.Object3D();
            audioObject.position.copy(position);
            audioObject.add(sound);
        } else {
            // Regular 2D audio
            sound = new THREE.Audio(this.listener);
        }

        // Load and play
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(soundData.url, (buffer) => {
            sound.setBuffer(buffer);
            sound.setLoop(false);
            sound.setVolume(volume * this.sfxVolume * GAME_CONFIG.AUDIO.MASTER_VOLUME);
            sound.play();
        });

        return sound;
    }

    // Play random sound from a group (e.g., random scream)
    playRandomSound(prefix, position = null, volume = 1.0) {
        const soundKeys = Array.from(this.assetManager.sounds.keys()).filter(key => key.startsWith(prefix));

        if (soundKeys.length === 0) {
            console.warn(`No sounds found with prefix: ${prefix}`);
            return;
        }

        const randomKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];
        return this.playSound(randomKey, position, volume);
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));

        if (this.currentMusic) {
            this.currentMusic.setVolume(this.musicVolume * GAME_CONFIG.AUDIO.MASTER_VOLUME);
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    getListener() {
        return this.listener;
    }
}
