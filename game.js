// Flappy Kiro - Main Game File
// A browser-based endless scroller game featuring a ghost character

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Canvas dimensions
  canvas: {
    width: 400,
    height: 600
  },
  
  // Ghost character settings
  ghost: {
    width: 40,
    height: 40,
    startX: 100,
    startY: 300,
    gravity: 0.5,           // pixels/frame²
    jumpVelocity: -6,       // pixels/frame
    maxVelocity: 10,        // pixels/frame (up or down)
    hitboxScale: 0.8        // 80% of sprite size for forgiving collision
  },
  
  // Pipe obstacle settings
  pipes: {
    width: 60,
    gapSize: 150,
    minGapY: 100,
    maxGapY: 400,
    scrollSpeed: 3,         // pixels/frame
    spawnInterval: 150,     // frames between pipe generation
    spawnX: 400             // initial x position for new pipes
  },
  
  // Visual settings
  visual: {
    backgroundColor: '#87CEEB',
    pipeColor: '#4CAF50',
    pipeBorderColor: '#2E7D32',
    cloudColor: '#FFFFFF',
    scoreColor: '#FFFFFF',
    scoreFontSize: 48,
    messageColor: '#FFFFFF',
    messageFontSize: 36,
    disableImageSmoothing: true  // for pixel-perfect retro look
  },
  
  // Physics and timing
  physics: {
    maxDeltaTime: 100       // cap deltaTime to prevent physics glitches
  },
  
  // Asset paths
  assets: {
    ghostSprite: 'assets/ghosty.png',
    jumpSound: 'assets/jump.wav',
    gameOverSound: 'assets/game_over.wav'
  },
  
  // Testing configuration
  testing: {
    propertyTestIterations: 100  // minimum iterations for property-based tests
  }
};

// ============================================================================
// GHOST CHARACTER
// ============================================================================

class Ghost {
  constructor(x, y) {
      // Position
      this.x = x;
      this.y = y;

      // Dimensions from CONFIG
      this.width = CONFIG.ghost.width;
      this.height = CONFIG.ghost.height;

      // Velocity
      this.vx = 0;
      this.vy = 0;

      // Rotation angle for visual feedback
      this.angle = 0;

      // Sprite (will be set later by GameEngine)
      this.sprite = null;
    }

  
  update(deltaTime) {
      // Apply gravity (downward acceleration)
      this.vy += CONFIG.ghost.gravity;

      // Clamp velocity to maximum allowed (both upward and downward)
      this.vy = Math.max(-CONFIG.ghost.maxVelocity, 
                         Math.min(CONFIG.ghost.maxVelocity, this.vy));

      // Update position based on velocity
      this.y += this.vy;

      // Calculate rotation based on vertical velocity for visual feedback
      // Positive vy (falling) = rotate down, Negative vy (jumping) = rotate up
      this.angle = this.vy * 3; // 3 degrees per pixel/frame of velocity
    }

  
  jump() {
      // Set vertical velocity to jump velocity (upward)
      this.vy = CONFIG.ghost.jumpVelocity;
    }

  
  render(ctx) {
      // If sprite is not loaded, use fallback rendering
      if (!this.sprite || !this.sprite.complete) {
        // Fallback: draw a white rectangle with black border
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        return;
      }

      // Save the current canvas state
      ctx.save();

      // Translate to the center of the ghost sprite
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

      // Rotate based on the angle (convert degrees to radians)
      ctx.rotate((this.angle * Math.PI) / 180);

      // Draw the sprite centered at the origin (after translation)
      ctx.drawImage(
        this.sprite,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );

      // Restore the canvas state
      ctx.restore();
    }

  
  getBounds() {
    // Calculate hitbox dimensions (80% of sprite size for forgiving collision)
    const hitboxWidth = this.width * CONFIG.ghost.hitboxScale;
    const hitboxHeight = this.height * CONFIG.ghost.hitboxScale;
    
    // Center the hitbox on the ghost sprite
    const hitboxX = this.x + (this.width - hitboxWidth) / 2;
    const hitboxY = this.y + (this.height - hitboxHeight) / 2;
    
    return {
      x: hitboxX,
      y: hitboxY,
      width: hitboxWidth,
      height: hitboxHeight
    };
  }
}

