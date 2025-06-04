import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Create loading manager for assets
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (url, loaded, total) => {
    console.log(`Loading file: ${url} (${Math.round(loaded / total * 100)}% loaded)`);
};
loadingManager.onError = (url) => {
    console.error(`Error loading ${url}`);
};

// Get DOM elements
const loadingMessage = document.getElementById('loadingMessage');
const startButton = document.getElementById('startButton');

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Add custom FPS counter instead of stats.js
const fpsCounter = document.createElement('div');
fpsCounter.style.position = 'absolute';
fpsCounter.style.top = '10px';
fpsCounter.style.left = '10px';
fpsCounter.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
fpsCounter.style.color = 'white';
fpsCounter.style.padding = '5px 10px';
fpsCounter.style.fontFamily = 'monospace';
fpsCounter.style.fontSize = '14px';
fpsCounter.style.borderRadius = '10px';
fpsCounter.style.zIndex = '100';
fpsCounter.innerHTML = 'FPS: 0';
document.body.appendChild(fpsCounter);

// FPS calculation variables
let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

// Update FPS every second
function updateFPS() {
    const currentTime = performance.now();
    frameCount++;
    
    // Update once per second
    if (currentTime - lastTime >= 1000) {
        fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
        fpsCounter.innerHTML = `FPS: ${fps}`;
        frameCount = 0;
        lastTime = currentTime;
    }
}

// Initialize loaders with the loading manager
const textureLoader = new THREE.TextureLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

// Load skybox textures
const skyboxTextures = cubeTextureLoader.setPath('assets/textures/cartoon_skybox/').load([
    'px.jpg', // positive x - right
    'nx.jpg', // negative x - left
    'py.jpg', // positive y - top
    'ny.jpg', // negative y - bottom
    'pz.jpg', // positive z - front
    'nz.jpg'  // negative z - back
]);
scene.background = skyboxTextures;

// Enhanced lighting setup with three different types of lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Directional light (sun/moon-like)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(10, 15, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

// Create hanging kitchen lights that emit the point lights
const createKitchenLights = () => {
    const lights = [];
    
    // Main lamp over the middle of the counter
    const createPendantLight = (x, z, color, intensity) => {
        const lightGroup = new THREE.Group();
        
        // Ceiling mount
        const mountGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
        const mountMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2,
            map: textureLoader.load('assets/textures/kitchen/metal.jpg')
        });
        const mount = new THREE.Mesh(mountGeometry, mountMaterial);
        mount.position.y = 4;
        lightGroup.add(mount);
        
        // Wire/cord
        const wireGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1.5, 8);
        const wireMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.8
        });
        const wire = new THREE.Mesh(wireGeometry, wireMaterial);
        wire.position.y = 3.25;
        lightGroup.add(wire);
        
        // Lamp shade
        const shadeGeometry = new THREE.CylinderGeometry(0.25, 0.4, 0.5, 16, 1, true);
        const shadeMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.5,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        const shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
        shade.position.y = 2.5;
        lightGroup.add(shade);
        
        // Light bulb (emissive)
        const bulbGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const bulbMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            emissive: color,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.9
        });
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.y = 2.4;
        lightGroup.add(bulb);
        
        // Create actual light source
        const light = new THREE.PointLight(color, intensity, 20);
        light.position.copy(bulb.position);
        light.castShadow = true;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        lightGroup.add(light);
        
        // Position the entire lamp
        lightGroup.position.set(x, 0, z);
        scene.add(lightGroup);
        
        return { group: lightGroup, light: light, bulb: bulb };
    };
    
    // Create three hanging lamps over the counter
    lights.push(createPendantLight(0, -4.5, 0xffdd99, 2)); // Warm light in center
    lights.push(createPendantLight(-5, -4.5, 0xffdd99, 1.5)); // Warm light over cutting board
    lights.push(createPendantLight(5, -4.5, 0x9966ff, 1.2)); // Purple accent light on right
    
    return lights;
};

// Create kitchen lights
const kitchenLights = createKitchenLights();

// Remove the floating point light and accent light helpers
// (now we have actual lamp objects housing the lights)

// Player setup
const playerHeight = 1.7;
camera.position.set(0, playerHeight, 5);

// Movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = true;
let isSprinting = false;
let sinkWaterPool = null; // Water pool in sink
let tapNozzle = null; // Tap nozzle reference

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const playerSpeed = 5.0;
const sprintMultiplier = 1.5;

// Create pointer lock controls
const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(controls.object);

// Player shadow for visual feedback
const playerShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 16),
    new THREE.MeshBasicMaterial({ 
        color: 0x000000, 
        transparent: true, 
        opacity: 0.3,
        depthWrite: false
    })
);
playerShadow.rotation.x = -Math.PI / 2;
playerShadow.position.y = 0.01;
scene.add(playerShadow);

// Create a simple debugging UI
const debugInfo = document.createElement('div');
debugInfo.style.position = 'absolute';
debugInfo.style.top = '10px';
debugInfo.style.right = '10px';
debugInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
debugInfo.style.color = 'white';
debugInfo.style.padding = '10px';
debugInfo.style.fontFamily = 'monospace';
debugInfo.style.fontSize = '12px';
debugInfo.style.zIndex = '100';
debugInfo.style.pointerEvents = 'none'; // So it doesn't interfere with clicks
debugInfo.style.borderRadius = '5px';
debugInfo.style.maxWidth = '300px';
document.body.appendChild(debugInfo);

// Add variables to track custom model status
let breakfastModelLoaded = false;

function updateDebugInfo() {
    if (!controls) return;
    
    debugInfo.innerHTML = `
        <h3 style="margin-top:0;color:#8af;">Controls</h3>
        <table style="border-collapse:collapse;width:100%;">
            <tr><td>Movement:</td><td>WASD / Arrow Keys</td></tr>
            <tr><td>Look:</td><td>Click to lock/unlock cursor</td></tr>
            <tr><td>Jump:</td><td>Space</td></tr>
            <tr><td>Sprint:</td><td>Shift</td></tr>
            <tr><td>Interact:</td><td>E (when near objects)</td></tr>
            <tr><td>Toggle Lights:</td><td>L (animation on/off)</td></tr>
        </table>
        <h3 style="margin-top:10px;color:#fa8;">Game Status</h3>
        <table style="border-collapse:collapse;width:100%;">
            <tr><td>Controls Locked:</td><td>${controls.isLocked ? '✅ Yes' : '❌ No'}</td></tr>
            <tr><td>Position:</td><td>(${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})</td></tr>
            <tr><td>Can Jump:</td><td>${canJump ? '✅ Yes' : '❌ No'}</td></tr>
            <tr><td>Skybox:</td><td>✅ Purple Cartoon</td></tr>
        </table>
        <h3 style="margin-top:10px;color:#fa8;">Lighting</h3>
        <table style="border-collapse:collapse;width:100%;">
            <tr><td>Ambient:</td><td>🌎 Global (${(ambientLight.intensity * 100).toFixed(0)}%)</td></tr>
            <tr><td>Directional:</td><td>☀️ Sun-like (${(directionalLight.intensity * 100).toFixed(0)}%)</td></tr>
            <tr><td>Center Lamp:</td><td>💡 Warm (${(kitchenLights[0].light.intensity * 100).toFixed(0)}%)</td></tr>
            <tr><td>Cutting Lamp:</td><td>💡 Warm (${(kitchenLights[1].light.intensity * 100).toFixed(0)}%)</td></tr>
            <tr><td>Accent Lamp:</td><td>💜 Purple (${(kitchenLights[2].light.intensity * 100).toFixed(0)}%)</td></tr>
            <tr><td>Animation:</td><td>${lightAnimationEnabled ? '✅ On' : '❌ Off'}</td></tr>
        </table>
        <h3 style="margin-top:10px;color:#8af;">Custom Models</h3>
        <table style="border-collapse:collapse;width:100%;">
            <tr><td>Breakfast:</td><td>${breakfastModelLoaded ? '✅ Loaded' : '⏳ Loading...'}</td></tr>
            <tr><td>Interactive:</td><td>${Object.keys(activeAnimations).length > 0 ? '🔥 ' + Object.keys(activeAnimations).join(', ') : '🔄 None active'}</td></tr>
        </table>
    `;
}

