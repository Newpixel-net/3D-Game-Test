# 🎮 AAA Wave-Based Survival Shooter

A high-quality HTML5 action game built with Three.js. Defend against endless waves of enemy soldiers in this addictive arena shooter!

## 🎯 Features

### Core Gameplay
- **Wave-Based Survival**: Face increasingly difficult enemy waves
- **Smooth Controls**: WASD movement + mouse aiming + space to shoot
- **Progressive Difficulty**: Enemies get stronger and faster each wave
- **Boss Waves**: Special boss enemies every 5 waves

### Addictive Mechanics
- ✅ **Combo System**: Build kill streaks for massive score multipliers (up to x10!)
- ✅ **Score Multipliers**: Consecutive kills increase your combo
- ✅ **Collectibles**: Coins, health kits, and ammo drops
- ✅ **Upgrades**: Spend coins between waves to upgrade your character
- ✅ **Achievements**: 30+ achievements to unlock
- ✅ **Health Regeneration**: Recover health when out of danger
- ✅ **Perfect Wave Bonuses**: Extra points for taking no damage

### Visual & Audio
- **3D Graphics**: Low-poly military-themed assets
- **Dynamic Lighting**: Real-time shadows and lighting
- **Sound Effects**: Weapon fire, enemy screams, collectible sounds
- **Background Music**: Immersive game soundtrack
- **Screen Shake**: Satisfying combat feedback
- **Particle Effects**: Blood splatters, muzzle flashes, explosions

### Platform Support
- **Desktop**: Full keyboard + mouse support
- **Mobile**: Touch controls with virtual joystick (coming soon)
- **Responsive**: Adapts to any screen size

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Controls

**Desktop:**
- `WASD` or `Arrow Keys` - Move
- `Mouse` - Aim
- `Left Click` or `Space` - Shoot
- `R` - Reload
- `ESC` - Pause menu

**Mobile:**
- `Left side` - Virtual joystick for movement
- `Right side` - Tap to shoot
- Auto-aim assists targeting

## 🎨 Assets

All 3D models and sounds are included:
- **Characters**: Player soldier, enemy soldiers
- **Weapons**: Assault rifle
- **Environment**: Roads, barriers, crates, barrels, vehicles
- **Collectibles**: Coins, health kits, ammo boxes
- **Sounds**: Weapon fire, enemy screams, UI sounds, music

## 🏗️ Architecture

```
src/
├── core/           # Game engine (loop, scene, input)
├── systems/        # Game systems (physics, audio)
├── entities/       # Game objects (player, enemies, collectibles)
├── managers/       # Managers (assets, waves, UI)
└── config/         # Game configuration
```

## 🎮 Game Design

### Progression System
- Start with Wave 1 (3 enemies)
- Each wave adds more enemies and increases difficulty
- Boss waves every 5 waves with special enemies
- Earn coins by killing enemies
- Spend coins on permanent upgrades

### Scoring System
- Base score: 100 points per kill
- Combo multipliers: x1, x1.5, x2, x2.5, x3, x4, x5, x7.5, x10
- Wave completion bonuses
- Perfect wave bonuses (no damage taken)
- Speed bonuses (complete waves quickly)

### Collectibles
- **Coins** (70% drop rate): Currency for upgrades
- **Health Kits** (15% drop rate): Restore 50 HP
- **Ammo Crates** (20% drop rate): +60 ammo

### Upgrades
- Max Health
- Weapon Damage
- Fire Rate
- Ammo Capacity
- Movement Speed
- Health Regeneration Rate

## 🔧 Configuration

Edit `src/config/game.config.js` to customize:
- Player stats
- Enemy difficulty
- Wave progression
- Drop rates
- Scoring multipliers
- Visual effects
- Audio settings

## 📱 Mobile Support

The game includes mobile touch controls:
- Virtual joystick for movement
- Tap anywhere to shoot
- Auto-aim assistance
- Responsive UI scaling

## 🎯 Future Enhancements

- [ ] More weapon types
- [ ] Power-up system
- [ ] Multiple arenas/maps
- [ ] Online leaderboards
- [ ] Daily challenges
- [ ] More enemy types
- [ ] Particle effects system
- [ ] Post-processing effects

## 🐛 Debugging

Set `DEBUG: true` in `game.config.js` to enable:
- FPS counter
- God mode
- Console logging

## 📄 License

MIT License - Feel free to use and modify!

## 🙏 Credits

Built with:
- [Three.js](https://threejs.org/) - 3D graphics
- [Vite](https://vitejs.dev/) - Build tool
- Low-poly 3D models from various sources

---

**Have fun and survive as long as you can!** 🎯