// ============================================================================
// PIPE MANAGER
// ============================================================================

class PipeManager {
  constructor() {
    // Initialize empty pipes array to store active pipe obstacles
    this.pipes = [];
  }
  
  update(deltaTime) {
      // Move all pipes leftward by scrollSpeed
      for (let i = 0; i < this.pipes.length; i++) {
        this.pipes[i].x -= CONFIG.pipes.scrollSpeed;
      }

      // Remove pipes that have moved off-screen (x < -CONFIG.pipes.width)
      this.pipes = this.pipes.filter(pipe => pipe.x >= -CONFIG.pipes.width);
    }


  
  generatePipe() {
        // Generate random gap center Y position between minGapY and maxGapY
        const gapCenterY = CONFIG.pipes.minGapY + 
                           Math.random() * (CONFIG.pipes.maxGapY - CONFIG.pipes.minGapY);

        // Calculate top pipe height and bottom pipe Y position based on gap center
        const topHeight = gapCenterY - (CONFIG.pipes.gapSize / 2);
        const bottomY = gapCenterY + (CONFIG.pipes.gapSize / 2);

        // Create new pipe obstacle at spawn position
        const pipe = {
          x: CONFIG.pipes.spawnX,           // Initial x position (400)
          topHeight: topHeight,              // Height of top pipe
          bottomY: bottomY,                  // Y position where bottom pipe starts
          width: CONFIG.pipes.width,         // Pipe width (60)
          passed: false                      // For scoring logic - prevents double-counting
                                             // Set to true when ghost passes pipe center (Task 11)
        };

        // Add pipe to active pipes array
        this.pipes.push(pipe);
      }


  
  removePipe(pipe) {
    // TODO: Remove pipe from array
  }
  
  getPipes() {
      // Return the array of active pipe obstacles
      return this.pipes;
    }

  
  reset() {
      // Clear all pipes from the array (used when restarting the game)
      this.pipes = [];
    }

}

// ============================================================================
// COLLISION DETECTOR
// ============================================================================

class CollisionDetector {
  static checkCollision(ghost, pipes) {
      // Get ghost's hitbox bounds (80% of sprite size)
      const ghostBounds = ghost.getBounds();

      // Check collision with each pipe
      for (const pipe of pipes) {
        // Define top pipe rectangle
        const topPipe = {
          x: pipe.x,
          y: 0,
          width: pipe.width,
          height: pipe.topHeight
        };

        // Define bottom pipe rectangle
        const bottomPipe = {
          x: pipe.x,
          y: pipe.bottomY,
          width: pipe.width,
          height: CONFIG.canvas.height - pipe.bottomY
        };

        // Check if ghost intersects with top pipe
        if (this.boxIntersect(ghostBounds, topPipe)) {
          return true;
        }

        // Check if ghost intersects with bottom pipe
        if (this.boxIntersect(ghostBounds, bottomPipe)) {
          return true;
        }
      }

      // No collision detected
      return false;
    }

  
  static checkBoundary(ghost, canvasHeight) {
      // Check if ghost hits top boundary (y < 0)
      if (ghost.y < 0) {
        return true;
      }

      // Check if ghost hits bottom boundary (y + height > canvasHeight)
      if (ghost.y + ghost.height > canvasHeight) {
        return true;
      }

      // No boundary violation
      return false;
    }

  
  static boxIntersect(box1, box2) {
      // Standard AABB (Axis-Aligned Bounding Box) collision detection
      // Two rectangles intersect if they overlap on both X and Y axes
      return box1.x < box2.x + box2.width &&
             box1.x + box1.width > box2.x &&
             box1.y < box2.y + box2.height &&
             box1.y + box1.height > box2.y;
    }

}

// ============================================================================
// SCORE SYSTEM
// ============================================================================

class ScoreSystem {
  constructor() {
    // Initialize current score to 0
    this.current = 0;
    // Initialize high score to 0
    this.high = 0;
  }
  