// Create water drop for sink animation
const createWaterDrop = () => {
    const waterGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x66CCFF,
        transparent: true,
        opacity: 0.7,
        emissive: 0x3399FF,
        emissiveIntensity: 0.2
    });
    return new THREE.Mesh(waterGeometry, waterMaterial);
};

// Create a detailed chef knife using Three.js geometry
const createChefKnife = () => {
    // Create a group for the knife
    const knifeGroup = new THREE.Group();
    
    // Blade
    const bladeGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.15);
    bladeGeometry.translate(0.25, 0, 0); // Move origin to one end
    
    // Taper the blade
    const bladePositions = bladeGeometry.attributes.position;
    for (let i = 0; i < bladePositions.count; i++) {
        const x = bladePositions.getX(i);
        if (x > 0.45) {
            // Taper the tip of the blade
            const ratio = 1.0 - (x - 0.45) / 0.3;
            const y = bladePositions.getY(i) * ratio;
            const z = bladePositions.getZ(i) * ratio;
            bladePositions.setY(i, y);
            bladePositions.setZ(i, z);
        }
    }
    
    const bladeMaterial = new THREE.MeshStandardMaterial({
        color: 0xCCCCCC,
        metalness: 0.9,
        roughness: 0.2,
        map: textureLoader.load('assets/textures/kitchen/metal.jpg')
    });
    
    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.castShadow = true;
    knifeGroup.add(blade);
    
    // Handle
    const handleGeometry = new THREE.BoxGeometry(0.2, 0.08, 0.17);
    handleGeometry.translate(-0.15, 0, 0); // Move to connect with blade
    
    const handleMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.7,
        map: textureLoader.load('assets/textures/kitchen/wood.jpg')
    });
    
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.castShadow = true;
    knifeGroup.add(handle);
    
    // Bolster (metal part between blade and handle)
    const bolsterGeometry = new THREE.BoxGeometry(0.05, 0.07, 0.16);
    bolsterGeometry.translate(-0.025, 0, 0);
    
    const bolsterMaterial = new THREE.MeshStandardMaterial({
        color: 0xAAAAAA,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const bolster = new THREE.Mesh(bolsterGeometry, bolsterMaterial);
    bolster.position.set(-0.05, 0, 0);
    bolster.castShadow = true;
    knifeGroup.add(bolster);
    
    // Add edge highlight to blade
    const edgeGeometry = new THREE.BoxGeometry(0.59, 0.01, 0.01);
    edgeGeometry.translate(0.25, -0.02, 0.07);
    
    const edgeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        metalness: 1.0,
        roughness: 0.0
    });
    
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    knifeGroup.add(edge);
    
    return knifeGroup;
};

