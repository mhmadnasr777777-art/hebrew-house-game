# Development Guide | دليل التطوير

## Project Structure | بنية المشروع

```
hebrew-house-game/
├── index.html              # Main HTML file
├── js/
│   ├── game.js            # Main game engine
│   └── audio.js           # Audio and text-to-speech system
├── package.json           # Project metadata
├── README.md              # Main documentation
├── GETTING_STARTED.md     # Getting started guide
├── DEVELOPMENT.md         # This file
└── .gitignore            # Git ignore rules
```

---

## Setting Up Development Environment | إعداد بيئة التطوير

### Prerequisites | المتطلبات الأساسية

```bash
# Node.js and npm (optional but recommended)
node --version
npm --version

# Python 3 (for quick server)
python3 --version

# Git (for version control)
git --version
```

### Installation | التثبيت

```bash
# Clone the repository
git clone https://github.com/mhmadnasr777777-art/hebrew-house-game.git
cd hebrew-house-game

# Install dependencies (optional)
npm install
```

### Running Development Server | تشغيل خادم التطوير

#### Option 1: Using Python (Easiest)
```bash
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser
```

#### Option 2: Using Node.js
```bash
npm install -g http-server
http-server
# Then open http://localhost:8080 in your browser
```

#### Option 3: Using Live Server (Auto-refresh)
```bash
npm install -g live-server
live-server
# Opens automatically at http://localhost:8080
```

---

## Code Structure | بنية الكود

### index.html
- **Role**: Main entry point and UI
- **Includes**: Three.js library, audio.js, game.js
- **Features**:
  - Hebrew RTL layout
  - Game container
  - UI panels for location and status
  - Controls display

### js/audio.js
- **Class**: `AudioSystem`
- **Responsibilities**:
  - Text-to-speech using Web Speech API
  - Sound effects using Web Audio API
  - Hebrew language support
- **Key Methods**:
  - `speak(text, options)` - Speaks text in Hebrew
  - `playSound(type)` - Plays sound effects
  - `getHebrewPhrase(key)` - Returns Hebrew phrases

### js/game.js
- **Class**: `HebrewHouseGame`
- **Responsibilities**:
  - 3D scene setup with Three.js
  - Player movement and controls
  - House building and room creation
  - Interaction system
  - Game loop
- **Key Methods**:
  - `setupCamera()` - Initialize camera
  - `setupLights()` - Setup lighting
  - `buildHouse()` - Create house structure
  - `createLivingRoom()`, `createKitchen()`, etc. - Create individual rooms
  - `updatePlayer()` - Handle player movement
  - `checkInteraction()` - Check for clicked objects

---

## Adding New Features | إضافة ميزات جديدة

### Adding a New Room

1. Create a new method in `HebrewHouseGame` class:

```javascript
createNewRoom() {
    // Create walls, furniture, etc.
    const furnitureGeometry = new THREE.BoxGeometry(2, 1, 1);
    const furnitureMaterial = new THREE.MeshStandardMaterial({ color: 0x123456 });
    const furniture = new THREE.Mesh(furnitureGeometry, furnitureMaterial);
    furniture.position.set(x, y, z);
    furniture.castShadow = true;
    this.scene.add(furniture);
    
    // Add to interactables
    this.addInteractable(furniture, 'type', 'Hebrew Name');
}
```

2. Call it in the `buildHouse()` method:
```javascript
this.createNewRoom();
```

### Adding a New Interactable Object

```javascript
const objectGeometry = new THREE.BoxGeometry(width, height, depth);
const objectMaterial = new THREE.MeshStandardMaterial({ color: 0xcolor });
const object = new THREE.Mesh(objectGeometry, objectMaterial);
object.position.set(x, y, z);
object.castShadow = true;
this.scene.add(object);

// Add to interactables with unique name
this.addInteractable(object, 'unique_key', 'Hebrew Description');
```

3. Add Hebrew phrase in `audio.js`:
```javascript
const phrases = {
    unique_key: "Hebrew text here"
    // ...
};
```

### Changing Colors

```javascript
// In Three.js, colors are hexadecimal
const color = new THREE.Color(0xRRGGBB);

// Common colors:
0xFF0000 = Red
0x00FF00 = Green
0x0000FF = Blue
0xFFFFFF = White
0x000000 = Black
0xFFA500 = Orange
```

### Adding Lighting