  increment() {
      // Increase current score by 1
      this.current++;
      // Update high score if current score exceeds it
      if (this.current > this.high) {
        this.high = this.current;
      }
    }

  
  /**
   * Check pipes and update score based on ghost position.
   * This method will be called from GameEngine.update() (Task 11).
   * 
   * Scoring Logic (Validates Requirement 7.5):
   * 1. For each pipe, check if ghost.x > pipe.x + (pipe.width / 2) (ghost passed pipe center)
   * 2. If ghost passed AND pipe.passed === false:
   *    - Call this.increment() to increase score
   *    - Set pipe.passed = true to prevent double-counting
   * 3. If pipe.passed === true, skip (already scored)
   * 
   * @param {Ghost} ghost - The ghost character
   * @param {Array} pipes - Array of pipe obstacles
   */
  checkAndScorePipes(ghost, pipes) {
    for (const pipe of pipes) {
      const pipeCenterX = pipe.x + (pipe.width / 2);
      if (ghost.x > pipeCenterX && !pipe.passed) {
        this.increment();
        pipe.passed = true;
      }
    }
  }

  
  reset() {
    // Reset current score to 0 (Validates Requirement 7.1)
    // High score is preserved
    this.current = 0;
  }
  
  getScore() {
    return this.current;
  }
  
  getHighScore() {
    return this.high;
  }
  