// Create cooking stations
const createCookingStations = () => {
    const stations = [];
    
    // Cutting Board - with wood texture
    const cuttingBoardGeometry = new THREE.BoxGeometry(1.5, 0.1, 1);
    const cuttingBoardMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.9,
        map: textureLoader.load('assets/textures/kitchen/wood.jpg')
    });
    const cuttingBoard = new THREE.Mesh(cuttingBoardGeometry, cuttingBoardMaterial);
    cuttingBoard.position.set(-5, 1.05, -4.5);  // Moved right
    cuttingBoard.castShadow = true;
    cuttingBoard.receiveShadow = true;
    scene.add(cuttingBoard);
    
    // Create chef knife using our function
    const chefKnife = createChefKnife();
    chefKnife.position.set(-5.2, 1.15, -4.5);
    chefKnife.rotation.y = Math.PI / 4; // Rotate 45 degrees
    scene.add(chefKnife);
    
    // Add vegetables on the cutting board with improved texture
    // Create a group of vegetables
    const createVegetableOnCuttingBoard = (type, x, z, rotation = 0, scale = 1) => {
        let geometry;
        let texturePath;
        let color;
        
        // Different geometry, texture, and color based on vegetable type
        switch(type) {
            case 'tomato':
                geometry = new THREE.SphereGeometry(0.15 * scale, 12, 12);
                texturePath = 'assets/textures/kitchen/tomato.jpg';
                color = 0xE63946; // Tomato red
                break;
            case 'cucumber':
                geometry = new THREE.CylinderGeometry(0.05 * scale, 0.05 * scale, 0.4 * scale, 12);
                texturePath = 'assets/textures/kitchen/cucumber.jpg';
                color = 0x2A9D8F; // Cucumber green
                break;
            case 'carrot':
                geometry = new THREE.CylinderGeometry(0.05 * scale, 0.02 * scale, 0.3 * scale, 12);
                texturePath = 'assets/textures/kitchen/carrot.jpg';
                color = 0xF77F00; // Carrot orange
                break;
            case 'onion':
                geometry = new THREE.SphereGeometry(0.12 * scale, 12, 12);
                texturePath = 'assets/textures/kitchen/onion.jpg';
                color = 0x9D4EDD; // Purple onion
                break;
            default:
                geometry = new THREE.BoxGeometry(0.12 * scale, 0.08 * scale, 0.12 * scale);
                texturePath = 'assets/textures/kitchen/tomato.jpg';
                color = 0xE63946; // Default to tomato red
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            map: textureLoader.load(texturePath)
        });
        
        const vegetable = new THREE.Mesh(geometry, material);
        vegetable.position.set(x, 1.15, z);
        vegetable.rotation.y = rotation;
        vegetable.castShadow = true;
        
        // For cylindrical vegetables, rotate to lay flat
        if (type === 'cucumber' || type === 'carrot') {
            vegetable.rotation.x = Math.PI / 2;
        }
        
        // Add stem to tomato
        if (type === 'tomato') {
            // Create a stem group
            const stemGroup = new THREE.Group();
            
            // Small green stem
            const stemGeometry = new THREE.CylinderGeometry(0.01 * scale, 0.01 * scale, 0.04 * scale, 8);
            const stemMaterial = new THREE.MeshStandardMaterial({
                color: 0x228B22, // Forest green
                roughness: 0.9
            });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 0.15 * scale;
            stemGroup.add(stem);
            
            // Small leaf
            const leafGeometry = new THREE.SphereGeometry(0.02 * scale, 8, 4);
            leafGeometry.scale(1, 0.3, 1);
            const leafMaterial = new THREE.MeshStandardMaterial({
                color: 0x228B22, // Forest green
                roughness: 0.9
            });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.set(0.02 * scale, 0.16 * scale, 0);
            leaf.rotation.z = Math.PI / 4;
            stemGroup.add(leaf);
            
            // Add stem group to vegetable
            vegetable.add(stemGroup);
        }
        
        scene.add(vegetable);
        return vegetable;
    };
    
    // Add vegetables to the cutting board
    const tomato = createVegetableOnCuttingBoard('tomato', -4.7, -4.3, 0, 1);
    const cucumber = createVegetableOnCuttingBoard('cucumber', -5.0, -4.7, Math.PI/4, 1);
    const carrot = createVegetableOnCuttingBoard('carrot', -5.3, -4.5, -Math.PI/6, 0.9);
    const onion = createVegetableOnCuttingBoard('onion', -4.8, -4.6, 0, 0.8);
    
    // Stove - with stove texture
    const stoveBaseGeometry = new THREE.BoxGeometry(2, 0.5, 1.5);
    const stoveBaseMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.8,
        map: textureLoader.load('assets/textures/kitchen/metal.jpg')
    });
    const stoveBase = new THREE.Mesh(stoveBaseGeometry, stoveBaseMaterial);
    stoveBase.position.set(-2, 1.25, -4.5);
    stoveBase.castShadow = true;
    stoveBase.receiveShadow = true;
    scene.add(stoveBase);
    
    // Stove Burner - with stove texture
    const burnerGeometry = new THREE.CircleGeometry(0.4, 16);
    const burnerMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.9,
        side: THREE.DoubleSide,
        map: textureLoader.load('assets/textures/kitchen/stove.jpg')
    });
    const burner = new THREE.Mesh(burnerGeometry, burnerMaterial);
    burner.rotation.x = -Math.PI / 2;
    burner.position.set(-2, 1.51, -4.5);
    scene.add(burner);
    
    // Pan
    const panBaseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
    const panHandleGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.1);
    const panMaterial = new THREE.MeshStandardMaterial({
        color: 0xEEEEEE,
        metalness: 0.8,
        roughness: 0.2,
        map: textureLoader.load('assets/textures/kitchen/metal.jpg')
    });
    
    const panBase = new THREE.Mesh(panBaseGeometry, panMaterial);
    panBase.position.set(-2, 1.6, -4.5);
    panBase.castShadow = true;
    scene.add(panBase);
    
    const panHandle = new THREE.Mesh(panHandleGeometry, panMaterial);
    panHandle.position.set(-1.4, 1.6, -4.5);
    panHandle.castShadow = true;
    scene.add(panHandle);
    
    // Sink - with metal texture
    const sinkBaseGeometry = new THREE.BoxGeometry(2, 0.5, 1.5);
    const sinkMaterial = new THREE.MeshStandardMaterial({
        color: 0xEEEEEE,
        roughness: 0.4,
        map: textureLoader.load('assets/textures/kitchen/tiles.jpg')
    });
    const sinkBase = new THREE.Mesh(sinkBaseGeometry, sinkMaterial);
    sinkBase.position.set(3, 1.25, -4.5);
    sinkBase.castShadow = true;
    sinkBase.receiveShadow = true;
    scene.add(sinkBase);
    
    const sinkHoleGeometry = new THREE.BoxGeometry(1.5, 0.4, 1);
    const sinkHoleMaterial = new THREE.MeshStandardMaterial({
        color: 0xEEEEEE,
        roughness: 0.4,
        map: textureLoader.load('assets/textures/kitchen/metal.jpg')
    });
    const sinkHole = new THREE.Mesh(sinkHoleGeometry, sinkHoleMaterial);
    sinkHole.position.set(3, 1.3, -4.5);
    scene.add(sinkHole);
    
    // Tap - with metal texture
    const tapBaseGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const tapMaterial = new THREE.MeshStandardMaterial({
        color: 0xDDDDDD,
        metalness: 0.8,
        roughness: 0.2,
        map: textureLoader.load('assets/textures/kitchen/metal.jpg')
    });
    const tapBase = new THREE.Mesh(tapBaseGeometry, tapMaterial);
    tapBase.position.set(3, 1.7, -5);
    tapBase.castShadow = true;
    scene.add(tapBase);
    
    const tapNozzleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
    tapNozzle = new THREE.Mesh(tapNozzleGeometry, tapMaterial);
    tapNozzle.rotation.x = Math.PI / 2;
    tapNozzle.position.set(3, 1.7, -4.8);
    tapNozzle.castShadow = true;
    scene.add(tapNozzle);
    
    // Fridge - with textured materials
    const fridgeGeometry = new THREE.BoxGeometry(2, 4, 1.5);
    const fridgeMaterial = new THREE.MeshStandardMaterial({
        color: 0xEEEEEE,
        roughness: 0.3,
        map: textureLoader.load('assets/textures/kitchen/metal.jpg')
    });
    const fridge = new THREE.Mesh(fridgeGeometry, fridgeMaterial);
    fridge.position.set(-8.5, 2, -5);
    fridge.castShadow = true;
    fridge.receiveShadow = true;
    scene.add(fridge);
    
    // Fridge Handle
    const handleGeometry = new THREE.BoxGeometry(0.1, 2, 0.1);
    const handleMaterial = new THREE.MeshStandardMaterial({
        color: 0xDDDDDD,
        metalness: 0.8,
        roughness: 0.2,
        map: textureLoader.load('assets/textures/kitchen/metal.jpg')
    });
    const fridgeHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    fridgeHandle.position.set(-7.5, 2, -4.2);
    fridgeHandle.castShadow = true;
    scene.add(fridgeHandle);
    
    // Update the cutting board station to include animations for the vegetables
    stations.push({
        name: 'Cutting Board',
        position: new THREE.Vector3(-5, 0, -4.5),  // Moved right
        radius: 1.5,
        objects: {
            knife: {
                object: chefKnife,
                originalPosition: chefKnife.position.clone(),
                originalRotation: chefKnife.rotation.clone(),
                animation: (delta) => {
                    // More realistic chopping animation
                    const time = Date.now() * 0.001;
                    if (time % 1 < 0.5) {
                        // Knife raises up
                        chefKnife.position.y = 1.15 + Math.sin(time * Math.PI * 2) * 0.15;
                        
                        // Rotate slightly as it raises
                        chefKnife.rotation.z = Math.sin(time * Math.PI * 2) * 0.1;
                    } else {
                        // Fast chopping motion
                        const chopProgress = (time % 1 - 0.5) * 2; // 0 to 1
                        
                        if (chopProgress < 0.1) {
                            // Quick downward chop
                            chefKnife.position.y = 1.15 + 0.15 * (1 - chopProgress * 10);
                            chefKnife.rotation.z = 0.1 * (1 - chopProgress * 10);
                        } else {
                            // Stay down briefly
                            chefKnife.position.y = 1.15;
                            chefKnife.rotation.z = 0;
                        }
                    }
                }
            },
            vegetables: {
                objects: [tomato, cucumber, carrot, onion],
                animation: (delta) => {
                    // Chopping animation with coordination to knife movement
                    const time = Date.now() * 0.001;
                    if (time % 1 > 0.5 && time % 1 < 0.6) {
                        // When knife comes down
                        const randomVegetable = Math.floor(Math.random() * 4);
                        const vegetable = [tomato, cucumber, carrot, onion][randomVegetable];
                        
                        // Cut the vegetable - make it slightly shorter and add pieces
                        if (vegetable.scale.y > 0.7) {
                            vegetable.scale.y *= 0.95;
                            
                            // Create a small piece that falls off
                            let pieceGeometry;
                            if (randomVegetable === 0) { // Tomato
                                pieceGeometry = new THREE.SphereGeometry(0.03, 8, 8);
                            } else if (randomVegetable === 1) { // Cucumber
                                pieceGeometry = new THREE.CylinderGeometry(0.05 * 0.5, 0.05 * 0.5, 0.05, 8);
                            } else if (randomVegetable === 2) { // Carrot
                                pieceGeometry = new THREE.CylinderGeometry(0.05 * 0.5, 0.02 * 0.5, 0.05, 8);
                            } else { // Onion
                                pieceGeometry = new THREE.SphereGeometry(0.03, 8, 8);
                            }
                            
                            const pieceMaterial = new THREE.MeshStandardMaterial({
                                color: vegetable.material.color.clone(),
                                roughness: 0.8,
                                map: vegetable.material.map
                            });
                            
                            const piece = new THREE.Mesh(pieceGeometry, pieceMaterial);
                            piece.position.copy(vegetable.position);
                            piece.position.y += 0.05;
                            piece.position.x += (Math.random() - 0.5) * 0.1;
                            piece.position.z += (Math.random() - 0.5) * 0.1;
                            piece.userData = {
                                velocity: new THREE.Vector3(
                                    (Math.random() - 0.5) * 0.05, 
                                    Math.random() * 0.05 + 0.02, 
                                    (Math.random() - 0.5) * 0.05
                                ),
                                createTime: Date.now(),
                                lifetime: 2000 // 2 seconds
                            };
                            scene.add(piece);
                            
                            // Add sound effect
                            if (Math.random() > 0.5) {
                                // Simulated sound effect (in real app would play audio)
                                console.log("Chop sound!");
                            }
                        }
                    }
                    
                    // Animate vegetable pieces
                    scene.children.forEach(child => {
                        if (child.userData && child.userData.velocity) {
                            // Apply gravity and move the piece
                            child.userData.velocity.y -= 0.001;
                            child.position.add(child.userData.velocity);
                            
                            // Rotate the piece as it falls
                            child.rotation.x += 0.05;
                            child.rotation.z += 0.05;
                            
                            // Remove after lifetime ends
                            if (Date.now() - child.userData.createTime > child.userData.lifetime) {
                                scene.remove(child);
                            }
                            
                            // Stop on the cutting board
                            if (child.position.y < 1.1) {
                                child.position.y = 1.1;
                                child.userData.velocity.y = 0;
                                child.userData.velocity.x *= 0.9;
                                child.userData.velocity.z *= 0.9;
                            }
                        }
                    });
                }
            }
        }
    });
    
    // Make the stove animation calmer and less intense
    stations.push({
        name: 'Stove',
        position: new THREE.Vector3(-2, 0, -4.5),
        radius: 1.5,
        objects: {
            burner: {
                object: burner,
                originalMaterial: burner.material.clone(),
                animation: (delta) => {
                    // Calmer and more subtle burner animation
                    const time = Date.now() * 0.001;
                    
                    // Gentle orange-red glow with less intensity
                    const intensity = 0.5 + Math.sin(time * 1.5) * 0.15; // Reduced intensity and variation
                    burner.material.color.setHSL(0.05, 0.8, intensity);
                    
                    // Minimal emissive
                    burner.material.emissive = burner.material.emissive || new THREE.Color();
                    burner.material.emissive.setHSL(0.05, 0.8, intensity * 0.3);
                    
                    // Very subtle pan movement
                    panBase.rotation.z = Math.sin(time * 0.5) * 0.02; // Slower, less movement
                    panBase.position.y = 1.6 + Math.sin(time) * 0.005; // Very subtle bobbing
                    
                    // Add flame particles rarely and with less intensity
                    if (Math.random() > 0.95) { // Only 5% chance each frame
                        // Create a flame particle - simplified
                        const flameGeometry = new THREE.SphereGeometry(0.05, 4, 4); // Lower poly count
                        const flameMaterial = new THREE.MeshBasicMaterial({
                            color: new THREE.Color(0xFF6600), // Fixed orange color
                            transparent: true,
                            opacity: 0.5 // Reduced opacity
                        });
                        
                        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
                        
                        // Position under the pan
                        flame.position.set(
                            -2 + (Math.random() - 0.5) * 0.2, // Less random spread
                            1.52, // Just above the burner
                            -4.5 + (Math.random() - 0.5) * 0.2 // Less random spread
                        );
                        
                        // Simplified properties for animation
                        flame.userData = {
                            createTime: Date.now(),
                            lifetime: 500, // 0.5 second
                            velocity: new THREE.Vector3(0, 0.03, 0) // Simplified upward movement
                        };
                        
                        scene.add(flame);
                    }
                    
                    // Create food sizzling effect - much less frequent
                    if (Math.random() > 0.98) { // Only 2% chance
                        // Sizzling particle (small steam/vapor) - simplified
                        const sizzleGeometry = new THREE.SphereGeometry(0.02, 3, 3); // Minimal geometry
                        const sizzleMaterial = new THREE.MeshBasicMaterial({
                            color: 0xCCCCCC,
                            transparent: true,
                            opacity: 0.2 // Very transparent
                        });
                        
                        const sizzle = new THREE.Mesh(sizzleGeometry, sizzleMaterial);
                        
                        // Position inside the pan
                        sizzle.position.set(
                            -2 + (Math.random() - 0.5) * 0.3,
                            1.65,
                            -4.5 + (Math.random() - 0.5) * 0.3
                        );
                        
                        // Simplified properties
                        sizzle.userData = {
                            createTime: Date.now(),
                            lifetime: 600, // 0.6 seconds
                            velocity: new THREE.Vector3(0, 0.01, 0) // Simple upward movement
                        };
                        
                        scene.add(sizzle);
                    }
                    
                    // Simplified animation of existing particles
                    scene.children.forEach(child => {
                        if (child.userData && child.userData.createTime) {
                            const age = Date.now() - child.userData.createTime;
                            
                            // Apply velocity
                            if (child.userData.velocity) {
                                child.position.add(child.userData.velocity);
                            }
                            
                            // Fade out based on age
                            if (age > child.userData.lifetime) {
                                scene.remove(child);
                            } else {
                                // Simple opacity fade
                                if (child.material && child.material.opacity !== undefined) {
                                    child.material.opacity = 0.5 * (1 - age / child.userData.lifetime);
                                }
                            }
                        }
                    });
                }
            },
            // Add virtual food in the pan
            food: {
                animation: (delta) => {
                    // Virtual food animation (not visible but used for effects)
                    // This is just for the animation logic, we're not actually adding visible food
                }
            }
        }
    });
    
    // Simplify the sink animation to prevent browser crashes
    stations.push({
        name: 'Sink',
        position: new THREE.Vector3(3, 0, -4.5),
        radius: 1.5,
        objects: {
            water: {
                animation: (delta) => {
                    // Create a much simpler water stream
                    const time = Date.now() * 0.001;
                    
                    // Significantly reduce the number of particles
                    if (Math.random() > 0.8) { // Only 20% chance to create a particle
                        // Create water droplet - simplified
                        const waterGeometry = new THREE.SphereGeometry(0.03, 4, 4); // Lower poly
                        const waterMaterial = new THREE.MeshBasicMaterial({ // Using basic material to reduce complexity
                            color: 0x66CCFF,
                            transparent: true,
                            opacity: 0.7
                        });
                        
                        const waterDrop = new THREE.Mesh(waterGeometry, waterMaterial);
                        waterDrop.position.set(3, 1.7, -4.7);
                        
                        // Simplified physics with fewer properties
                        waterDrop.userData = {
                            velocity: new THREE.Vector3(0, -0.02, 0),
                            createTime: Date.now(),
                            lifetime: 1000 // 1 second
                        };
                        
                        scene.add(waterDrop);
                    }
                    
                    // Simplified animation for existing water particles
                    // Limit the maximum number of water particles
                    let waterParticleCount = 0;
                    scene.children.forEach(child => {
                        if (child.userData && child.userData.velocity && 
                            child.material && child.material.color && 
                            child.material.color.getHex() === 0x66CCFF) {
                            
                            waterParticleCount++;
                            
                            // Apply velocity
                            child.position.add(child.userData.velocity);
                            
                            // Remove water after lifetime or if it goes below sink
                            const age = Date.now() - child.userData.createTime;
                            if (age > child.userData.lifetime || child.position.y < 1.0) {
                                scene.remove(child);
                            }
                        }
                    });
                    
                    // Remove excess water particles if there are too many
                    if (waterParticleCount > 20) { // Limit to 20 particles max
                        let removed = 0;
                        scene.children.forEach(child => {
                            if (removed < waterParticleCount - 20 &&
                                child.userData && child.userData.velocity && 
                                child.material && child.material.color && 
                                child.material.color.getHex() === 0x66CCFF) {
                                scene.remove(child);
                                removed++;
                            }
                        });
                    }
                    
                    // Static water pool instead of animated
                    if (!sinkWaterPool) {
                        const poolGeometry = new THREE.CircleGeometry(0.5, 8); // Lower poly
                        const poolMaterial = new THREE.MeshBasicMaterial({ // Using basic material
                            color: 0x66CCFF,
                            transparent: true,
                            opacity: 0.3
                        });
                        
                        sinkWaterPool = new THREE.Mesh(poolGeometry, poolMaterial);
                        sinkWaterPool.rotation.x = -Math.PI / 2;
                        sinkWaterPool.position.set(3, 1.1, -4.5);
                        scene.add(sinkWaterPool);
                    }
                },
                // Simplify tap animation
                tap: {
                    animation: (delta) => {
                        // Very subtle tap rotation
                        tapNozzle.rotation.z = Math.PI / 2;
                    }
                }
            }
        }
    });
    
    // Enhance the fridge animation with door opening and interior contents
    // First, let's add a variable to track if the fridge is open
    let fridgeIsOpen = false;
    let fridgeOpenAmount = 0; // 0 = closed, 1 = fully open
    let fridgeContents = null;

    // Create fridge contents function
    const createFridgeContents = () => {
        const contentsGroup = new THREE.Group();
        
        // Fridge shelves
        for (let i = 0; i < 3; i++) {
            const shelfGeometry = new THREE.BoxGeometry(1.8, 0.05, 1.3);
            const shelfMaterial = new THREE.MeshStandardMaterial({
                color: 0xEEEEEE,
                metalness: 0.7,
                roughness: 0.3
            });
            const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
            shelf.position.set(0, -0.5 + i * 1.2, 0);
            contentsGroup.add(shelf);
            
            // Add random food items on each shelf
            for (let j = 0; j < 3 + Math.floor(Math.random() * 3); j++) {
                // Randomize item type
                let itemGeometry, itemMaterial;
                const itemType = Math.floor(Math.random() * 4);
                
                switch(itemType) {
                    case 0: // Milk carton
                        itemGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.3);
                        itemMaterial = new THREE.MeshStandardMaterial({
                            color: 0xFFFFFF,
                            roughness: 0.7
                        });
                        break;
                    case 1: // Juice bottle
                        itemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8);
                        itemMaterial = new THREE.MeshStandardMaterial({
                            color: 0xFFA500,
                            roughness: 0.5,
                            transparent: true,
                            opacity: 0.8
                        });
                        break;
                    case 2: // Round container
                        itemGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.2, 16);
                        itemMaterial = new THREE.MeshStandardMaterial({
                            color: 0x66CCFF,
                            roughness: 0.5
                        });
                        break;
                    case 3: // Small box
                        itemGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.2);
                        itemMaterial = new THREE.MeshStandardMaterial({
                            color: 0xCCFF66,
                            roughness: 0.7
                        });
                        break;
                }
                
                const item = new THREE.Mesh(itemGeometry, itemMaterial);
                
                // Position on shelf
                item.position.set(
                    (Math.random() - 0.5) * 1.4, // Across shelf
                    -0.5 + i * 1.2 + 0.2 + (itemType === 0 ? 0.1 : 0), // On shelf, taller for milk
                    (Math.random() - 0.5) * 0.9 // Front to back
                );
                
                // Random rotation for variety
                item.rotation.y = Math.random() * Math.PI;
                
                contentsGroup.add(item);
            }
        }
        
        // Door shelves for condiments
        const doorShelfGeometry = new THREE.BoxGeometry(0.3, 0.05, 1.2);
        const doorShelfMaterial = new THREE.MeshStandardMaterial({
            color: 0xEEEEEE,
            metalness: 0.7,
            roughness: 0.3
        });
        
        // Add door shelves
        for (let i = 0; i < 2; i++) {
            const doorShelf = new THREE.Mesh(doorShelfGeometry, doorShelfMaterial);
            doorShelf.position.set(0.7, 0 + i * 1.2, 0);
            contentsGroup.add(doorShelf);
            
            // Add condiment bottles
            for (let j = 0; j < 2 + Math.floor(Math.random() * 2); j++) {
                const bottleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
                const bottleMaterial = new THREE.MeshStandardMaterial({
                    color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
                    roughness: 0.5,
                    transparent: true,
                    opacity: 0.9
                });
                
                const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
                bottle.position.set(
                    0.7, // On door shelf
                    0.2 + i * 1.2, // Above shelf
                    (Math.random() - 0.5) * 0.8 // Along shelf
                );
                
                contentsGroup.add(bottle);
            }
        }
        
        // Add interior light
        const lightGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            emissive: 0xFFFFFF,
            emissiveIntensity: 1
        });
        
        const interiorLight = new THREE.Mesh(lightGeometry, lightMaterial);
        interiorLight.position.set(-0.8, 1.5, 0);
        contentsGroup.add(interiorLight);
        
        // Add point light inside
        const fridgeLight = new THREE.PointLight(0xFFFFFF, 0.8, 2);
        fridgeLight.position.set(-0.5, 1.5, 0);
        contentsGroup.add(fridgeLight);
        
        return contentsGroup;
    };

    // Update the fridge animation
    stations.push({
        name: 'Fridge',
        position: new THREE.Vector3(-8.5, 0, -5),
        radius: 1.5,
        objects: {
            door: {
                object: fridge,
                originalRotation: fridge.rotation.clone(),
                animation: (delta) => {
                    // Simplified fridge animation with direct opening instead of toggling
                    if (activeAnimations['Fridge']) {
                        // Open the fridge when active
                        fridge.rotation.y = Math.PI * 0.4; // Fixed open position
                        
                        // Position the handle appropriately
                        const angle = fridge.rotation.y;
                        fridgeHandle.position.x = -7.5 + Math.sin(angle) * 1;
                        fridgeHandle.position.z = -4.2 + (1 - Math.cos(angle)) * 1;
                        fridgeHandle.rotation.y = angle;
                        
                        // Create contents if they don't exist
                        if (!fridgeContents) {
                            fridgeContents = createFridgeContents();
                            // Position inside the fridge
                            fridgeContents.position.set(-8.5, 2, -5);
                            scene.add(fridgeContents);
                        }
                        
                        // Show contents
                        if (fridgeContents) {
                            fridgeContents.visible = true;
                        }
                        
                        // Simple cold mist effect (reduced frequency)
                        if (Math.random() > 0.95) {
                            const mistGeometry = new THREE.SphereGeometry(0.1, 4, 4); // Simplified geometry
                            const mistMaterial = new THREE.MeshBasicMaterial({
                                color: 0xCCCCFF,
                                transparent: true,
                                opacity: 0.2
                            });
                            
                            const mist = new THREE.Mesh(mistGeometry, mistMaterial);
                            mist.position.set(-8.5 + 1.2, 1 + Math.random(), -5 + 1.2);
                            
                            // Simplified physics
                            mist.userData = {
                                velocity: new THREE.Vector3(0.005, 0.01, 0.005),
                                createTime: Date.now(),
                                lifetime: 1000 // 1 second
                            };
                            
                            scene.add(mist);
                        }
                    } else {
                        // Close the fridge when not active
                        fridge.rotation.y = 0;
                        
                        // Reset handle position
                        fridgeHandle.position.x = -7.5;
                        fridgeHandle.position.z = -4.2;
                        fridgeHandle.rotation.y = 0;
                        
                        // Hide contents
                        if (fridgeContents) {
                            fridgeContents.visible = false;
                        }
                    }
                    
                    // Simple animation for mist particles
                    scene.children.forEach(child => {
                        if (child.userData && child.userData.velocity && 
                            child.material && child.material.color && 
                            child.material.color.getHex() === 0xCCCCFF) {
                            
                            // Apply velocity
                            child.position.add(child.userData.velocity);
                            
                            // Fade out and remove after lifetime
                            const age = Date.now() - child.userData.createTime;
                            if (age > child.userData.lifetime) {
                                scene.remove(child);
                            } else {
                                child.material.opacity = 0.2 * (1 - age / child.userData.lifetime);
                            }
                        }
                    });
                }
            }
        }
    });
    
    return stations;
};

