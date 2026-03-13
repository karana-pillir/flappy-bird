# Implementation Tasks

## Task 1: Project Setup

Create the basic project structure with HTML, CSS, and JavaScript files.

- [x] 1.1 Create index.html with canvas element (id="gameCanvas")
- [x] 1.2 Create styles.css for basic page styling and canvas centering
- [x] 1.3 Create game.js as the main JavaScript file
- [x] 1.4 Link all files together in index.html
- [x] 1.5 Verify assets directory contains ghosty.png, jump.wav, game_over.wav

**Validates:** Requirements 1.1, 10.5

## Task 2: CONFIG Object

Create centralized configuration object with all game parameters.

- [x] 2.1 Define CONFIG.canvas (width, height)
- [x] 2.2 Define CONFIG.ghost (dimensions, physics, start position, hitbox)
- [x] 2.3 Define CONFIG.pipes (dimensions, timing, speed, gap constraints)
- [x] 2.4 Define CONFIG.visual (colors, fonts, rendering settings)
- [x] 2.5 Define CONFIG.physics (maxDeltaTime)
- [x] 2.6 Define CONFIG.assets (sprite and sound paths)
- [x] 2.7 Define CONFIG.testing (propertyTestIterations)

**Validates:** Design Configuration section

## Task 3: Ghost Class

Implement the Ghost character with physics and rendering.

- [x] 3.1 Create Ghost class constructor with position from CONFIG
- [x] 3.2 Implement update() method with gravity and velocity clamping
- [x] 3.3 Implement jump() method setting velocity to CONFIG.ghost.jumpVelocity

- [x] 3.4 Implement rotation calculation based on vertical velocity
- [x] 3.5 Implement getBounds() method returning hitbox with CONFIG.ghost.hitboxScale
- [x] 3.6 Implement render() method drawing sprite with rotation
- [ ]*  3.7 Property test: Jump applies correct upward velocity (Property 1)
- [ ]*  3.8 Property test: Gravity consistently applied (Property 3)
- [ ]*  3.9 Property test: Velocity clamping (Property 4)
- [ ]*  3.10 Property test: Rotation reflects velocity (Property 5)

**Validates:** Requirements 2.1, 3.1-3.5, 9.3

## Task 4: PipeManager Class

Implement pipe obstacle generation and management.

- [x] 4.1 Create PipeManager class with pipes array
- [x] 4.2 Implement generatePipe() creating pipes at CONFIG.pipes.spawnX
- [x] 4.3 Implement random gap positioning between CONFIG.pipes.minGapY and maxGapY
- [x] 4.4 Implement update() moving pipes left by CONFIG.pipes.scrollSpeed
- [x] 4.5 Implement pipe removal when x < -CONFIG.pipes.width
- [x] 4.6 Implement getPipes() returning active pipes array
- [x] 4.7 Implement reset() clearing all pipes
- [ ]*  4.8 Property test: Pipe generation timing (Property 6)
- [ ]*  4.9 Property test: Pipe generation constraints (Property 7)
- [ ]*  4.10 Property test: Pipe scrolling speed (Property 8)
- [ ]*  4.11 Property test: Off-screen pipe removal (Property 9)

**Validates:** Requirements 4.1-4.6, 5.1-5.2

## Task 5: CollisionDetector Class

Implement collision detection logic.

- [x] 5.1 Create CollisionDetector as static class
- [x] 5.2 Implement boxIntersect() for rectangle overlap detection

- [x] 5.3 Implement checkCollision() checking ghost against all pipes
- [x] 5.4 Implement checkBoundary() checking ghost against canvas edges
- [x] 5.5 Use CONFIG.ghost.hitboxScale for collision calculations
- [ ]*  5.6 Property test: Collision ends game (Property 10)
- [ ]*  5.7 Property test: Boundary violations end game (Property 11)

**Validates:** Requirements 6.1-6.5

## Task 6: ScoreSystem Class

Implement score tracking and display.

- [x] 6.1 Create ScoreSystem class with current and high score
- [x] 6.2 Implement increment() method
- [x] 6.3 Implement logic to mark pipes as "passed" to prevent double-counting
- [x] 6.4 Implement getScore() and getHighScore() methods
- [x] 6.5 Implement reset() method
- [x] 6.6 Implement render() drawing score with CONFIG.visual settings
- [ ]*  6.7 Property test: Score increments on pipe passage (Property 12)
- [ ]*  6.8 Property test: Pipes counted once for scoring (Property 13)

**Validates:** Requirements 7.1-7.5

## Task 7: AudioSystem Class

Implement sound effect management.

- [x] 7.1 Create AudioSystem class
- [x] 7.2 Implement preload() loading sounds from CONFIG.assets
- [x] 7.3 Implement play() method for sound playback
- [x] 7.4 Handle audio context restrictions (user interaction required)
- [x] 7.5 Implement graceful fallback for audio loading failures
- [ ]*  7.6 Property test: Jump triggers audio feedback (Property 2)
- [ ]*  7.7 Property test: Game over plays audio (Property 14)

**Validates:** Requirements 1.6, 2.2, 8.1

## Task 8: Renderer Class