  render(ctx, x, y) {
      // Set font style using CONFIG.visual settings (Validates Requirements 7.3, 7.4)
      ctx.font = `bold ${CONFIG.visual.scoreFontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Draw black outline for better visibility
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(this.current.toString(), x, y);

      // Draw white score text
      ctx.fillStyle = CONFIG.visual.scoreColor;
      ctx.fillText(this.current.toString(), x, y);
    }

}

// ============================================================================
// AUDIO SYSTEM
// ============================================================================

/**
 * AudioSystem manages sound effect playback for the game.
 * 
 * AUDIO CONTEXT RESTRICTIONS (Task 7.4):
 * Modern browsers (Chrome, Firefox, Safari, Edge) implement autoplay policies that
 * restrict audio playback until the user interacts with the page. This is a security
 * feature to prevent unwanted audio from playing automatically.
 * 
 * How this affects Flappy Kiro:
 * - The first call to play() may fail silently if no user interaction has occurred
 * - Once the player presses SPACE (first user interaction), audio will work normally
 * - The try-catch block in play() handles these restrictions gracefully
 * - The game remains fully playable even if audio fails to initialize
 * 
 * Browser Behavior:
 * - Chrome/Edge: Requires user gesture before AudioContext can start
 * - Firefox: Similar restrictions, may show console warnings
 * - Safari: Strictest policy, requires explicit user interaction
 * 
 * Implementation Notes:
 * - No special AudioContext initialization needed for simple Audio() elements
 * - The first spacebar press (jump action) serves as the required user interaction
 * - Subsequent audio playback works without restrictions
 * - Errors are caught and logged but don't break gameplay
 */
class AudioSystem {
  constructor() {
    // Initialize sounds object/map to store Audio instances
    // Key: sound name (e.g., 'jump', 'gameOver')
    // Value: HTML5 Audio object
    this.sounds = {};
  }
  
  preload(soundMap) {
        // Load sound files from the provided soundMap
        // soundMap is an object mapping sound names to file paths
        // Example: { jump: 'assets/jump.wav', gameOver: 'assets/game_over.wav' }

        for (const [name, filePath] of Object.entries(soundMap)) {
          // Create new Audio object for each sound
          const audio = new Audio();
          audio.src = filePath;

          // Add error event listener for graceful fallback
          audio.addEventListener('error', (e) => {
            console.warn(`Failed to load audio file: ${filePath} (${name}). Game will continue without this sound.`);
            // Mark this sound as failed so we don't try to play it
            this.sounds[name] = null;
          });

          // Store in sounds object with the given name
          this.sounds[name] = audio;
        }
      }


  
  play(soundName) {
    // Check if sound exists in this.sounds
    if (!this.sounds[soundName]) {
      console.warn(`Sound "${soundName}" not found in AudioSystem`);
      return;
    }

    try {
      // Reset currentTime to 0 to allow overlapping sounds
      this.sounds[soundName].currentTime = 0;
      
      // Play the sound
      // NOTE: This may fail on the first call if no user interaction has occurred yet.
      // The browser's autoplay policy requires a user gesture (like pressing SPACE)
      // before audio can play. The try-catch handles this gracefully.
      this.sounds[soundName].play();
    } catch (error) {
      // Handle errors gracefully (catch and log)
      // Common errors include:
      // - NotAllowedError: User hasn't interacted with the page yet
      // - NotSupportedError: Audio format not supported by browser
      // - AbortError: Play request was interrupted
      console.error(`Error playing sound "${soundName}":`, error);
    }
  }
  
  setVolume(volume) {
    // TODO: Set audio volume
  }
}

// ============================================================================
// RENDERER
// ============================================================================

class Renderer {
  constructor(canvas) {
    // Store canvas reference
    this.canvas = canvas;
    
    // Get 2D rendering context
    this.ctx = canvas.getContext('2d');
    
    // Disable image smoothing for pixel-perfect retro look (Task 8.2)
    // This will be used when drawing sprites and graphics
    if (CONFIG.visual.disableImageSmoothing) {
      this.ctx.imageSmoothingEnabled = false;
    }
  }
  
  clear() {
    // Clear the entire canvas (Task 8.3)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  drawBackground() {
    // Draw background with light blue color from CONFIG (Task 8.4)
    this.ctx.fillStyle = CONFIG.visual.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  drawClouds() {
    // Draw cloud graphics as white rounded rectangles (Task 8.5)
    // Fixed positions for retro aesthetic
    this.ctx.fillStyle = CONFIG.visual.cloudColor;
    
    // Cloud 1 - top left
    this.drawRoundedRect(50, 80, 80, 40, 20);
    
    // Cloud 2 - top right
    this.drawRoundedRect(250, 100, 100, 50, 25);
    
    // Cloud 3 - middle left
    this.drawRoundedRect(80, 200, 70, 35, 17);
    
    // Cloud 4 - middle right
    this.drawRoundedRect(280, 250, 90, 45, 22);
  }
  
  // Helper method for drawing rounded rectangles
  drawRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  drawGhost(ghost) {
    // Draw ghost sprite with rotation (Task 8.6)
    // Delegate to ghost's render method which handles sprite drawing and rotation
    ghost.render(this.ctx);
  }
  
  drawPipes(pipes) {
    // Draw pipe obstacles with green color and darker borders (Task 8.7)
    for (const pipe of pipes) {
      // Draw top pipe
      this.ctx.fillStyle = CONFIG.visual.pipeColor;
      this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
      
      // Draw top pipe border
      this.ctx.strokeStyle = CONFIG.visual.pipeBorderColor;
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(pipe.x, 0, pipe.width, pipe.topHeight);
      
      // Draw bottom pipe
      this.ctx.fillStyle = CONFIG.visual.pipeColor;
      this.ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, this.canvas.height - pipe.bottomY);
      
      // Draw bottom pipe border
      this.ctx.strokeStyle = CONFIG.visual.pipeBorderColor;
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(pipe.x, pipe.bottomY, pipe.width, this.canvas.height - pipe.bottomY);
    }
  }
  
  drawScore(scoreSystem) {
    // Draw score at bottom center (Task 8.8)
    // Delegate to scoreSystem's render method which handles score display
    const x = this.canvas.width / 2;
    const y = this.canvas.height - 60; // 60 pixels from bottom
    scoreSystem.render(this.ctx, x, y);
  }
  
  drawMessage(text, y) {
    // Draw centered text message for game states (Task 8.9)
    this.ctx.font = `bold ${CONFIG.visual.messageFontSize}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Draw black outline for better visibility
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(text, this.canvas.width / 2, y);
    
    // Draw white message text
    this.ctx.fillStyle = CONFIG.visual.messageColor;
    this.ctx.fillText(text, this.canvas.width / 2, y);
  }
}

// ============================================================================
// INPUT HANDLER
// ============================================================================

/**
 * InputHandler manages keyboard input for the game.
 * 
 * Key Responsibilities:
 * - Listen for SPACE key presses
 * - Implement state-dependent behavior (waiting/playing/game_over)
 * - Debounce input to prevent multiple jumps per frame
 * 
 * State-dependent Behavior (Validates Requirements 2.1, 2.3, 2.4):
 * - waiting: SPACE starts the game
 * - playing: SPACE triggers jump
 * - game_over: SPACE restarts the game
 */