// Create kitchen island
const createKitchenIsland = () => {
    // Kitchen floor - with wood texture
    const floorGeometry = new THREE.BoxGeometry(20, 0.5, 12);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        roughness: 0.8,
        map: textureLoader.load('assets/textures/kitchen/wood.jpg')
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Kitchen wall - with wall texture
    const wallGeometry = new THREE.BoxGeometry(20, 4, 0.2);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        roughness: 0.9,
        map: textureLoader.load('assets/textures/kitchen/wall.jpg')
    });
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 2, -6);
    backWall.receiveShadow = true;
    scene.add(backWall);
    
    // Side walls - with wall texture
    const sideWallGeometry = new THREE.BoxGeometry(0.2, 4, 12);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-10, 2, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);
    
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(10, 2, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);
    
    // Counter - with tile texture
    const counterGeometry = new THREE.BoxGeometry(14, 1, 2.5);
    const counterMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.4,
        map: textureLoader.load('assets/textures/kitchen/tiles.jpg')
    });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.set(1, 0.5, -4.5);  // Shifted more to the right
    counter.castShadow = true;
    counter.receiveShadow = true;
    scene.add(counter);
    
    // Counter base - with wood texture
    const baseGeometry = new THREE.BoxGeometry(14, 1, 2);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.6,
        map: textureLoader.load('assets/textures/kitchen/wood.jpg')
    });
    const counterBase = new THREE.Mesh(baseGeometry, baseMaterial);
    counterBase.position.set(1, 0, -4.5);  // Shifted more to the right
    counterBase.castShadow = true;
    counterBase.receiveShadow = true;
    scene.add(counterBase);
    
    return {
        floor,
        counter,
        walls: [backWall, leftWall, rightWall]
    };
};

