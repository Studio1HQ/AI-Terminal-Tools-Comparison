let player;
let obstacles = [];
let score = 0;
let gameSpeed = 4;
let gameOver = false;
let ground;
let buildings = [];
let stars = [];
let gameStarted = false;

// Colors
const colors = {
  sky: "#0f0f23",
  ground: "#2d4a22",
  player: "#ff6b6b",
  obstacle: "#8b5cf6",
  building: "#1e3a8a",
  buildingLight: "#fbbf24",
  star: "#ffffff",
  score: "#00ffff",
};

function setup() {
  let canvas = createCanvas(800, 400);
  canvas.parent("p5-canvas");

  // Initialize player
  player = {
    x: 100,
    y: height - 80,
    width: 20,
    height: 30,
    velY: 0,
    jumping: false,
    groundY: height - 80,
  };

  // Initialize ground
  ground = height - 50;

  // Generate stars
  for (let i = 0; i < 50; i++) {
    stars.push({
      x: random(width),
      y: random(height * 0.6),
      size: random(1, 3),
      twinkle: random(0.5, 1),
    });
  }

  // Generate buildings
  for (let i = 0; i < 15; i++) {
    buildings.push({
      x: i * 60,
      width: random(40, 80),
      height: random(60, 150),
      windows: [],
    });
  }

  // Add windows to buildings
  buildings.forEach((building) => {
    let windowRows = floor(building.height / 20);
    let windowCols = floor(building.width / 15);
    for (let row = 0; row < windowRows; row++) {
      for (let col = 0; col < windowCols; col++) {
        if (random() < 0.7) {
          building.windows.push({
            x: col * 15 + 5,
            y: row * 20 + 10,
            lit: random() < 0.6,
          });
        }
      }
    }
  });
}

function draw() {
  // Sky gradient
  for (let i = 0; i <= height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(colors.sky), color("#1a1a2e"), inter);
    stroke(c);
    line(0, i, width, i);
  }

  // Draw and animate stars
  fill(colors.star);
  noStroke();
  stars.forEach((star) => {
    let alpha = sin(millis() * 0.01 + star.x) * 0.5 + 0.5;
    fill(255, 255, 255, alpha * star.twinkle * 255);
    ellipse(star.x, star.y, star.size);
  });

  // Draw and scroll buildings
  buildings.forEach((building) => {
    // Building body
    fill(colors.building);
    stroke(colors.building);
    rect(building.x, ground - building.height, building.width, building.height);

    // Windows
    building.windows.forEach((window) => {
      if (window.lit) {
        fill(colors.buildingLight);
        rect(building.x + window.x, ground - building.height + window.y, 8, 12);
      }
    });

    // Scroll buildings
    if (gameStarted) {
      building.x -= gameSpeed * 0.5;
      if (building.x < -building.width) {
        building.x = width + random(20, 100);
        building.height = random(60, 150);
        building.windows = [];
        let windowRows = floor(building.height / 20);
        let windowCols = floor(building.width / 15);
        for (let row = 0; row < windowRows; row++) {
          for (let col = 0; col < windowCols; col++) {
            if (random() < 0.7) {
              building.windows.push({
                x: col * 15 + 5,
                y: row * 20 + 10,
                lit: random() < 0.6,
              });
            }
          }
        }
      }
    }
  });

  // Draw ground
  fill(colors.ground);
  noStroke();
  rect(0, ground, width, height - ground);

  // Add ground texture
  stroke(colors.ground);
  strokeWeight(2);
  for (let i = 0; i < width; i += 20) {
    line(i, ground + 10, i + 10, ground + 10);
  }

  if (!gameStarted && !gameOver) {
    // Start screen
    fill(colors.score);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Press SPACEBAR to start!", width / 2, height / 2);
    textSize(16);
    text("Jump over obstacles to survive!", width / 2, height / 2 + 40);
  } else if (gameStarted && !gameOver) {
    // Game logic
    updatePlayer();
    updateObstacles();
    updateScore();
    updateGameSpeed();

    // Draw player
    drawPlayer();

    // Draw obstacles
    obstacles.forEach((obstacle) => {
      drawObstacle(obstacle);
    });

    // Check collisions
    checkCollisions();
  }

  if (gameOver) {
    // Game over screen
    fill(255, 0, 0, 150);
    rect(0, 0, width, height);

    fill(colors.score);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("GAME OVER", width / 2, height / 2 - 40);
    textSize(18);
    text("Score: " + score, width / 2, height / 2);
    text("Press SPACEBAR to restart", width / 2, height / 2 + 40);
  }

  // Draw score
  if (gameStarted) {
    fill(colors.score);
    textAlign(LEFT, TOP);
    textSize(18);
    text("Score: " + score, 20, 30);
    text("Speed: " + gameSpeed.toFixed(1), 20, 55);
  }
}

