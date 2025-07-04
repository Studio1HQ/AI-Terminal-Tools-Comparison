// Game state
let player;
let obstacles = [];
let score = 0;
let gameOver = false;
let gameSpeed = 5;
let buildings = [];

function setup() {
    createCanvas(800, 400);
    player = new Player();
    obstacles.push(new Obstacle());
    // Generate initial buildings for the skyline
    for (let i = 0; i < width / 50; i++) {
        buildings.push(new Building(i * 50));
    }
}

function draw() {
    if (gameOver) {
        background(0);
        textAlign(CENTER);
        fill(255);
        textSize(50);
        text("GAME OVER", width / 2, height / 2 - 20);
        textSize(20);
        text(`Score: ${floor(score)}`, width / 2, height / 2 + 20);
        text("Press 'r' to restart", width / 2, height / 2 + 60);
        return;
    }

    // Background
    background(20, 20, 40); // Dark blue night sky

    // Draw and move buildings for parallax effect
    for (let i = buildings.length - 1; i >= 0; i--) {
        buildings[i].update();
        buildings[i].show();
        if (buildings[i].offscreen()) {
            buildings.splice(i, 1);
            buildings.push(new Building(width));
        }
    }

    // Player
    player.update();
    player.show();

    // Obstacles
    if (frameCount % 75 === 0) {
        obstacles.push(new Obstacle());
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].show();

        if (obstacles[i].hits(player)) {
            gameOver = true;
        }

        if (obstacles[i].offscreen()) {
            obstacles.splice(i, 1);
        }
    }

    // Score
    score += 0.1;
    fill(255);
    textSize(20);
    textAlign(LEFT);
    text(`Score: ${floor(score)}`, 20, 30);

    // Increase speed
    gameSpeed += 0.001;
}

function keyPressed() {
    if (key === ' ') {
        player.jump();
    }
    if (key === 'r' && gameOver) {
        resetGame();
    }
}

function resetGame() {
    obstacles = [];
    score = 0;
    gameSpeed = 5;
    gameOver = false;
    player = new Player();
    obstacles.push(new Obstacle());
}

// Player class
class Player {
    constructor() {
        this.r = 50;
        this.x = 50;
        this.y = height - this.r;
        this.vy = 0;
        this.gravity = 0.6;
    }

    jump() {
        if (this.y === height - this.r) {
            this.vy = -15;
        }
    }

    update() {
        this.y += this.vy;
        this.vy += this.gravity;
        this.y = constrain(this.y, 0, height - this.r);
    }

    show() {
        fill(255, 50, 50);
        rect(this.x, this.y, this.r, this.r);
    }
}

// Obstacle class
class Obstacle {
    constructor() {
        this.r = 40;
        this.x = width;
        this.y = height - this.r;
    }

    update() {
        this.x -= gameSpeed;
    }

    offscreen() {
        return this.x < -this.r;
    }

    hits(player) {
        return (
            player.x < this.x + this.r &&
            player.x + player.r > this.x &&
            player.y < this.y + this.r &&
            player.y + player.r > this.y
        );
    }

    show() {
        fill(50, 255, 50);
        rect(this.x, this.y, this.r, this.r);
    }
}

// Building class for the skyline
class Building {
    constructor(x) {
        this.x = x;
        this.w = 50;
        this.h = random(50, 250);
        this.speed = gameSpeed / 4; // Slower speed for parallax
    }

    update() {
        this.x -= this.speed;
    }

    offscreen() {
        return this.x < -this.w;
    }

    show() {
        fill(40, 40, 60);
        rect(this.x, height - this.h, this.w, this.h);
    }
}
