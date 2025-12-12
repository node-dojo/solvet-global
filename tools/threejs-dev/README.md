# Three.js Development Environment

A modern, production-ready Three.js development environment with TypeScript, Vite, and best practices.

## Features

- ⚡ **Vite** - Lightning-fast build tool and dev server
- 📘 **TypeScript** - Type-safe development
- 🎨 **Three.js** - Latest version with full type definitions
- 🎮 **OrbitControls** - Camera controls included
- 🛠️ **lil-gui** - Debug UI for tweaking parameters
- 🔍 **ESLint** - Code linting
- 💅 **Prettier** - Code formatting
- 🎯 **Hot Module Replacement** - Instant updates during development

## Getting Started

### Installation

```bash
cd threejs-dev
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Code Quality

Lint your code:

```bash
npm run lint
```

Format your code:

```bash
npm run format
```

Type check:

```bash
npm run type-check
```

## Project Structure

```
threejs-dev/
├── src/
│   ├── app.ts          # Main Three.js application class
│   ├── main.ts         # Entry point
│   └── style.css       # Global styles
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Example Scene

The included example demonstrates:

- Scene setup with lighting (ambient, directional, point, hemisphere)
- Shadow mapping
- OrbitControls for camera interaction
- GUI controls for tweaking parameters
- Responsive canvas resizing
- Proper cleanup and disposal

## Customization

### Adding New Objects

Edit `src/app.ts` and add your objects in the `setupObjects()` method:

```typescript
private setupObjects(): void {
  // Your custom geometry and materials
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(geometry, material);
  this.scene.add(sphere);
}
```

### Adding Loaders

Import Three.js loaders as needed:

```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
```

### Path Aliases

Use `@/` alias for imports from the `src` directory:

```typescript
import { MyClass } from '@/utils/MyClass';
```

## Best Practices

1. **Always dispose** of geometries, materials, and textures when done
2. **Use requestAnimationFrame** for animations
3. **Enable shadows** only when needed for performance
4. **Use OrbitControls** for interactive scenes
5. **Leverage TypeScript** for type safety
6. **Clean up** event listeners and animations on unmount

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## License

MIT