class InputHandler {
  constructor(gameEngine) {
    // Store reference to GameEngine for state access and method calls (Task 9.1)
    this.gameEngine = gameEngine;
    
    // Debouncing flag to prevent multiple jumps per frame (Task 9.5)
    // Set to true when SPACE is pressed, reset to false when key is released
    this.spacePressed = false;
    
    // Bind event handlers to maintain 'this' context
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
  }
  
  init() {
    // Set up event listeners for keydown and keyup on document (Task 9.2)
    // Using document ensures we capture input even if canvas doesn't have focus
    document.addEventListener('keydown', this.boundHandleKeyDown);
    document.addEventListener('keyup', this.boundHandleKeyUp);
  }
  
  handleKeyDown(event) {
    // Only process SPACE key (Task 9.3)
    if (event.code !== 'Space' && event.key !== ' ') {
      return;
    }
    
    // Prevent default browser behavior (e.g., page scrolling)
    event.preventDefault();
    
    // Debouncing: Ignore if SPACE is already pressed (Task 9.5)
    // This prevents multiple jumps from a single key press or held key
    if (this.spacePressed) {
      return;
    }
    
    // Mark SPACE as pressed for debouncing
    this.spacePressed = true;
    
    // State-dependent behavior (Task 9.4)
    // Access game state from gameEngine to determine action
    const gameState = this.gameEngine.state;
    
    if (gameState === 'waiting') {
      // Waiting state: Start the game
      // This will be implemented in GameEngine (Task 10-12)
      // Expected behavior: transition to 'playing' state
      this.gameEngine.startGame();
    } else if (gameState === 'playing') {
      // Playing state: Trigger jump
      // Call ghost's jump() method and play jump sound
      this.gameEngine.ghost.jump();
      this.gameEngine.audioSystem.play('jump');
    } else if (gameState === 'game_over') {
      // Game over state: Restart the game
      // This will call GameEngine.reset() to reset all game state
      this.gameEngine.reset();
    }
  }
  
  handleKeyUp(event) {
    // Reset debouncing flag when SPACE is released (Task 9.5)
    if (event.code === 'Space' || event.key === ' ') {
      this.spacePressed = false;
    }
  }
}

// ============================================================================
// GAME ENGINE
// ============================================================================

/**
 * GameEngine is the main controller that orchestrates all game subsystems.
 * 
 * Responsibilities:
 * - Initialize canvas and load assets
 * - Manage game state transitions (waiting, playing, game_over)
 * - Coordinate update and render cycles
 * - Handle browser visibility changes for pause/resume
 */
class GameEngine {
  constructor(canvasId) {
    // Task 10.1: Store canvas reference
    this.canvas = document.getElementById(canvasId);
    
    if (!this.canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }
    
    // Set canvas dimensions from CONFIG
    this.canvas.width = CONFIG.canvas.width;
    this.canvas.height = CONFIG.canvas.height;
    
    // Task 10.4: Initialize game state
    this.state = 'waiting';  // 'waiting' | 'playing' | 'game_over'
    this.frameCount = 0;
    this.isPaused = false;
    
    // Task 10.5: Create instances of all game objects
    // These will be initialized in init() after assets are loaded
    this.ghost = null;
    this.pipeManager = null;
    this.scoreSystem = null;
    this.audioSystem = null;
    this.renderer = null;
    this.inputHandler = null;
    
    // Asset loading state
    this.ghostSprite = null;
    this.assetsLoaded = false;
    
    // Game loop timing
    this.lastFrameTime = 0;
  }
  
