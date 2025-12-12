import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'lil-gui';

export class App {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private gui: GUI;
  private cube!: THREE.Mesh;
  private animationId: number | null = null;
  
  // Mesh editing parameters
  private subdivisionLevel: number = 1;
  private spherizationAmount: number = 0;
  private baseSize: number = 2;

  constructor() {
    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.gui = new GUI();

    // Set up renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Append canvas to DOM
    const container = document.getElementById('app');
    if (container) {
      container.appendChild(this.renderer.domElement);
    }

    // Set camera position
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    // Configure controls
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 20;
  }

  init(): void {
    this.setupScene();
    this.setupLights();
    this.setupObjects();
    this.setupGUI();
    this.setupEventListeners();
    this.animate();
  }

  private setupScene(): void {
    // Set background color
    this.scene.background = new THREE.Color(0x1a1a1a);
    this.scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    this.scene.add(gridHelper);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
  }

  private setupLights(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Directional light (main light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);

    // Point light
    const pointLight = new THREE.PointLight(0x00ff00, 0.5, 100);
    pointLight.position.set(-5, 5, -5);
    this.scene.add(pointLight);

    // Hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    this.scene.add(hemisphereLight);
  }

  private setupObjects(): void {
    // Create a rotating cube with editable geometry
    const geometry = this.createCubeGeometry();
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      metalness: 0.7,
      roughness: 0.2,
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.castShadow = true;
    this.cube.receiveShadow = true;
    this.scene.add(this.cube);

    // Add a plane for shadows
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.2,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    plane.receiveShadow = true;
    this.scene.add(plane);
  }

  private setupGUI(): void {
    // Cube controls
    const cubeFolder = this.gui.addFolder('Cube');
    cubeFolder.add(this.cube.rotation, 'x', 0, Math.PI * 2);
    cubeFolder.add(this.cube.rotation, 'y', 0, Math.PI * 2);
    cubeFolder.add(this.cube.rotation, 'z', 0, Math.PI * 2);
    cubeFolder.open();

    // Mesh editing controls
    const editFolder = this.gui.addFolder('Mesh Editing');
    editFolder
      .add(this, 'subdivisionLevel', 1, 10, 1)
      .name('Subdivision Level')
      .onChange(() => this.updateMeshGeometry());
    editFolder
      .add(this, 'spherizationAmount', 0, 1, 0.01)
      .name('Spherization')
      .onChange(() => this.updateMeshGeometry());
    editFolder
      .add(this, 'baseSize', 0.5, 5, 0.1)
      .name('Base Size')
      .onChange(() => this.updateMeshGeometry());
    editFolder.add({ reset: () => this.resetMesh() }, 'reset').name('Reset Mesh');
    editFolder.open();

    // Camera controls
    const cameraFolder = this.gui.addFolder('Camera');
    cameraFolder.add(this.camera.position, 'x', -10, 10);
    cameraFolder.add(this.camera.position, 'y', -10, 10);
    cameraFolder.add(this.camera.position, 'z', -10, 10);
    cameraFolder.open();

    // Renderer controls
    const rendererFolder = this.gui.addFolder('Renderer');
    rendererFolder
      .add(this.renderer, 'toneMappingExposure', 0, 2)
      .name('Exposure');
    rendererFolder.open();
  }

  private setupEventListeners(): void {
    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Handle cleanup
    window.addEventListener('beforeunload', () => {
      this.dispose();
    });
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Rotate cube
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    // Update controls
    this.controls.update();

    // Render scene
    this.renderer.render(this.scene, this.camera);
  };

  private createCubeGeometry(): THREE.BufferGeometry {
    // Create base cube geometry with subdivision
    const segments = Math.max(1, Math.floor(this.subdivisionLevel));
    const geometry = new THREE.BoxGeometry(
      this.baseSize,
      this.baseSize,
      this.baseSize,
      segments,
      segments,
      segments
    );

    // Convert to BufferGeometry for easier manipulation
    const bufferGeometry = geometry.toNonIndexed();
    bufferGeometry.computeVertexNormals();

    // Apply spherization if needed
    if (this.spherizationAmount > 0) {
      this.applySpherization(bufferGeometry);
    }

    return bufferGeometry;
  }

  private applySpherization(geometry: THREE.BufferGeometry): void {
    const positions = geometry.attributes.position;
    const radius = this.baseSize / 2;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      // Current position
      const currentPos = new THREE.Vector3(x, y, z);

      // Calculate direction from center
      const direction = currentPos.clone().normalize();

      // Target position on sphere
      const spherePos = direction.multiplyScalar(radius);

      // Interpolate between cube and sphere
      const newPos = currentPos.lerp(spherePos, this.spherizationAmount);

      positions.setXYZ(i, newPos.x, newPos.y, newPos.z);
    }

    // Update normals after spherization
    geometry.computeVertexNormals();
    geometry.attributes.position.needsUpdate = true;
  }

  private updateMeshGeometry(): void {
    // Dispose old geometry
    if (this.cube.geometry) {
      this.cube.geometry.dispose();
    }

    // Create new geometry with current parameters
    const newGeometry = this.createCubeGeometry();
    this.cube.geometry = newGeometry;
  }

  private resetMesh(): void {
    this.subdivisionLevel = 1;
    this.spherizationAmount = 0;
    this.baseSize = 2;
    this.updateMeshGeometry();
  }

  private dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    // Dispose of geometries and materials
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    // Dispose of renderer
    this.renderer.dispose();

    // Destroy GUI
    this.gui.destroy();
  }
}