Implement all canvas drawing operations.


- [x] 8.1 Create Renderer class with canvas context
- [x] 8.2 Disable image smoothing per CONFIG.visual.disableImageSmoothing
- [x] 8.3 Implement clear() method
- [x] 8.4 Implement drawBackground() with CONFIG.visual.backgroundColor
- [x] 8.5 Implement drawClouds() as white rounded rectangles
- [x] 8.6 Implement drawGhost() with sprite and rotation
- [x] 8.7 Implement drawPipes() with CONFIG.visual colors and borders
- [x] 8.8 Implement drawScore() at bottom center
- [x] 8.9 Implement drawMessage() for game state messages

**Validates:** Requirements 1.1-1.3, 9.1-9.6

## Task 9: InputHandler Class

Implement keyboard input processing.

- [x] 9.1 Create InputHandler class
- [x] 9.2 Implement init() setting up event listeners
- [x] 9.3 Implement handleKeyDown() for SPACE key
- [x] 9.4 Implement state-dependent behavior (waiting/playing/game_over)
- [x] 9.5 Implement input debouncing to prevent multiple jumps per frame

**Validates:** Requirements 2.1, 2.3, 2.4

## Task 10: GameEngine Class - Core Structure

Implement the main game engine structure.

- [x] 10.1 Create GameEngine class with canvas reference
- [x] 10.2 Implement init() method initializing all subsystems
- [x] 10.3 Load ghost sprite from CONFIG.assets.ghostSprite
- [x] 10.4 Initialize game state (status, frameCount, isPaused)
- [x] 10.5 Create instances of all game objects (Ghost, PipeManager, etc.)
- [x] 10.6 Implement asset loading with error handling

**Validates:** Requirements 1.1-1.6


## Task 11: GameEngine Class - Game Loop

Implement the main game loop and update logic.

- [x] 11.1 Implement startGameLoop() using requestAnimationFrame
- [x] 11.2 Implement update() method coordinating all subsystems
- [x] 11.3 Update ghost physics
- [x] 11.4 Update pipe positions and generate new pipes every CONFIG.pipes.spawnInterval frames
- [x] 11.5 Check collisions and handle game over
- [x] 11.6 Update score when ghost passes pipes
- [x] 11.7 Cap deltaTime to CONFIG.physics.maxDeltaTime
- [x] 11.8 Implement render() method calling Renderer for all elements

**Validates:** Requirements 3.2, 4.2, 5.3, 10.1-10.2

## Task 12: GameEngine Class - State Management

Implem
ent game state transitions and controls.

- [x] 12.1 Implement reset() method resetting all game state
- [x] 12.2 Reset ghost to starting position
- [x] 12.3 Clear all pipes
- [x] 12.4 Reset score to 0
- [x] 12.5 Reset frameCount to 0
- [x] 12.6 Implement pause() method for tab visibility changes
- [x] 12.7 Implement resume() method for tab visibility changes
- [x] 12.8 Add visibility change event listeners
- [ ]*  12.9 Property test: Game over stops pipe movement (Property 15)
- [ ]*  12.10 Property test: Restart resets game state (Property 16)
- [ ]*  12.11 Property test: Pause on focus loss (Property 17)
- [ ]*  12.12 Property test: Resume on focus gain (Property 18)

**Validates:** Requirements 8.2, 8.6, 10.3-10.4

## Task 13: Game Over Logic

Implement game over detection and UI.

- [x] 13.1 Detect collision or boundary violation
- [x] 13.2 Transition game state to 'game_over'
- [x] 13.3 Play game over sound via AudioSystem
- [x] 13.4 Stop pipe movement
- [x] 13.5 Display "Game Over" message via Renderer
- [x] 13.6 Display final score
- [x] 13.7 Display "Press SPACE to Restart" message
- [x] 13.8 Handle SPACE key to trigger reset()

**Validates:** Requirements 8.1-8.6

## Task 14: Integration and Testing

Integrate all components and verify functionality.

- [x] 14.1 Test game initialization and asset loading
- [x] 14.2 Test ghost physics (gravity, jump, velocity clamping)
- [x] 14.3 Test pipe generation and scrolling
- [x] 14.4 Test collision detection (pipes and boundaries)
- [x] 14.5 Test score increment and display
- [x] 14.6 Test audio playback (jump and game over sounds)

- [x] 14.7 Test game over and restart flow
- [x] 14.8 Test pause/resume on tab visibility changes
- [x] 14.9 Verify 60 FPS performance
- [x] 14.10 Test in multiple browsers (Chrome, Firefox, Safari, Edge)

**Validates:** All requirements

## Task 15: Error Handling and Polish

Implement error handling and final polish.

- [x] 15.1 Add fallback rendering if ghost sprite fails to load
- [x] 15.2 Handle audio loading failures gracefully
- [x] 15.3 Check canvas support and display error if unavailable
- [x] 15.4 Validate game state to prevent NaN/Infinity values
- [x] 15.5 Add console logging for debugging
- [x] 15.6 Optimize rendering performance
- [x] 15.7 Final visual polish and retro aesthetic verification

**Validates:** Requirements 10.6, Design Error Handling section