  /**
   * Task 10.2: Initialize all subsystems
   * This method loads assets and creates all game object instances
   */
  async init() {
    try {
      // Task 10.3 & 10.6: Load ghost sprite with error handling
      await this.loadGhostSprite();
      
      // Task 10.5: Create instances of all game objects
      
      // Create Ghost instance at starting position
      this.ghost = new Ghost(CONFIG.ghost.startX, CONFIG.ghost.startY);
      this.ghost.sprite = this.ghostSprite;
      
      // Create PipeManager instance
      this.pipeManager = new PipeManager();
      
      // Create ScoreSystem instance
      this.scoreSystem = new ScoreSystem();
      
      // Create AudioSystem instance and preload sounds
      this.audioSystem = new AudioSystem();
      this.audioSystem.preload({
        jump: CONFIG.assets.jumpSound,
        gameOver: CONFIG.assets.gameOverSound
      });
      
      // Create Renderer instance
      this.renderer = new Renderer(this.canvas);
      
      // Create InputHandler instance and initialize
      this.inputHandler = new InputHandler(this);
      this.inputHandler.init();
      
      // Task 12.8: Add visibility change event listeners
      this.setupVisibilityListeners();
      
      // Mark assets as loaded
      this.assetsLoaded = true;
      
      console.log('Game initialized successfully');
      
      // Render initial waiting state
      this.render();
      
      // Start the game loop
      this.startGameLoop();
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.handleInitializationError(error);
    }
  }
  
  /**
   * Task 10.3 & 10.6: Load ghost sprite from CONFIG.assets.ghostSprite
   * Returns a Promise that resolves when the sprite is loaded
   */
  loadGhostSprite() {
    return new Promise((resolve, reject) => {
      const sprite = new Image();
      
      // Handle successful load
      sprite.onload = () => {
        this.ghostSprite = sprite;
        console.log('Ghost sprite loaded successfully');
        resolve();
      };
      
      // Task 10.6: Handle loading errors gracefully
      sprite.onerror = (error) => {
        console.error(`Failed to load ghost sprite from ${CONFIG.assets.ghostSprite}`);
        console.warn('Using fallback rendering for ghost character');
        
        // Create a fallback "sprite" (will trigger fallback rendering in Ghost.render())
        this.ghostSprite = new Image(); // Empty image will fail .complete check
        
        // Resolve anyway to allow game to continue with fallback rendering
        resolve();
      };
      
      // Start loading the sprite
      sprite.src = CONFIG.assets.ghostSprite;
    });
  }
  