// Instructions overlay
const blocker = document.createElement('div');
blocker.id = 'blocker';
blocker.style.position = 'absolute';
blocker.style.width = '100%';
blocker.style.height = '100%';
blocker.style.backgroundColor = 'rgba(0,0,0,0.5)';
blocker.style.display = 'flex';
blocker.style.justifyContent = 'center';
blocker.style.alignItems = 'center';
blocker.style.flexDirection = 'column';
blocker.style.zIndex = '10';
document.body.appendChild(blocker);

const instructions = document.createElement('div');
instructions.style.color = 'white';
instructions.style.fontSize = '24px';
instructions.style.textAlign = 'center';
instructions.style.maxWidth = '600px';
instructions.innerHTML = `
    <h1>Cooking Island (Lite)</h1>
    <p>Click to play</p>
    <p>WASD = Move, Mouse = Look, E = Interact</p>
    <p>SHIFT = Sprint, SPACE = Jump</p>
    <p>L = Toggle Light Animation</p>
    <p>ESC = Pause</p>
    <p style="color: #9966ff;">Explore the kitchen and interact with the cooking stations!</p>
`;
blocker.appendChild(instructions);

// Interaction prompt
const interactionPrompt = document.createElement('div');
interactionPrompt.style.position = 'absolute';
interactionPrompt.style.bottom = '20px';
interactionPrompt.style.width = '100%';
interactionPrompt.style.textAlign = 'center';
interactionPrompt.style.color = 'white';
interactionPrompt.style.fontSize = '24px';
interactionPrompt.style.fontFamily = 'Arial, sans-serif';
interactionPrompt.style.display = 'none';
interactionPrompt.style.zIndex = '5';
interactionPrompt.textContent = 'Press E to cook';
document.body.appendChild(interactionPrompt);

