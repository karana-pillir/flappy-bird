# Requirements Document

## Introduction

Flappy Kiro is a browser-based endless scroller game featuring a ghost character that navigates through pipes. The game provides retro-style visuals with a light blue background, clouds, and green pipes. Players control the ghost's vertical movement to avoid obstacles and achieve high scores.

## Glossary

- **Game_Engine**: The core system that manages game state, rendering, and game loop execution
- **Ghost_Character**: The player-controlled sprite that moves through the game world
- **Pipe_Obstacle**: A pair of green pipes (top and bottom) with a gap that the Ghost_Character must navigate through
- **Score_System**: The subsystem that tracks and displays the player's current score
- **Collision_Detector**: The subsystem that determines when the Ghost_Character contacts Pipe_Obstacles or boundaries
- **Audio_System**: The subsystem that plays sound effects during gameplay
- **Game_Session**: A single playthrough from start until game over
- **Canvas**: The HTML5 canvas element where the game renders

## Requirements

### Requirement 1: Game Initialization

**User Story:** As a player, I want the game to load in my browser, so that I can start playing immediately.

#### Acceptance Criteria

1. WHEN the page loads, THE Game_Engine SHALL render the Canvas with dimensions of 400x600 pixels
2. WHEN the page loads, THE Game_Engine SHALL display the Ghost_Character at the starting position (x=100, y=300)
3. WHEN the page loads, THE Game_Engine SHALL display the light blue background with cloud graphics
4. WHEN the page loads, THE Game_Engine SHALL display "Press SPACE to Start" message
5. THE Game_Engine SHALL load the ghost sprite from assets/ghosty.png
6. THE Audio_System SHALL preload assets/jump.wav and assets/game_over.wav

### Requirement 2: Player Input Control

**User Story:** As a player, I want to control the ghost's movement, so that I can navigate through obstacles.

#### Acceptance Criteria

1. WHEN the player presses the SPACE key, THE Ghost_Character SHALL apply upward velocity of 6 pixels per frame
2. WHEN the player presses the SPACE key, THE Audio_System SHALL play assets/jump.wav
3. WHILE the Game_Session is active, THE Game_Engine SHALL accept SPACE key input
4. WHEN the game is in game-over state, THE Game_Engine SHALL ignore SPACE key input except to restart

### Requirement 3: Ghost Character Physics

**User Story:** As a player, I want realistic falling motion, so that the game feels responsive and challenging.

#### Acceptance Criteria

1. WHILE the Game_Session is active, THE Ghost_Character SHALL apply downward gravity of 0.5 pixels per frame squared
2. WHILE the Game_Session is active, THE Game_Engine SHALL update the Ghost_Character position at 60 frames per second
3. THE Ghost_Character SHALL have a maximum falling velocity of 10 pixels per frame
4. THE Ghost_Character SHALL have a maximum upward velocity of 10 pixels per frame
5. WHILE the Game_Session is active, THE Ghost_Character SHALL rotate based on vertical velocity to provide visual feedback

### Requirement 4: Pipe Obstacle Generation

**User Story:** As a player, I want pipes to appear continuously, so that the game provides ongoing challenge.

#### Acceptance Criteria

