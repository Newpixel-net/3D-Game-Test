/**
 * Game Configuration - All addictive mechanics and balance settings
 */

export const GAME_CONFIG = {
    // Display Settings
    CANVAS_ID: 'gameCanvas',
    TARGET_FPS: 60,
    ENABLE_SHADOWS: true,
    ENABLE_POST_PROCESSING: true,

    // Player Settings
    PLAYER: {
        HEALTH: 100,
        MAX_HEALTH: 100,
        SPEED: 8,
        ROTATION_SPEED: 0.05,

        // Weapon Settings
        WEAPON: {
            DAMAGE: 20,
            FIRE_RATE: 0.15, // seconds between shots
            MAGAZINE_SIZE: 30,
            MAX_AMMO: 120,
            RELOAD_TIME: 2.0,
            RANGE: 100,
            SPREAD: 0.02, // bullet spread for realism
        },

        // Regeneration (Addictive mechanic - always give hope)
        HEALTH_REGEN: {
            ENABLED: true,
            DELAY: 5.0, // seconds after taking damage
            RATE: 2, // health per second
        }
    },

    // Wave System (Progressive difficulty)
    WAVES: {
        START_WAVE: 1,
        ENEMIES_BASE: 3, // Base enemies in wave 1
        ENEMIES_PER_WAVE: 2, // Additional enemies each wave
        ENEMIES_MULTIPLIER: 1.15, // Exponential scaling

        // Break between waves (shop/upgrade time)
        WAVE_BREAK_DURATION: 15.0, // seconds

        // Boss waves (Special excitement every 5 waves)
        BOSS_INTERVAL: 5,
        BOSS_HEALTH_MULTIPLIER: 5.0,
        BOSS_DAMAGE_MULTIPLIER: 2.0,

        // Spawn timing
        SPAWN_DELAY_MIN: 0.5,
        SPAWN_DELAY_MAX: 3.0,
        SPAWN_DISTANCE: 50, // Distance from player
    },

    // Enemy Settings
    ENEMY: {
        HEALTH: 50,
        HEALTH_SCALE_PER_WAVE: 10, // Additional health per wave
        SPEED: 4,
        SPEED_SCALE: 0.1, // Speed increase per wave
        DAMAGE: 10,
        ATTACK_RANGE: 2,
        ATTACK_COOLDOWN: 1.5,

        // Detection
        DETECTION_RANGE: 30,
        CHASE_RANGE: 40,
    },

    // Scoring System (ADDICTION CORE)
    SCORING: {
        KILL_BASE_SCORE: 100,
        HEADSHOT_BONUS: 2.0, // 2x multiplier

        // Combo System (Consecutive kills)
        COMBO: {
            ENABLED: true,
            TIMEOUT: 3.0, // seconds to maintain combo
            MULTIPLIERS: [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10], // x1, x1.5, x2... up to x10
            MAX_COMBO: 100,
        },

        // Wave completion bonuses
        WAVE_COMPLETE_BONUS: 500,
        WAVE_BONUS_MULTIPLIER: 1.2, // Increases each wave

        // Perfect wave bonus (no damage taken)
        PERFECT_WAVE_BONUS: 1000,

        // Speed bonuses (complete wave quickly)
        SPEED_BONUS_THRESHOLD: 60, // seconds
        SPEED_BONUS: 300,
    },

    // Collectibles (Variable rewards - dopamine hits)
    COLLECTIBLES: {
        COIN: {
            VALUE: 10,
            DROP_CHANCE: 0.7, // 70% chance on enemy death
            LIFETIME: 30, // seconds before despawn
            MAGNETIC_RANGE: 5, // Auto-collect range
        },

        HEALTH_KIT: {
            HEAL_AMOUNT: 50,
            DROP_CHANCE: 0.15, // 15% chance
            LIFETIME: 20,
            MAGNETIC_RANGE: 3,
        },

        AMMO_CRATE: {
            AMMO_AMOUNT: 60,
            DROP_CHANCE: 0.2, // 20% chance
            LIFETIME: 20,
            MAGNETIC_RANGE: 3,
        },

        // Power-ups (Random, exciting drops)
        POWER_UPS: {
            DROP_CHANCE: 0.05, // 5% chance for random power-up
            DURATION: 10, // seconds
            TYPES: {
                DAMAGE_BOOST: { multiplier: 2.0, color: 0xff0000 },
                SPEED_BOOST: { multiplier: 1.5, color: 0x00ff00 },
                INVINCIBILITY: { multiplier: 1, color: 0xffff00 },
                RAPID_FIRE: { multiplier: 3.0, color: 0xff00ff },
                INFINITE_AMMO: { multiplier: 1, color: 0x00ffff },
            }
        }
    },

    // Upgrade System (Permanent progression - reason to keep playing)
    UPGRADES: {
        HEALTH: {
            name: 'Max Health',
            baseCost: 100,
            costMultiplier: 1.5,
            maxLevel: 10,
            bonusPerLevel: 20,
        },
        DAMAGE: {
            name: 'Weapon Damage',
            baseCost: 150,
            costMultiplier: 1.6,
            maxLevel: 10,
            bonusPerLevel: 5,
        },
        FIRE_RATE: {
            name: 'Fire Rate',
            baseCost: 200,
            costMultiplier: 1.7,
            maxLevel: 5,
            bonusPerLevel: 0.02,
        },
        AMMO_CAPACITY: {
            name: 'Ammo Capacity',
            baseCost: 100,
            costMultiplier: 1.4,
            maxLevel: 10,
            bonusPerLevel: 30,
        },
        MOVEMENT_SPEED: {
            name: 'Movement Speed',
            baseCost: 150,
            costMultiplier: 1.5,
            maxLevel: 5,
            bonusPerLevel: 1,
        },
        HEALTH_REGEN: {
            name: 'Health Regeneration',
            baseCost: 300,
            costMultiplier: 2.0,
            maxLevel: 5,
            bonusPerLevel: 1,
        },
    },

    // Achievements (Long-term goals)
    ACHIEVEMENTS: {
        FIRST_BLOOD: { name: 'First Blood', description: 'Kill your first enemy', condition: { kills: 1 } },
        SURVIVOR: { name: 'Survivor', description: 'Survive 5 waves', condition: { waves: 5 } },
        VETERAN: { name: 'Veteran', description: 'Survive 10 waves', condition: { waves: 10 } },
        LEGEND: { name: 'Legend', description: 'Survive 20 waves', condition: { waves: 20 } },
        HEADHUNTER: { name: 'Headhunter', description: 'Get 50 headshots', condition: { headshots: 50 } },
        COMBO_MASTER: { name: 'Combo Master', description: 'Reach a x10 combo', condition: { maxCombo: 10 } },
        MILLIONAIRE: { name: 'Millionaire', description: 'Earn 1,000,000 total score', condition: { totalScore: 1000000 } },
        PERFECT_WAVE: { name: 'Untouchable', description: 'Complete a wave without taking damage', condition: { perfectWaves: 1 } },
        COIN_COLLECTOR: { name: 'Coin Collector', description: 'Collect 1000 coins', condition: { coins: 1000 } },
        MARKSMAN: { name: 'Marksman', description: 'Achieve 80% accuracy', condition: { accuracy: 0.8 } },
    },

    // Visual Feedback (Juice!)
    EFFECTS: {
        SCREEN_SHAKE: {
            ENABLED: true,
            INTENSITY_SHOOT: 0.5,
            INTENSITY_HIT: 1.0,
            INTENSITY_DEATH: 2.0,
        },

        CAMERA_RECOIL: true,
        HIT_MARKERS: true,
        DAMAGE_NUMBERS: true,

        PARTICLES: {
            BLOOD_SPLATTER: true,
            MUZZLE_FLASH: true,
            BULLET_CASINGS: true,
            EXPLOSION: true,
            COIN_SPARKLE: true,
        },

        SLOW_MOTION: {
            ENABLED: true,
            TRIGGER_HEALTH: 20, // Trigger when health below 20
            TIME_SCALE: 0.5, // 50% speed
            DURATION: 2.0,
        }
    },

    // Audio Settings
    AUDIO: {
        MASTER_VOLUME: 1.0,
        MUSIC_VOLUME: 0.7,
        SFX_VOLUME: 1.0,

        // 3D Audio
        POSITIONAL_AUDIO: true,
        MAX_AUDIO_DISTANCE: 50,
        ROLLOFF_FACTOR: 1.5,
    },

    // Performance Settings
    PERFORMANCE: {
        MAX_ENEMIES: 50,
        MAX_PARTICLES: 1000,
        OBJECT_POOLING: true,
        LOD_ENABLED: true,
        LOD_DISTANCES: [20, 40, 80],
    },

    // Mobile Controls
    MOBILE: {
        JOYSTICK_SIZE: 100,
        JOYSTICK_DEADZONE: 0.1,
        BUTTON_SIZE: 70,
        AUTO_FIRE: false,
    },

    // Arena Settings
    ARENA: {
        SIZE: 60, // 60x60 units
        SPAWN_OBSTACLES: true,
        OBSTACLE_COUNT: 15,
    },

    // Debug
    DEBUG: false,
    SHOW_FPS: true,
    GOD_MODE: false,
};

export default GAME_CONFIG;