// Track active message elements for cleanup
let activeMessages = [];

// Function to create and animate a message
function showAnimatedMessage(text, duration = 5000) {
    // Clean up any existing messages that are still fading out
    const now = Date.now();
    activeMessages = activeMessages.filter(msg => {
        if (now > msg.removeTime) {
            if (msg.element.parentNode) {
                document.body.removeChild(msg.element);
            }
            return false;
        }
        return true;
    });
    
    // Start fading out existing messages
    activeMessages.forEach(msg => {
        // Trigger immediate fade out
        msg.element.style.opacity = 0;
        msg.removeTime = now + 500; // Remove after 0.5s
    });
    
    // Create new message
    const message = document.createElement('div');
    message.textContent = text;
    message.style.position = 'absolute';
    message.style.top = '20px';
    message.style.width = '100%';
    message.style.textAlign = 'center';
    message.style.color = 'white';
    message.style.fontSize = '24px';
    message.style.fontFamily = 'Arial, sans-serif';
    message.style.zIndex = '5';
    message.style.opacity = '0';
    message.style.transition = 'opacity 0.5s ease-in-out';
    document.body.appendChild(message);
    
    // Fade in
    setTimeout(() => {
        message.style.opacity = '1';
    }, 10);
    
    // Track the message for cleanup
    const messageInfo = {
        element: message,
        removeTime: now + duration
    };
    activeMessages.push(messageInfo);
    
    // Fade out and remove after duration
    setTimeout(() => {
        message.style.opacity = '0';
    }, duration - 500);
    
    return messageInfo;
}

