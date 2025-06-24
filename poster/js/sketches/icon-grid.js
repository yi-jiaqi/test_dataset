class IconGrid {
  constructor() {
    // Canvas dimensions
    this.canvasWidth = 540;
    this.canvasHeight = 1260;
    
    // Grid properties
    this.gcdValue = 1;
    this.iconCells = [];
    
    // Visual effects
    this.vibrationSpeed = 0.1;
    
    // Icon management
    this.selectedIcons = [];
    this.iconWeights = {};
    this.iconsLoaded = false;
    this.loadingFailed = false;
    this.loadStartTime = 0;
    
    // Bind methods
    this.preload = this.preload.bind(this);
    this.setup = this.setup.bind(this);
    this.draw = this.draw.bind(this);
    this.resetSketch = this.resetSketch.bind(this);
    this.changeAspectRatio = this.changeAspectRatio.bind(this);
    this.windowResized = this.windowResized.bind(this);
  }

  async preload() {
    console.log("[IconGrid] Starting icon preload...");
    this.loadStartTime = millis();
    
    try {
      // Attempt to load Lucide with 3 second timeout
      this.lucideIcons = await this.loadLucideWithTimeout(3000);
      
      if (this.lucideIcons) {
        console.log("[IconGrid] Lucide icons loaded successfully");
        await this.initializeIcons();
        this.iconsLoaded = true;
      } else {
        console.warn("[IconGrid] Lucide icons failed to load - using fallback");
        this.loadingFailed = true;
        await this.initializeIcons(); // Still initialize with fallback
      }
    } catch (error) {
      console.error("[IconGrid] Icon loading error:", error);
      this.loadingFailed = true;
      await this.initializeIcons(); // Still initialize with fallback
    }
  }

  async loadLucideWithTimeout(timeout = 3000) {
    return new Promise(async (resolve) => {
      const timer = setTimeout(() => {
        console.warn("[IconGrid] Lucide loading timed out");
        resolve(null);
      }, timeout);

      try {
        // Method 1: Check if already loaded globally
        if (typeof window.lucide !== 'undefined') {
          console.log("[IconGrid] Found Lucide in window.lucide");
          clearTimeout(timer);
          resolve(window.lucide.icons);
          return;
        }

        // Method 2: Try dynamic import
        console.log("[IconGrid] Attempting dynamic import...");
        const lucide = await import('https://cdn.jsdelivr.net/npm/lucide@latest/+esm');
        clearTimeout(timer);
        resolve(lucide.icons);
      } catch (error) {
        console.warn("[IconGrid] Lucide import failed:", error);
        clearTimeout(timer);
        resolve(null);
      }
    });
  }

  setup() {
    console.log("[IconGrid] Setting up sketch");
    
    // Create canvas
    const canvas = createCanvas(this.canvasWidth, this.canvasHeight);
    canvas.parent('sketch-container');
    
    // Add controls
    const controls = SketchUtils.createControls(this);
    document.getElementById('sketch-container').prepend(controls);
    
    // Initialize grid
    this.calculateGCD();
    this.createGridIcons();
    
    // Setup color mode
    colorMode(HSB, 360, 100, 100, 1);
    loop();
  }

  draw() {
    background(0);
    
    // Show loading/error message if needed
    if (!this.iconsLoaded) {
      this.showLoadingMessage();
      return;
    }
    
    // Draw grid and icons
    this.drawGrid();
    this.drawIcons();

  }

  showLoadingMessage() {
    const elapsed = millis() - this.loadStartTime;
    let message = "Loading icons...";
    let alpha = 255;
    
    if (this.loadingFailed || elapsed > 5000) {
      message = "Icons unavailable\nUsing fallback shapes";
      alpha = map(sin(millis() * 0.005), -1, 1, 150, 255);
    }
    
    fill(255, alpha);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(message, width/2, height/2);
  }

  async initializeIcons() {
    console.log("[IconGrid] Initializing icon selection");
    
    // Create mock icons if loading failed
    if (this.loadingFailed) {
      this.selectedIcons = ['circle', 'square', 'triangle', 'hexagon', 'star'];
      this.iconWeights = this.selectedIcons.reduce((acc, icon) => {
        acc[icon] = Math.floor(Math.random() * 10) + 1;
        return acc;
      }, {});
      console.log("[IconGrid] Using fallback icons:", this.iconWeights);
      return;
    }
    
    // Select from real Lucide icons
    const allIcons = Object.keys(this.lucideIcons);
    this.selectedIcons = [];
    this.iconWeights = {};
    
    // Select 10 random icons with weights
    while (this.selectedIcons.length < 10 && this.selectedIcons.length < allIcons.length) {
      const randomIcon = allIcons[Math.floor(Math.random() * allIcons.length)];
      if (!this.selectedIcons.includes(randomIcon)) {
        this.selectedIcons.push(randomIcon);
        this.iconWeights[randomIcon] = Math.floor(Math.random() * 10) + 1;
      }
    }
    
    console.log("[IconGrid] Selected icons with weights:", this.iconWeights);
  }

  calculateGCD() {
    this.gcdValue = SketchUtils.gcd(this.canvasWidth, this.canvasHeight);
    console.log(`[IconGrid] GCD of ${this.canvasWidth}x${this.canvasHeight}: ${this.gcdValue}`);
  }

  drawGrid() {
    stroke(255, 50);
    strokeWeight(1);
    
    const cols = this.canvasWidth / this.gcdValue;
    const rows = this.canvasHeight / this.gcdValue;
    const cellWidth = this.canvasWidth / cols;
    const cellHeight = this.canvasHeight / rows;
    
    // Draw vertical lines
    for (let i = 0; i <= cols; i++) {
      line(i * cellWidth, 0, i * cellWidth, this.canvasHeight);
    }
    
    // Draw horizontal lines
    for (let j = 0; j <= rows; j++) {
      line(0, j * cellHeight, this.canvasWidth, j * cellHeight);
    }
  }

  createGridIcons() {
    this.iconCells = [];
    const cols = this.canvasWidth / this.gcdValue;
    const rows = this.canvasHeight / this.gcdValue;
    const cellWidth = this.canvasWidth / cols;
    const cellHeight = this.canvasHeight / rows;
    
    // Create weighted icon list for random selection
    const weightedIcons = [];
    for (const [icon, weight] of Object.entries(this.iconWeights)) {
      for (let i = 0; i < weight; i++) {
        weightedIcons.push(icon);
      }
    }
    console.log("[IconGrid] Weighted icons for selection:", weightedIcons);
    
    // Create grid cells
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = i * cellWidth + cellWidth / 2;
        const y = j * cellHeight + cellHeight / 2;
        const size = min(cellWidth, cellHeight) * 0.6;
        const hue = random(0, 360);
        
        // Select icon based on weights
        const iconName = weightedIcons[Math.floor(Math.random() * weightedIcons.length)];
        
        this.iconCells.push({
          x: x,
          y: y,
          size: size,
          hue: hue,
          iconName: iconName,
          baseSw: random(1, 3)
        });
      }
    }
    
    console.log(`[IconGrid] Created grid with ${cols}x${rows} cells`);
  }

  drawIcons() {
    const time = millis() * 0.001;
    
    for (let cell of this.iconCells) {
      push();
      translate(cell.x, cell.y);
      
      // Calculate vibration effect
      const sw = cell.baseSw + sin(time * this.vibrationSpeed + cell.x) * 1.5;
      const scaleFactor = map(sw, cell.baseSw - 1.5, cell.baseSw + 1.5, 0.9, 1.1);
      
      // Set color and style
      fill(cell.hue, 80, 90);
      stroke(cell.hue, 100, 100);
      strokeWeight(sw);
      
      // Draw icon or fallback shape
      if (this.iconsLoaded && !this.loadingFailed) {
        this.drawLucideIcon(cell.iconName, cell.size * scaleFactor);
      } else {
        this.drawFallbackIcon(cell, scaleFactor);
      }
      
      pop();
    }
    noLoop()
  }

  drawLucideIcon(iconName, size) {
    if (!this.lucideIcons || !this.lucideIcons[iconName]) {
      console.warn(`[IconGrid] Icon not found: ${iconName}`);
      return;
    }
    
    try {
      this.lucideIcons[iconName]({
        x: 0,
        y: 0,
        size: size,
        color: color(this.iconColor || 'currentColor'),
        strokeWidth: 2
      });
    } catch (error) {
      console.error(`[IconGrid] Error drawing icon ${iconName}:`, error);
    }
  }

  drawFallbackIcon(cell, scaleFactor) {
    const size = cell.size * scaleFactor * 0.8;
    const shapeType = Math.abs(cell.iconName.hashCode()) % 4;
    
    switch(shapeType) {
      case 0: // Circle
        ellipse(0, 0, size);
        break;
      case 1: // Square
        rect(-size/2, -size/2, size, size, size/5);
        break;
      case 2: // Triangle
        triangle(0, -size/2, -size/2, size/2, size/2, size/2);
        break;
      case 3: // Star
        this.drawStar(0, 0, size/2, size/4, 5);
        break;
    }
  }

  drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius2;
      let sy = y + sin(a) * radius2;
      vertex(sx, sy);
      sx = x + cos(a + halfAngle) * radius1;
      sy = y + sin(a + halfAngle) * radius1;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }

  async resetSketch() {
    console.log("[IconGrid] Resetting sketch");
    await this.initializeIcons();
    this.calculateGCD();
    this.createGridIcons();
  }

  async changeAspectRatio(w, h) {
    console.log(`[IconGrid] Changing aspect ratio to ${w}:${h}`);
    const scaleFactor = 60;
    this.canvasWidth = w * scaleFactor;
    this.canvasHeight = h * scaleFactor;
    
    resizeCanvas(this.canvasWidth, this.canvasHeight);
    await this.resetSketch();
  }

  windowResized() {
    console.log("[IconGrid] Window resized");
    // Optional: handle window resizing if needed
  }
}

// Add hashCode function for strings if not exists
if (!String.prototype.hashCode) {
  String.prototype.hashCode = function() {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
      hash = (hash << 5) - hash + this.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };
}

// Instantiate and connect to p5.js
const iconGrid = new IconGrid();

// p5.js hooks
function preload() {
  console.log("[IconGrid] Preloading icons...");
  return iconGrid.preload();
}

function setup() {
  console.log("[IconGrid] Setting up sketch...");
  return iconGrid.setup();
}

function draw() {
  console.log("[IconGrid] Drawing sketch...");
  return iconGrid.draw();
}

function windowResized() {
  console.log("[IconGrid] Handling window resize...");
  return iconGrid.windowResized();
}