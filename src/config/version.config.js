/**
 * Game Version Configuration
 * Update this file with each release
 */

export const VERSION_CONFIG = {
    // Game identity
    GAME_NAME: 'WARZONE',
    GAME_SUBTITLE: 'Survival Shooter',

    // Version info (Semantic Versioning)
    VERSION: {
        MAJOR: 0,
        MINOR: 4,
        PATCH: 0,
        STAGE: 'ALPHA',  // ALPHA, BETA, or empty string for release
        BUILD: 1
    },

    // Auto-generated full version string
    get FULL_VERSION() {
        const { MAJOR, MINOR, PATCH, STAGE, BUILD } = this.VERSION;
        let version = `v${MAJOR}.${MINOR}.${PATCH}`;

        if (STAGE) {
            version += `-${STAGE.toLowerCase()}`;
        }

        if (BUILD > 0) {
            version += `.${BUILD}`;
        }

        return version;
    },

    // Display version (for UI)
    get DISPLAY_VERSION() {
        const { MAJOR, MINOR, STAGE } = this.VERSION;

        if (STAGE) {
            return `${STAGE} ${MAJOR}.${MINOR}`;
        }

        return `v${MAJOR}.${MINOR}`;
    },

    // Release notes for current version
    RELEASE_NOTES: [
        '✨ Modern third-person camera system',
        '🎮 Enhanced mouse-look controls',
        '🎯 Professional crosshair with aim assist',
        '⚡ Smooth player movement with strafing',
        '💥 Improved weapon recoil and screen shake'
    ],

    // Build date
    BUILD_DATE: new Date().toISOString().split('T')[0]
};