// Pointer lock handling
renderer.domElement.addEventListener('click', () => {
    console.log('Canvas clicked, attempting to lock...');
    if (!controls.isLocked) {
        renderer.domElement.requestPointerLock();
    }
});

// Also keep the blocker click handler for fullscreen clicking
blocker.addEventListener('click', () => {
    console.log('Blocker clicked, attempting to lock...');
    if (!controls.isLocked) {
        renderer.domElement.requestPointerLock();
    }
});

// Handle pointer lock state changes
document.addEventListener('pointerlockchange', () => {
    const isLocked = document.pointerLockElement === renderer.domElement;
    
    if (isLocked) {
        blocker.style.display = 'none';
        controls.lock();
    } else {
        blocker.style.display = 'flex';
        controls.unlock();
    }
});

// Handle pointer lock errors
document.addEventListener('pointerlockerror', (event) => {
    console.error('Pointer lock error:', event);
    alert('Pointer lock failed. This browser might not support this feature or requires HTTPS.');
});

// Key event listeners
document.addEventListener('keydown', (event) => {
    console.log('Key pressed:', event.code);
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            moveForward = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            moveLeft = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            moveBackward = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            moveRight = true;
            break;
        case 'KeyE':
            interact();
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            isSprinting = true;
            break;
        case 'Space':
            if (canJump) {
                velocity.y = 5;
                canJump = false;
            }
            break;
        case 'KeyL':
            // Toggle light animation
            lightAnimationEnabled = !lightAnimationEnabled;
            console.log(`Light animation: ${lightAnimationEnabled ? 'ON' : 'OFF'}`);
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            moveForward = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            moveLeft = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            moveBackward = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            moveRight = false;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            isSprinting = false;
            break;
    }
});

// Define the collision objects for the player
const collisionObjects = [];

function addCollisionBox(minX, minY, minZ, maxX, maxY, maxZ) {
    collisionObjects.push({
        min: new THREE.Vector3(minX, minY, minZ),
        max: new THREE.Vector3(maxX, maxY, maxZ)
    });
}

// Set up collision boxes
function setupCollisions() {
    // Walls
    addCollisionBox(-10, 0, -6, 10, 4, -5.9); // Back wall
    addCollisionBox(-10.1, 0, -6, -9.9, 4, 6);   // Left wall
    addCollisionBox(9.9, 0, -6, 10.1, 4, 6);     // Right wall
    
    // Counter - adjusted to match new position and size
    addCollisionBox(-6, 0, -5.5, 8, 1.5, -3.5);
    
    // Fridge - separate from counter
    addCollisionBox(-9.5, 0, -5.7, -7.5, 4, -4.0);
    
    // Breakfast model area
    addCollisionBox(6, 0, -5.5, 8, 1.5, -3.5);
}

// Initialize collisions
setupCollisions();

// Create kitchen island and stations
const kitchen = createKitchenIsland();
const cookingStations = createCookingStations();

// Load custom 3D models
loadCustomModels();

// Active animations
const activeAnimations = {};

// Interaction detection
let nearbyStation = null;

// Clock for animation
const clock = new THREE.Clock();

// Head bobbing
let headBobTimer = 0;
const headBobFrequency = 10;
const headBobHeight = 0.05;

// Light animation parameters
let lightAnimationEnabled = true;

// Check if player is near any interactive station
function checkInteractions() {
    // Reset nearby station
    nearbyStation = null;
    
    // Get player position (ignoring Y)
    const playerPosition = new THREE.Vector3(
        camera.position.x,
        0,
        camera.position.z
    );
    
    // Check distance to each station
    for (const station of cookingStations) {
        const distance = playerPosition.distanceTo(station.position);
        
        if (distance < station.radius) {
            nearbyStation = station;
            
            // Different prompt text based on station
            let promptText = '';
            switch(station.name) {
                case 'Cutting Board':
                    promptText = 'Press E to chop vegetables';
                    break;
                case 'Stove':
                    promptText = 'Press E to cook on stove';
                    break;
                case 'Sink':
                    promptText = 'Press E to wash hands';
                    break;
                case 'Fridge':
                    promptText = 'Press E to open fridge';
                    break;
                case 'Breakfast':
                    promptText = 'Press E to enjoy breakfast';
                    break;
                default:
                    promptText = `Press E to use ${station.name}`;
            }
            
            interactionPrompt.textContent = promptText;
            interactionPrompt.style.display = 'block';
            return;
        }
    }
    
    // No nearby station
    interactionPrompt.style.display = 'none';
}

// Interact with nearby station
function interact() {
    if (nearbyStation && controls.isLocked) {
        const stationName = nearbyStation.name;
        
        // If station is already active, do nothing
        if (activeAnimations[stationName]) {
            return;
        }
        
        console.log(`Interacting with ${stationName}`);
        
        // Activate station animations
        activeAnimations[stationName] = {
            station: nearbyStation,
            startTime: Date.now(),
            duration: 5000 // 5 seconds
        };
        
        // Different messages for different stations
        let messageText = '';
        switch(stationName) {
            case 'Cutting Board':
                messageText = 'Chopping vegetables...';
                break;
            case 'Stove':
                messageText = 'Firing up the stove...';
                break;
            case 'Sink':
                messageText = 'Washing your hands...';
                break;
            case 'Fridge':
                messageText = 'Looking for ingredients...';
                break;
            case 'Breakfast':
                messageText = 'Enjoying a delicious breakfast!';
                break;
            default:
                messageText = `Using the ${stationName}...`;
        }
        
        // Use the new animated message system
        const messageInfo = showAnimatedMessage(messageText, 5000);
        
        // Remove animation after duration
        setTimeout(() => {
            delete activeAnimations[stationName];
        }, 5000);
    }
}