  /**
   * Task 10.6: Handle initialization errors
   */
  handleInitializationError(error) {
    // Display error message on canvas
    const ctx = this.canvas.getContext('2d');
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    ctx.fillStyle = '#FF0000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Failed to Initialize Game', this.canvas.width / 2, this.canvas.height / 2 - 40);
    
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText(error.message, this.canvas.width / 2, this.canvas.height / 2);
    ctx.fillText('Please check the console for details', this.canvas.width / 2, this.canvas.height / 2 + 30);
  }
  
  /**
   * Start the game (transition from waiting to playing)
   * Called by InputHandler when SPACE is pressed in waiting state
   */
  startGame() {
    if (this.state === 'waiting') {
      this.state = 'playing';
      this.frameCount = 0;
      console.log('Game started');
    }
  }
  
  /**
   * Main game loop using requestAnimationFrame
   * This method is called recursively to create the game loop
   */
  gameLoop(currentTime) {
    // Calculate deltaTime in milliseconds
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    
    // Task 11.7: Cap deltaTime to CONFIG.physics.maxDeltaTime to prevent physics glitches
    const cappedDeltaTime = Math.min(deltaTime, CONFIG.physics.maxDeltaTime);
    
    // Only update if not paused
    if (!this.isPaused) {
      this.update(cappedDeltaTime);
    }
    
    // Always render (even when paused)
    this.render();
    
    // Schedule next frame
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  /**
   * Handle game over state transition
   * Called when collision or boundary violation is detected
   */
  handleGameOver() {
    // Transition to game over state
    this.state = 'game_over';
    
    // Play game over sound
    this.audioSystem.play('gameOver');
    
    console.log('Game over! Final score:', this.scoreSystem.getScore());
  }
  
  /**
   * Task 12.8: Set up visibility change event listeners
   * This handles pausing/resuming when the browser tab loses/gains focus
   */
  setupVisibilityListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }
  
  /**
   * Task 11.1: Start the game loop using requestAnimationFrame
   * This method initiates the continuous game loop that runs at ~60 FPS
   */
  startGameLoop() {
    // Initialize lastFrameTime for deltaTime calculation
    this.lastFrameTime = performance.now();
    
    // Start the game loop
    this.gameLoop(this.lastFrameTime);
    
    console.log('Game loop started');
  }
  
  /**
   * Task 11.2-11.7: Update game state coordinating all subsystems
   * This method is called every frame to update game logic
   */
  update(deltaTime) {
    // Only update if game is in playing state
    if (this.state !== 'playing') {
      return;
    }
    
    // Task 11.3: Update ghost physics
    this.ghost.update(deltaTime);
    
    // Task 11.4: Update pipe positions and generate new pipes
    this.pipeManager.update(deltaTime);
    
    // Generate new pipe every CONFIG.pipes.spawnInterval frames
    if (this.frameCount % CONFIG.pipes.spawnInterval === 0) {
      this.pipeManager.generatePipe();
    }
    
    // Task 11.6: Update score when ghost passes pipes
    const pipes = this.pipeManager.getPipes();
    for (const pipe of pipes) {
      const pipeCenterX = pipe.x + (pipe.width / 2);
      if (this.ghost.x > pipeCenterX && !pipe.passed) {
        this.scoreSystem.increment();
        pipe.passed = true;
      }
    }
    
    // Task 11.5: Check collisions and handle game over
    const hasCollision = CollisionDetector.checkCollision(this.ghost, pipes);
    const hasBoundaryViolation = CollisionDetector.checkBoundary(this.ghost, this.canvas.height);
    
    if (hasCollision || hasBoundaryViolation) {
      this.handleGameOver();
    }
    
    // Increment frame counter
    this.frameCount++;
  }
  
  /**
   * Task 11.8: Render all game elements
   * This method is called every frame to draw the game
   */
  render() {
    if (!this.assetsLoaded || !this.renderer) {
      return;
    }
    
    // Clear canvas
    this.renderer.clear();
    
    // Draw background
    this.renderer.drawBackground();
    
    // Draw clouds
    this.renderer.drawClouds();
    
    // Draw pipes
    if (this.pipeManager) {
      this.renderer.drawPipes(this.pipeManager.getPipes());
    }
    
    // Draw ghost
    if (this.ghost) {
      this.renderer.drawGhost(this.ghost);
    }
    
    // Draw score
    if (this.scoreSystem) {
      this.renderer.drawScore(this.scoreSystem);
    }
    
    // Draw state-specific messages
    if (this.state === 'waiting') {
      this.renderer.drawMessage('Press SPACE to Start', this.canvas.height / 2);
    } else if (this.state === 'game_over') {
      this.renderer.drawMessage('Game Over', this.canvas.height / 2 - 60);
      this.renderer.drawMessage('Press SPACE to Restart', this.canvas.height / 2 + 60);
    }
  }
  
  /**
   * Task 12.1-12.5: Reset all game state
   * This method is called when restarting the game after game over
   */
  reset() {
    // Task 12.2: Reset ghost to starting position
    this.ghost.x = CONFIG.ghost.startX;
    this.ghost.y = CONFIG.ghost.startY;
    this.ghost.vx = 0;
    this.ghost.vy = 0;
    this.ghost.angle = 0;
    
    // Task 12.3: Clear all pipes
    this.pipeManager.reset();
    
    // Task 12.4: Reset score to 0
    this.scoreSystem.reset();
    
    // Task 12.5: Reset frameCount to 0
    this.frameCount = 0;
    
    // Transition to playing state
    this.state = 'playing';
    
    console.log('Game reset');
  }
  
  /**
   * Task 12.6: Pause the game for tab visibility changes
   * This method is called when the browser tab loses focus
   */
  pause() {
    if (this.state === 'playing') {
      this.isPaused = true;
      console.log('Game paused');
    }
  }
  
  /**
   * Task 12.7: Resume the game for tab visibility changes
   * This method is called when the browser tab regains focus
   */
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      // Reset lastFrameTime to prevent large deltaTime jump
      this.lastFrameTime = performance.now();
      console.log('Game resumed');
    }
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing Flappy Kiro...');
  
  // Create GameEngine instance
  const game = new GameEngine('gameCanvas');
  
  // Initialize game (load assets and set up subsystems)
  game.init();
});
