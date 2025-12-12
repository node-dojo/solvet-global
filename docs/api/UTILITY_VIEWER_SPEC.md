# 3D Embed Utility Viewer - Technical Specification

This document defines the exact THREE.js configuration used in `3d-embed-utility.html` that must be replicated in the product card 3D embeds.

## Scene Setup (Lines 1298-1314)

```javascript
const scene = new THREE.Scene();
scene.background = null; // Transparent background

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.01, 100000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true // Enable transparency
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
```

## Lighting Setup (Lines 1318-1341)

### Hemisphere Light (Sky + Ground Ambient)
```javascript
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
scene.add(hemiLight);
```
- **Type**: HemisphereLight
- **Sky Color**: 0xffffff (white)
- **Ground Color**: 0x444444 (dark gray)
- **Intensity**: 0.6
- **Position**: Fixed from config: { x: 0, y: 0, z: 0 } (implicit)

### Key Light (Main Light Source)
```javascript
const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
keyLight.position.set(5, 10, 7);
keyLight.castShadow = true;
scene.add(keyLight);
```
- **Type**: DirectionalLight
- **Color**: 0xffffff (white)
- **Intensity**: 0.8
- **Position**: { x: 5, y: 10, z: 7 }
- **Cast Shadow**: true

### Fill Light (Softens Shadows)
```javascript
const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
fillLight.position.set(-5, 5, -5);
scene.add(fillLight);
```
- **Type**: DirectionalLight
- **Color**: 0xffffff (white)
- **Intensity**: 0.4
- **Position**: { x: -5, y: 5, z: -5 }

### Rim Light (Edge Definition)
```javascript
const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
rimLight.position.set(0, 5, -10);
scene.add(rimLight);
```
- **Type**: DirectionalLight
- **Color**: 0xffffff (white)
- **Intensity**: 0.5
- **Position**: { x: 0, y: 5, z: -10 }

### Ambient Light (Overall Scene Brightness)
```javascript
const ambient = new THREE.AmbientLight(0x404040, 0.2);
scene.add(ambient);
```
- **Type**: AmbientLight
- **Color**: 0x404040 (dark gray)
- **Intensity**: 0.2

## Material Setup (Lines 1428-1435)

```javascript
const material = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.3,
    roughness: 0.4,
    envMapIntensity: 1.0
});
```
- **Type**: MeshStandardMaterial (PBR material)
- **Default Color**: 0x888888 (overridden by config)
- **Default Metalness**: 0.3 (overridden by config)
- **Default Roughness**: 0.4 (overridden by config)
- **Env Map Intensity**: 1.0

## Edge Geometry Setup (Lines 1439-1450)

```javascript
const edgesGeometry = new THREE.EdgesGeometry(geometry, 30);
const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 2
});
edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);

// Correct for Blender's Z-up coordinate system
// Rotate -90 degrees around X axis to convert Z-up to Y-up
mesh.rotation.x = -Math.PI / 2;
edgesMesh.rotation.x = -Math.PI / 2;
```
- **Edge Threshold**: 30 degrees
- **Default Edge Color**: 0x000000 (overridden by config)
- **Default Line Width**: 2 (overridden by config)
- **Blender Correction**: -90° rotation around X-axis for both mesh and edges

## Model Grouping (Lines 1452-1456)

```javascript
meshGroup = new THREE.Group();
meshGroup.add(mesh);
meshGroup.add(edgesMesh);
scene.add(meshGroup);
```
- Both mesh and edges are added to a THREE.Group
- Rotation is applied to the group, not individual objects

## Camera Positioning Algorithm (Lines 1461-1476)

```javascript
const maxDim = Math.max(size.x, size.y, size.z);
const fov = camera.fov * (Math.PI / 180); // Convert to radians
let cameraDistance = Math.abs(maxDim / Math.sin(fov / 2));

// Add padding (user-adjustable via camera-distance control)
const distanceMultiplier = parseFloat(document.getElementById('camera-distance').value);
cameraDistance *= distanceMultiplier;

// Position camera to view object optimally
camera.position.set(
    cameraDistance * 0.5,
    cameraDistance * 0.5,
    cameraDistance
);
camera.lookAt(0, 0, 0);
```
- **FOV**: 45 degrees (default, overridden by config)
- **Camera Distance Formula**: `maxDim / sin(fov / 2) * distanceMultiplier`
- **Distance Multiplier**: From config `camera.cameraDistance` (default: 0.9)
- **Position**: Not directly at (0, 0, distance), but offset: (d*0.5, d*0.5, d)
- **Look At**: Always (0, 0, 0)

## Animation Loop (Lines 1357-1374)

```javascript
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Update animation mixer if exists
    if (mixer) {
        mixer.update(delta);
    }

    if (meshGroup && rotating) {
        // Rotate around world Y-axis (vertical)
        meshGroup.rotation.y += rotateSpeed;
    }

    renderer.render(scene, camera);
}
```
- **Rotation Axis**: Y-axis (vertical, world space)
- **Rotation Speed**: From config `camera.rotationSpeed` converted to radians
  - Config format: "0.3deg" means 0.3 degrees per frame at 60fps
  - Converted to: `(0.3 / 60) * (Math.PI / 180)` = ~0.000087 radians per frame
  - Or more simply in utility: `rotateSpeed` variable set to ~0.005 for testing

## Config Application Priority (Lines 1174-1230)

The utility applies config in this order:
1. **Material properties**: color, metalness, roughness
2. **Edge properties**: visibility, color, thickness
3. **Lighting intensities**: all 5 lights
4. **Background**: transparent or color
5. **Camera settings**: FOV, distance, model fill

## Global Config Default Values

From [3d-embed-config-global.json](no3d-tools-website/3d-embed-config-global.json):

```json
{
  "material": {
    "metalness": 1,
    "roughness": 0.66,
    "color": "#e1ff00",
    "edges": {
      "enabled": true,
      "color": "#ffffff",
      "thickness": 2.1
    }
  },
  "camera": {
    "fieldOfView": "90deg",
    "autoRotate": true,
    "rotationSpeed": "0.3deg",
    "cameraDistance": 0.9,
    "modelFill": 0.55
  },
  "lighting": {
    "hemisphere": { "intensity": 0.6 },
    "key": { "intensity": 0.8 },
    "fill": { "intensity": 0.4 },
    "rim": { "intensity": 0.5 },
    "ambient": { "intensity": 0.2 }
  }
}
```

## Critical Differences from Current Implementation

1. **Camera FOV**: Utility uses 45° default, config specifies 90°
2. **Camera Position**: Utility uses (d*0.5, d*0.5, d), not (0, 0, d)
3. **Rotation Speed**: Utility uses direct value, config needs conversion from deg/frame to radians
4. **Tone Mapping**: Utility uses ACESFilmicToneMapping, current may not
5. **Renderer Settings**: Alpha and antialias must be enabled
6. **Shadow Map**: PCFSoftShadowMap type specifically
7. **EnvMapIntensity**: 1.0 in material

## Implementation Checklist

- [ ] Set camera FOV from config (90° not 45°)
- [ ] Calculate camera distance using exact formula
- [ ] Position camera at (d*0.5, d*0.5, d) not (0, 0, d)
- [ ] Apply ACESFilmicToneMapping
- [ ] Set toneMappingExposure to 1.0
- [ ] Use PCFSoftShadowMap for shadow type
- [ ] Set envMapIntensity to 1.0 in material
- [ ] Convert rotation speed from deg to radians correctly
- [ ] Apply -Math.PI/2 rotation to both mesh and edges
- [ ] Group mesh and edges in THREE.Group
- [ ] Rotate the group, not individual objects