// Check for collisions and return corrected position
function checkCollisions(position, radius = 0.5) {
    for (const box of collisionObjects) {
        // Calculate the closest point within the box to the position
        const closestPoint = new THREE.Vector3(
            Math.max(box.min.x, Math.min(position.x, box.max.x)),
            Math.max(box.min.y, Math.min(position.y, box.max.y)),
            Math.max(box.min.z, Math.min(position.z, box.max.z))
        );
        
        // Calculate distance from closest point to position
        const distance = position.distanceTo(closestPoint);
        
        // If we're colliding
        if (distance < radius) {
            // Calculate push direction
            const pushDir = new THREE.Vector3().subVectors(position, closestPoint).normalize();
            
            // Push out of collision
            const pushDistance = radius - distance;
            position.add(pushDir.multiplyScalar(pushDistance));
        }
    }
    
    return position;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update FPS counter
    updateFPS();
    
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();
    
    // Clean up expired messages
    const now = Date.now();
    activeMessages = activeMessages.filter(msg => {
        if (now > msg.removeTime) {
            if (msg.element.parentNode) {
                document.body.removeChild(msg.element);
            }
            return false;
        }
        return true;
    });
    
    // Animate lights
    if (lightAnimationEnabled) {
        const time = clock.getElapsedTime();
        
        // Animate the kitchen lights
        // First kitchen light - center warm light - pulsing
        const mainLight = kitchenLights[0];
        mainLight.light.intensity = 2 + Math.sin(time * 1.5) * 0.5;
        mainLight.bulb.material.emissiveIntensity = 0.7 + Math.sin(time * 1.5) * 0.3;
        
        // Second kitchen light - cutting board warm light - steady
        const cuttingLight = kitchenLights[1];
        
        // Third kitchen light - purple accent light - color and intensity changes
        const accentLight = kitchenLights[2];
        accentLight.light.intensity = 1.2 + Math.sin(time * 2) * 0.5;
        accentLight.bulb.material.emissiveIntensity = 0.8 + Math.sin(time * 2) * 0.4;
        
        // Occasional subtle swinging of lamps
        mainLight.group.rotation.z = Math.sin(time * 0.8) * 0.05;
        cuttingLight.group.rotation.z = Math.sin(time * 0.6 + 1) * 0.03;
        accentLight.group.rotation.z = Math.sin(time * 0.7 + 2) * 0.04;
        
        // Gently change the directional light color
        const hue = (time * 0.05) % 1;
        directionalLight.color.setHSL(hue, 0.1, 0.9);
    }
    
    // Update debug info
    updateDebugInfo();
    
    if (controls.isLocked) {
        // Calculate movement direction
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveLeft) - Number(moveRight);
        
        // Normalize direction vector for consistent movement speed
        if (direction.length() > 0) {
            direction.normalize();
        }
        
        // Apply gravity
        velocity.y -= 9.8 * delta;
        
        // Apply movement
        const actualSpeed = playerSpeed * (isSprinting ? sprintMultiplier : 1) * delta;
        
        // Move player
        if (moveForward || moveBackward) {
            controls.moveForward(direction.z * actualSpeed);
        }
        
        if (moveLeft || moveRight) {
            controls.moveRight(-direction.x * actualSpeed);
        }
        
        // Update Y position (for jumping/gravity)
        controls.object.position.y += velocity.y * delta;
        
        // Floor collision check
        if (controls.object.position.y < playerHeight) {
            velocity.y = 0;
            controls.object.position.y = playerHeight;
            canJump = true;
        }
        
        // Head bobbing when moving on ground
        if ((moveForward || moveBackward || moveLeft || moveRight) && canJump) {
            headBobTimer += delta * 10;
            controls.object.position.y = playerHeight + Math.sin(headBobTimer) * headBobHeight;
        }
        
        // Collision detection
        const playerPosition = controls.object.position.clone();
        const correctedPosition = checkCollisions(playerPosition);
        controls.object.position.copy(correctedPosition);
        
        // Update player shadow position
        playerShadow.position.x = controls.object.position.x;
        playerShadow.position.z = controls.object.position.z;
        
        // Check for interactions with cooking stations
        checkInteractions();
    }
    
    // Update active animations
    for (const key in activeAnimations) {
        const animation = activeAnimations[key];
        const station = animation.station;
        
        // Apply animations to station objects
        for (const objKey in station.objects) {
            const obj = station.objects[objKey];
            if (obj.animation) {
                obj.animation(delta);
            }
        }
    }
    
    // Animate water drops
    scene.children.forEach(child => {
        if (child.geometry && child.geometry.type === 'SphereGeometry' && child.material.color.getHex() === 0x66CCFF) {
            child.position.y -= 0.05;
        }
    });
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Debug helper
console.log('Game initialized, click to start');

// Start animation loop
animate(); 

// Fix the cute_breakfast model animation
function loadCustomModels() {
    // Load cute breakfast model
    gltfLoader.load(
        'assets/models/cute_breakfast.glb',
        (gltf) => {
            const breakfast = gltf.scene;
            
            // Scale and position the model - even smaller now
            breakfast.scale.set(0.15, 0.15, 0.15);  // Reduced scale further
            breakfast.position.set(7, 1.05, -4.5); // Place on right side of counter with higher y position
            breakfast.rotation.y = -Math.PI / 4; // Rotate slightly for better view
            
            // Make sure the model casts and receives shadows
            breakfast.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Enhance materials if needed
                    if (child.material) {
                        child.material.roughness = 0.7;
                    }
                }
            });
            
            // Add an interactive station for the breakfast
            cookingStations.push({
                name: 'Breakfast',
                position: new THREE.Vector3(7, 0, -4.5),
                radius: 2,
                objects: {
                    food: {
                        object: breakfast,
                        animation: (delta) => {
                            // Improved animation that keeps the model above the counter
                            const time = Date.now() * 0.001;
                            
                            // Gentle floating animation with higher minimum height
                            breakfast.position.y = 1.05 + Math.sin(time * 0.6) * 0.08; // Slower, more gentle movement
                            
                            // Ensure it never goes below the counter
                            if (breakfast.position.y < 1.05) {
                                breakfast.position.y = 1.05;
                            }
                            
                            // Gentle rotation
                            breakfast.rotation.y = -Math.PI / 4 + Math.sin(time * 0.4) * 0.1;
                            
                            // Add slight tilting
                            breakfast.rotation.x = Math.sin(time * 0.3) * 0.03;
                            breakfast.rotation.z = Math.cos(time * 0.5) * 0.03;
                            
                            // Add slight horizontal movement
                            breakfast.position.x = 7 + Math.sin(time * 0.2) * 0.05;
                            breakfast.position.z = -4.5 + Math.cos(time * 0.3) * 0.05;
                            
                            // Add dynamic bouncing effect to different parts
                            breakfast.traverse((child) => {
                                if (child.isMesh && child.name) {
                                    // Use the mesh name to create slightly different animation phases
                                    const phase = child.name.charCodeAt(0) % 10 * 0.1;
                                    child.position.y = Math.sin(time * 0.8 + phase) * 0.02;
                                    
                                    // Add slight rotation to pieces
                                    if (child.userData.originalRotation === undefined) {
                                        child.userData.originalRotation = {
                                            x: child.rotation.x,
                                            y: child.rotation.y,
                                            z: child.rotation.z
                                        };
                                    }
                                    
                                    // Apply slight rotation variations
                                    child.rotation.x = child.userData.originalRotation.x + Math.sin(time * 0.5 + phase) * 0.05;
                                    child.rotation.z = child.userData.originalRotation.z + Math.cos(time * 0.4 + phase) * 0.05;
                                }
                            });
                        }
                    }
                }
            });
            
            scene.add(breakfast);
            breakfastModelLoaded = true;
            console.log('Breakfast model loaded successfully');
        },
        (xhr) => {
            console.log('Breakfast: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error('An error happened loading the Breakfast model', error);
        }
    );
} 