1. WHEN a Game_Session starts, THE Game_Engine SHALL generate the first Pipe_Obstacle at x=400
2. WHILE the Game_Session is active, THE Game_Engine SHALL generate a new Pipe_Obstacle every 150 frames
3. THE Game_Engine SHALL position each Pipe_Obstacle with a gap of 150 pixels between top and bottom pipes
4. THE Game_Engine SHALL randomize the gap vertical position between y=100 and y=400
5. THE Pipe_Obstacle SHALL have a width of 60 pixels
6. THE Pipe_Obstacle SHALL render with green color (#4CAF50)

### Requirement 5: Pipe Obstacle Movement

**User Story:** As a player, I want pipes to scroll toward me, so that I experience continuous gameplay.

#### Acceptance Criteria

1. WHILE the Game_Session is active, THE Game_Engine SHALL move all Pipe_Obstacles leftward at 3 pixels per frame
2. WHEN a Pipe_Obstacle moves beyond x=-60, THE Game_Engine SHALL remove that Pipe_Obstacle from the game
3. THE Game_Engine SHALL maintain smooth scrolling at 60 frames per second

### Requirement 6: Collision Detection

**User Story:** As a player, I want the game to detect when I hit obstacles, so that the game ends appropriately.

#### Acceptance Criteria

1. WHILE the Game_Session is active, THE Collision_Detector SHALL check for contact between Ghost_Character and Pipe_Obstacles every frame
2. WHEN the Ghost_Character contacts a Pipe_Obstacle, THE Game_Engine SHALL end the Game_Session
3. WHEN the Ghost_Character y-position is less than 0, THE Game_Engine SHALL end the Game_Session
4. WHEN the Ghost_Character y-position is greater than 600, THE Game_Engine SHALL end the Game_Session
5. THE Collision_Detector SHALL use rectangular bounding box collision detection with 80% of sprite dimensions

### Requirement 7: Score Tracking

**User Story:** As a player, I want to see my score increase, so that I can track my progress and compete with myself.

#### Acceptance Criteria

1. WHEN a Game_Session starts, THE Score_System SHALL initialize the score to 0
2. WHEN the Ghost_Character passes the center point of a Pipe_Obstacle, THE Score_System SHALL increment the score by 1
3. THE Score_System SHALL display the current score at the bottom center of the Canvas
4. THE Score_System SHALL render the score with font size 48 pixels in white color with black outline
5. THE Score_System SHALL count each Pipe_Obstacle only once for scoring

### Requirement 8: Game Over Handling

**User Story:** As a player, I want clear feedback when the game ends, so that I know my final score and can restart.

#### Acceptance Criteria

1. WHEN the Game_Session ends, THE Audio_System SHALL play assets/game_over.wav
2. WHEN the Game_Session ends, THE Game_Engine SHALL stop all Pipe_Obstacle movement
3. WHEN the Game_Session ends, THE Game_Engine SHALL display "Game Over" message at the center of the Canvas
4. WHEN the Game_Session ends, THE Game_Engine SHALL display the final score below the "Game Over" message
5. WHEN the Game_Session ends, THE Game_Engine SHALL display "Press SPACE to Restart" message
6. WHEN the player presses SPACE after game over, THE Game_Engine SHALL reset all game state and start a new Game_Session

### Requirement 9: Visual Rendering

**User Story:** As a player, I want retro-style graphics, so that the game has a nostalgic aesthetic.

#### Acceptance Criteria

1. THE Game_Engine SHALL render the background with light blue color (#87CEEB)
2. THE Game_Engine SHALL render cloud graphics as white rounded rectangles at fixed positions
3. THE Game_Engine SHALL render the Ghost_Character sprite at 40x40 pixels
4. THE Game_Engine SHALL render Pipe_Obstacles with green color (#4CAF50) and darker green borders (#2E7D32)
5. THE Game_Engine SHALL use pixel-perfect rendering without anti-aliasing for retro appearance
6. THE Game_Engine SHALL maintain consistent visual style across all game elements

### Requirement 10: Performance and Browser Compatibility

**User Story:** As a player, I want smooth gameplay in my browser, so that I have an enjoyable experience.

#### Acceptance Criteria

1. THE Game_Engine SHALL maintain 60 frames per second on modern browsers (Chrome, Firefox, Safari, Edge)
2. THE Game_Engine SHALL use requestAnimationFrame for the game loop
3. WHEN the browser tab loses focus, THE Game_Engine SHALL pause the Game_Session
4. WHEN the browser tab regains focus, THE Game_Engine SHALL resume the Game_Session
5. THE Game_Engine SHALL render all graphics using HTML5 Canvas API
6. THE Game_Engine SHALL complete initial load within 2 seconds on standard broadband connections