function updatePlayer() {
  // Apply gravity
  if (player.jumping) {
    player.velY += 0.8;
    player.y += player.velY;

    // Check if landed
    if (player.y >= player.groundY) {
      player.y = player.groundY;
      player.jumping = false;
      player.velY = 0;
    }
  }
}

function updateObstacles() {
  // Add new obstacles
  if (frameCount % 90 === 0) {
    obstacles.push({
      x: width,
      y: ground - 30,
      width: 25,
      height: 30,
      passed: false,
    });
  }

  // Update obstacle positions
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= gameSpeed;

    // Remove obstacles that are off screen
    if (obstacles[i].x < -obstacles[i].width) {
      obstacles.splice(i, 1);
    }
  }
}

function updateScore() {
  score += 0.1;

  // Mark obstacles as passed for scoring
  obstacles.forEach((obstacle) => {
    if (!obstacle.passed && obstacle.x < player.x) {
      obstacle.passed = true;
      score += 10;
    }
  });
}

function updateGameSpeed() {
  gameSpeed = 4 + score * 0.005;
  if (gameSpeed > 12) gameSpeed = 12;
}

function drawPlayer() {
  fill(colors.player);
  noStroke();

  // Simple animated player sprite
  let bounce = sin(millis() * 0.3) * 2;
  if (!player.jumping) {
    rect(player.x, player.y + bounce, player.width, player.height);

    // Simple face
    fill(255);
    ellipse(player.x + 6, player.y + bounce + 8, 4);
    ellipse(player.x + 14, player.y + bounce + 8, 4);

    // Legs animation
    fill(colors.player);
    let legOffset = sin(millis() * 0.2) * 3;
    rect(player.x + 4, player.y + bounce + player.height, 4, 8 + legOffset);
    rect(player.x + 12, player.y + bounce + player.height, 4, 8 - legOffset);
  } else {
    // Jumping pose
    rect(player.x, player.y, player.width, player.height);
    fill(255);
    ellipse(player.x + 6, player.y + 8, 4);
    ellipse(player.x + 14, player.y + 8, 4);
  }
}

function drawObstacle(obstacle) {
  fill(colors.obstacle);
  noStroke();
  rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

  // Add some detail to obstacles
  fill(150, 100, 200);
  rect(
    obstacle.x + 5,
    obstacle.y + 5,
    obstacle.width - 10,
    obstacle.height - 10
  );

  // Glowing effect
  stroke(colors.obstacle);
  strokeWeight(2);
  noFill();
  rect(obstacle.x - 2, obstacle.y - 2, obstacle.width + 4, obstacle.height + 4);
}

function checkCollisions() {
  obstacles.forEach((obstacle) => {
    if (
      player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      player.y < obstacle.y + obstacle.height &&
      player.y + player.height > obstacle.y
    ) {
      gameOver = true;
      gameStarted = false;
    }
  });
}

function keyPressed() {
  if (key === " ") {
    if (!gameStarted && !gameOver) {
      // Start game
      gameStarted = true;
      score = 0;
      gameSpeed = 4;
      obstacles = [];
    } else if (gameOver) {
      // Restart game
      gameOver = false;
      gameStarted = true;
      score = 0;
      gameSpeed = 4;
      obstacles = [];
      player.y = player.groundY;
      player.jumping = false;
      player.velY = 0;
    } else if (gameStarted && !player.jumping) {
      // Jump
      player.jumping = true;
      player.velY = -15;
    }
  }
}

// Prevent default spacebar behavior
document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    e.preventDefault();
  }
});
