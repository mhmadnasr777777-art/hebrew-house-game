// Main Game Engine
class HebrewHouseGame {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') || this.createCanvas() });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 50, 100);

        // Player controls
        this.player = {
            position: new THREE.Vector3(0, 0, 5),
            velocity: new THREE.Vector3(),
            speed: 0.15,
            jumpForce: 0.3,
            isGrounded: true,
            yaw: 0,
            pitch: 0
        };

        this.keys = {};
        this.mouse = { x: 0, y: 0, locked: false };
        this.currentRoom = 'living_room';
        this.interactableObjects = [];
        this.raycastObjects = [];

        this.setupCamera();
        this.setupLights();
        this.setupControls();
        this.buildHouse();
        this.setupInteractables();
        this.startGameLoop();

        window.addEventListener('resize', () => this.onWindowResize());
        
        // Welcome message
        setTimeout(() => {
            window.audioSystem.speak(window.audioSystem.getHebrewPhrase('welcome'));
        }, 500);
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'canvas';
        document.getElementById('gameContainer').appendChild(canvas);
        return canvas;
    }

    setupCamera() {
        this.camera.position.copy(this.player.position);
        this.camera.rotation.order = 'YXZ';
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
    }

    setupControls() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('click', (e) => this.onClick(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    }

    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
    }

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    onMouseMove(e) {
        if (!this.mouse.locked) {
            document.getElementById('canvas').requestPointerLock();
            return;
        }

        const sensitivity = 0.002;
        this.player.yaw -= e.movementX * sensitivity;
        this.player.pitch -= e.movementY * sensitivity;

        this.player.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.pitch));

        this.updateCameraRotation();
    }

    onPointerLockChange() {
        this.mouse.locked = document.pointerLockElement === document.getElementById('canvas');
    }

    onClick(e) {
        this.checkInteraction();
    }

    updateCameraRotation() {
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.player.yaw;
        this.camera.rotation.x = this.player.pitch;
    }

    buildHouse() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(30, 40);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(30, 40);
        const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.y = 3;
        ceiling.rotation.x = Math.PI / 2;
        ceiling.receiveShadow = true;
        this.scene.add(ceiling);

        // Walls
        this.addWall(-15, 1.5, 0, 1, 3, 40, 0xff9966); // Left wall
        this.addWall(15, 1.5, 0, 1, 3, 40, 0xff9966);  // Right wall
        this.addWall(0, 1.5, -20, 30, 3, 1, 0xffcc99); // Front wall
        this.addWall(0, 1.5, 20, 30, 3, 1, 0xffcc99);  // Back wall

        // Interior walls (dividing rooms)
        this.addWall(0, 1.5, 0, 1, 3, 15, 0xcccccc); // Divider between living room and kitchen

        // Create rooms
        this.createLivingRoom();
        this.createKitchen();
        this.createBedroom();
        this.createBathroom();
    }

    addWall(x, y, z, width, height, depth, color) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({ color });
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(x, y, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.scene.add(wall);
        this.raycastObjects.push(wall);
    }

    createLivingRoom() {
        // Sofa
        const sofaGeometry = new THREE.BoxGeometry(3, 1, 1.5);
        const sofaMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const sofa = new THREE.Mesh(sofaGeometry, sofaMaterial);
        sofa.position.set(-5, 0.5, 5);
        sofa.castShadow = true;
        this.scene.add(sofa);
        this.addInteractable(sofa, 'sofa', 'סלון');

        // Coffee Table
        const tableGeometry = new THREE.BoxGeometry(1.5, 0.5, 1.5);
        const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.set(0, 0.25, 5);
        table.castShadow = true;
        this.scene.add(table);
        this.addInteractable(table, 'table', 'שולחן');

        // Lamp
        const lampStandGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
        const lampMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const lampStand = new THREE.Mesh(lampStandGeometry, lampMaterial);
        lampStand.position.set(-7, 0.75, 8);
        lampStand.castShadow = true;
        this.scene.add(lampStand);

        const lampHeadGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const lampHeadMaterial = new THREE.MeshStandardMaterial({ color: 0xffff99, emissive: 0xffff00, emissiveIntensity: 0.5 });
        const lampHead = new THREE.Mesh(lampHeadGeometry, lampHeadMaterial);
        lampHead.position.set(-7, 2, 8);
        this.scene.add(lampHead);
        this.addInteractable(lampHead, 'lamp', 'מנורה');

        // Window
        const windowGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
        const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(-14.95, 1.5, 10);
        this.scene.add(window);
        this.addInteractable(window, 'window', 'חלון');
    }

    createKitchen() {
        // Fridge
        const fridgeGeometry = new THREE.BoxGeometry(0.8, 2, 0.6);
        const fridgeMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const fridge = new THREE.Mesh(fridgeGeometry, fridgeMaterial);
        fridge.position.set(5, 1, -8);
        fridge.castShadow = true;
        this.scene.add(fridge);
        this.addInteractable(fridge, 'fridge', 'מטבח');

        // Sink
        const sinkGeometry = new THREE.BoxGeometry(1.2, 0.5, 0.6);
        const sinkMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const sink = new THREE.Mesh(sinkGeometry, sinkMaterial);
        sink.position.set(0, 0.9, -10);
        sink.castShadow = true;
        this.scene.add(sink);
        this.addInteractable(sink, 'sink', 'כיור');

        // Dining Table
        const diningTableGeometry = new THREE.BoxGeometry(2, 0.8, 1.2);
        const diningTableMaterial = new THREE.MeshStandardMaterial({ color: 0x8b6914 });
        const diningTable = new THREE.Mesh(diningTableGeometry, diningTableMaterial);
        diningTable.position.set(-3, 0.4, -12);
        diningTable.castShadow = true;
        this.scene.add(diningTable);
        this.addInteractable(diningTable, 'table', 'שולחן דינינג');
    }

    createBedroom() {
        // Bed
        const bedGeometry = new THREE.BoxGeometry(2, 1, 3);
        const bedMaterial = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
        const bed = new THREE.Mesh(bedGeometry, bedMaterial);
        bed.position.set(8, 0.5, 5);
        bed.castShadow = true;
        this.scene.add(bed);
        this.addInteractable(bed, 'bed', 'חדר שינה');

        // Wardrobe
        const wardrobeGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.6);
        const wardrobeMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
        const wardrobe = new THREE.Mesh(wardrobeGeometry, wardrobeMaterial);
        wardrobe.position.set(10, 1.25, 8);
        wardrobe.castShadow = true;
        this.scene.add(wardrobe);
        this.addInteractable(wardrobe, 'wardrobe', 'ארון');
    }

    createBathroom() {
        // Bathtub
        const bathtubGeometry = new THREE.BoxGeometry(1.5, 0.8, 2.5);
        const bathtubMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const bathtub = new THREE.Mesh(bathtubGeometry, bathtubMaterial);
        bathtub.position.set(10, 0.4, -8);
        bathtub.castShadow = true;
        this.scene.add(bathtub);
        this.addInteractable(bathtub, 'bathtub', 'חדר אמבטיה');

        // Mirror
        const mirrorGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.1);
        const mirrorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.1
        });
        const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        mirror.position.set(14.95, 1.2, -10);
        this.scene.add(mirror);
        this.addInteractable(mirror, 'mirror', 'מראה');

        // Sink
        const bathroomSinkGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.5);
        const bathroomSinkMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const bathroomSink = new THREE.Mesh(bathroomSinkGeometry, bathroomSinkMaterial);
        bathroomSink.position.set(12, 0.9, -10);
        bathroomSink.castShadow = true;
        this.scene.add(bathroomSink);
        this.addInteractable(bathroomSink, 'sink', 'כיור');
    }

    addInteractable(mesh, type, roomName) {
        this.interactableObjects.push({
            mesh,
            type,
            roomName,
            distance: Infinity
        });
    }

    setupInteractables() {
        // Additional interactables setup if needed
    }

    checkInteraction() {
        if (this.interactableObjects.length === 0) return;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);

        const intersects = raycaster.intersectObjects(
            this.interactableObjects.map(obj => obj.mesh)
        );

        if (intersects.length > 0) {
            const closestMesh = intersects[0].object;
            const interactable = this.interactableObjects.find(obj => obj.mesh === closestMesh);

            if (interactable) {
                window.audioSystem.playSound('interaction');
                const phrase = window.audioSystem.getHebrewPhrase(interactable.type);
                window.audioSystem.speak(phrase);
                
                // Update UI
                document.getElementById('hebrewText').innerHTML = `<div style="color: #00ff00; margin-top: 10px;">${phrase}</div>`;
            }
        }
    }

    updatePlayer(deltaTime) {
        // Movement
        const forward = new THREE.Vector3(0, 0, -1);
        const right = new THREE.Vector3(1, 0, 0);

        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.yaw);
        right.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.yaw);

        this.player.velocity.x = 0;
        this.player.velocity.z = 0;

        if (this.keys['w']) {
            this.player.velocity.add(forward.multiplyScalar(this.player.speed));
        }
        if (this.keys['s']) {
            this.player.velocity.add(forward.multiplyScalar(-this.player.speed));
        }
        if (this.keys['d']) {
            this.player.velocity.add(right.multiplyScalar(this.player.speed));
        }
        if (this.keys['a']) {
            this.player.velocity.add(right.multiplyScalar(-this.player.speed));
        }

        // Gravity
        this.player.velocity.y -= 0.01;

        // Collision with floor
        if (this.player.position.y < 0.5) {
            this.player.position.y = 0.5;
            this.player.velocity.y = 0;
            this.player.isGrounded = true;
        } else {
            this.player.isGrounded = false;
        }

        // Jump
        if (this.keys[' '] && this.player.isGrounded) {
            this.player.velocity.y = this.player.jumpForce;
            window.audioSystem.playSound('click');
        }

        // Keep player within bounds
        this.player.position.clamp(
            new THREE.Vector3(-14, -Infinity, -19),
            new THREE.Vector3(14, Infinity, 19)
        );

        this.player.position.add(this.player.velocity);
        this.camera.position.copy(this.player.position);
    }

    startGameLoop() {
        let lastTime = Date.now();
        const animate = () => {
            const now = Date.now();
            const deltaTime = (now - lastTime) / 1000;
            lastTime = now;

            this.updatePlayer(deltaTime);
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(animate);
        };
        animate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new HebrewHouseGame();
});