```javascript
// Point light
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(x, y, z);
pointLight.castShadow = true;
this.scene.add(pointLight);

// Spot light
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(x, y, z);
spotLight.castShadow = true;
this.scene.add(spotLight);
```

---

## Hebrew Language Support | دعم اللغة العبرية

### Adding Hebrew Text

1. In HTML files, use RTL (right-to-left):
```html
<html lang="he" dir="rtl">
```

2. In JavaScript, create Hebrew strings:
```javascript
const hebrewText = "טקסט בעברית";
window.audioSystem.speak(hebrewText);
```

3. Add phrases to `audio.js`:
```javascript
getHebrewPhrase(key) {
    const phrases = {
        my_key: "טקסט בעברית כאן"
    };
    return phrases[key] || "שלום";
}
```

---

## Performance Optimization | تحسين الأداء

### Tips for Better Performance:

1. **Reduce geometry complexity**:
```javascript
// Instead of many details, use simpler geometry
const geometry = new THREE.BoxGeometry(w, h, d);
```

2. **Use object pooling** for repeated objects:
```javascript
// Create objects once, reuse them
const geometryPool = [];
```

3. **Optimize textures**:
- Use compressed formats (WebP, etc.)
- Reduce texture resolution
- Use mipmapping

4. **Limit shadow-casting objects**:
```javascript
// Only important objects should cast shadows
object.castShadow = true;  // Use sparingly
object.receiveShadow = true;
```

5. **Use Level of Detail (LOD)**:
```javascript
// Show simpler models at distance
if (distance > 50) {
    // Use low-poly model
} else {
    // Use high-poly model
}
```

---

## Debugging | تصحيح الأخطاء

### Browser Developer Tools

```javascript
// Open DevTools: F12 or Ctrl+Shift+I

// Console errors
console.log("Debug message");
console.error("Error message");
console.warn("Warning message");

// Inspect objects
console.table(object);
console.dir(object);
```

### Three.js Debugging

```javascript
// Show wireframe
object.material.wireframe = true;

// Show bounding box
const box = new THREE.BoxHelper(object, 0xffff00);
this.scene.add(box);

// Performance monitor
const stats = new THREE.Stats();
document.body.appendChild(stats.dom);
```

---

## Building for Production | البناء للإنتاج

### Optimization Steps

1. **Minify JavaScript**:
```bash
npm install -g terser
terser js/game.js -c -m -o js/game.min.js
```

2. **Optimize Images** (if adding):
```bash
# Use ImageOptim or similar
```

3. **Test Performance**:
- Use Chrome DevTools Lighthouse
- Check FPS with performance monitor
- Test on different devices

4. **Deploy to GitHub Pages**:
```bash
# Push to main branch
git push origin main

# Enable GitHub Pages in settings
# Your game will be live at:
# https://mhmadnasr777777-art.github.io/hebrew-house-game/
```

---

## Testing | الاختبار

### Manual Testing Checklist

- [ ] All rooms accessible
- [ ] All objects interactable
- [ ] Hebrew text pronunciation correct
- [ ] Movement smooth
- [ ] Camera controls responsive
- [ ] Performance good (60 FPS)
- [ ] Works on Chrome
- [ ] Works on Firefox
- [ ] Works on Safari
- [ ] Works on Edge
- [ ] Mobile browser compatible

---

## Contributing | المساهمة

### Steps to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Create a pull request

### Code Style

- Use consistent indentation (2 spaces)
- Use descriptive variable names
- Add comments for complex logic
- Follow Three.js conventions

---

## Troubleshooting Common Issues | استكشاف المشاكل

### Issue: Objects not appearing
```javascript
// Check if object is added to scene
this.scene.add(object);

// Check camera position
console.log(this.camera.position);

// Check object position and scale
console.log(object.position, object.scale);
```

### Issue: Text-to-speech not working
```javascript
// Check if audio system is initialized
console.log(window.audioSystem);

// Test speech synthesis
window.speechSynthesis.speak(new SpeechSynthesisUtterance('test'));
```

### Issue: Controls not responsive
```javascript
// Check if event listeners are attached
console.log(this.keys);

// Verify canvas has focus
console.log(document.activeElement);
```

---

## Resources | المراجع

- [Three.js Documentation](https://threejs.org/docs/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [WebGL Specs](https://www.khronos.org/webgl/)

---

## Questions?

For questions or issues, open an issue on GitHub:
https://github.com/mhmadnasr777777-art/hebrew-house-game/issues

Happy Coding! | בהצלחה!
