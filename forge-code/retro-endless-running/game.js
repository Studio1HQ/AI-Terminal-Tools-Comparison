// Game state management
let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
let score = 0;
let highScore = 0;
let gameSpeed = 2;
let frameCounter = 0;

// Player object
let player;
let obstacles = [];
let backgroundElements = [];
let particles = [];

// Game settings
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GROUND_HEIGHT = 80;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;

// Colors (retro palette)
const COLORS = {
    bg: '#001122',
    ground: '#2a4d3a',
    player: '#ff6b35',
    obstacle: '#ff0080',
    building: '#004466',
    window: '#ffff00',
    star: '#ffffff',
    particle: '#00ff88'
};

class Player {
    constructor() {
        this.x = 100;
        this.y = CANVAS_HEIGHT - GROUND_HEIGHT - 40;
        this.width = 30;
        this.height = 40;
        this.velocityY = 0;
        this.isJumping = false;
        this.groundY = CANVAS_HEIGHT - GROUND_HEIGHT - 40;
        this.animFrame = 0;
    }

    update() {
        // Apply gravity
        if (this.isJumping) {
            this.velocityY += GRAVITY;
            this.y += this.velocityY;

            // Check if landed
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.isJumping = false;
                this.velocityY = 0;
            }
        }

        // Animation
        this.animFrame += 0.2;
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = JUMP_FORCE;
            this.isJumping = true;
        }
    }

    draw() {
        push();
        translate(this.x + this.width/2, this.y + this.height/2);
        
        // Player body (pixel art style)
        fill(COLORS.player);
        noStroke();
        
        // Body
        rect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Simple animation - bobbing effect when running
        if (!this.isJumping) {
            let bob = sin(this.animFrame) * 2;
            translate(0, bob);
        }
        
        // Eyes
        fill(255);
        rect(-8, -15, 6, 6);
        rect(2, -15, 6, 6);
        
        // Pupils
        fill(0);
        rect(-6, -13, 2, 2);
        rect(4, -13, 2, 2);
        
        pop();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class Obstacle {
    constructor() {
        this.x = CANVAS_WIDTH + 50;
        this.y = CANVAS_HEIGHT - GROUND_HEIGHT - 50;
        this.width = 25;
        this.height = 50;
        this.speed = gameSpeed;
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        // Cactus-like obstacle
        fill(COLORS.obstacle);
        noStroke();
        
        // Main body
        rect(this.x, this.y, this.width, this.height);
        
        // Spikes
        for (let i = 0; i < 3; i++) {
            let spikeY = this.y + 10 + i * 15;
            triangle(
                this.x - 5, spikeY,
                this.x, spikeY - 5,
                this.x, spikeY + 5
            );
            triangle(
                this.x + this.width + 5, spikeY,
                this.x + this.width, spikeY - 5,
                this.x + this.width, spikeY + 5
            );
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

class Building {
    constructor(x, height, width = 60) {
        this.x = x;
        this.width = width;
        this.height = height;
        this.y = CANVAS_HEIGHT - GROUND_HEIGHT - height;
        this.windows = [];
        this.speed = gameSpeed * 0.3; // Parallax effect
        
        // Generate random windows
        for (let i = 0; i < Math.floor(height / 30); i++) {
            for (let j = 0; j < Math.floor(width / 15); j++) {
                if (random() > 0.3) {
                    this.windows.push({
                        x: j * 15 + 5,
                        y: i * 30 + 10,
                        lit: random() > 0.5
                    });
                }
            }
        }
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        // Building silhouette
        fill(COLORS.building);
        noStroke();
        rect(this.x, this.y, this.width, this.height);
        
        // Windows
        this.windows.forEach(window => {
            if (window.lit) {
                fill(COLORS.window);
                rect(this.x + window.x, this.y + window.y, 8, 12);
            }
        });
        
        // Building outline
        stroke(COLORS.building);
        strokeWeight(2);
        noFill();
        rect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = random(-2, 2);
        this.vy = random(-3, -1);
        this.life = 255;
        this.decay = random(3, 8);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw() {
        push();
        fill(red(COLORS.particle), green(COLORS.particle), blue(COLORS.particle), this.life);
        noStroke();
        rect(this.x, this.y, 3, 3);
        pop();
    }

    isDead() {
        return this.life <= 0;
    }
}

function setup() {
    let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    canvas.parent('game-container');
    
    // Initialize game
    player = new Player();
    
    // Load high score
    highScore = getItem('retroRunnerHighScore') || 0;
    updateUI();
    
    // Generate initial background
    generateBackground();
    
    // Show instructions
    showInstructions();
}

function draw() {
    // Clear background
    background(COLORS.bg);
    
    // Draw stars
    drawStars();
    
    // Update and draw background
    updateBackground();
    
    // Draw ground
    drawGround();
    
    if (gameState === 'playing') {
        // Update game speed
        gameSpeed = 2 + score * 0.01;
        
        // Update player
        player.update();
        
        // Spawn obstacles
        if (frameCount % Math.max(60 - Math.floor(score / 100), 30) === 0) {
            obstacles.push(new Obstacle());
        }
        
        // Update obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].speed = gameSpeed;
            obstacles[i].update();
            
            if (obstacles[i].isOffScreen()) {
                obstacles.splice(i, 1);
            }
        }
        
        // Check collisions
        checkCollisions();
        
        // Update score
        score += 1;
        frameCounter++;
        
        // Update particles
        updateParticles();
        
        // Draw everything
        drawGame();
        
        updateUI();
    } else if (gameState === 'menu') {
        // Draw static game elements
        player.draw();
        drawGame();
    } else if (gameState === 'gameOver') {
        // Draw game in paused state
        drawGame();
        showGameOver();
    }
}

function drawStars() {
    // Draw twinkling stars
    for (let i = 0; i < 50; i++) {
        let x = (i * 123) % CANVAS_WIDTH;
        let y = (i * 456) % (CANVAS_HEIGHT - GROUND_HEIGHT - 100);
        let twinkle = sin(frameCount * 0.1 + i) * 0.5 + 0.5;
        
        push();
        fill(255, 255, 255, twinkle * 255);
        noStroke();
        rect(x, y, 2, 2);
        pop();
    }
}

function updateBackground() {
    // Update buildings
    for (let i = backgroundElements.length - 1; i >= 0; i--) {
        backgroundElements[i].speed = gameSpeed * 0.3;
        backgroundElements[i].update();
        
        if (backgroundElements[i].isOffScreen()) {
            backgroundElements.splice(i, 1);
        }
    }
    
    // Add new buildings
    if (backgroundElements.length === 0 || 
        backgroundElements[backgroundElements.length - 1].x < CANVAS_WIDTH - 100) {
        let lastX = backgroundElements.length > 0 ? 
            backgroundElements[backgroundElements.length - 1].x + 
            backgroundElements[backgroundElements.length - 1].width : CANVAS_WIDTH;
        
        backgroundElements.push(new Building(
            lastX + random(10, 50),
            random(50, 200),
            random(40, 80)
        ));
    }
    
    // Draw buildings
    backgroundElements.forEach(building => building.draw());
}

function generateBackground() {
    backgroundElements = [];
    for (let x = 0; x < CANVAS_WIDTH + 200; x += random(60, 120)) {
        backgroundElements.push(new Building(x, random(50, 200), random(40, 80)));
    }
}

function drawGround() {
    // Ground
    fill(COLORS.ground);
    noStroke();
    rect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    
    // Ground pattern
    stroke(COLORS.building);
    strokeWeight(1);
    for (let x = 0; x < CANVAS_WIDTH; x += 20) {
        line(x, CANVAS_HEIGHT - GROUND_HEIGHT, x + 10, CANVAS_HEIGHT);
    }
}

function drawGame() {
    // Draw player
    player.draw();
    
    // Draw obstacles
    obstacles.forEach(obstacle => obstacle.draw());
    
    // Draw particles
    particles.forEach(particle => particle.draw());
}

function updateParticles() {
    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
    
    // Add running particles
    if (frameCount % 10 === 0 && !player.isJumping) {
        particles.push(new Particle(
            player.x + random(-5, 5),
            player.y + player.height
        ));
    }
}

function checkCollisions() {
    let playerBounds = player.getBounds();
    
    for (let obstacle of obstacles) {
        let obstacleBounds = obstacle.getBounds();
        
        if (playerBounds.x < obstacleBounds.x + obstacleBounds.width &&
            playerBounds.x + playerBounds.width > obstacleBounds.x &&
            playerBounds.y < obstacleBounds.y + obstacleBounds.height &&
            playerBounds.y + playerBounds.height > obstacleBounds.y) {
            
            gameOver();
            break;
        }
    }
}

function gameOver() {
    gameState = 'gameOver';
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        storeItem('retroRunnerHighScore', highScore);
    }
    
    // Add explosion particles
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(
            player.x + player.width/2,
            player.y + player.height/2
        ));
    }
    
    updateUI();
}

function resetGame() {
    gameState = 'playing';
    score = 0;
    gameSpeed = 2;
    frameCounter = 0;
    obstacles = [];
    particles = [];
    player = new Player();
    generateBackground();
    hideAllUI();
    updateUI();
}

function startGame() {
    resetGame();
}

function keyPressed() {
    if (key === ' ') {
        if (gameState === 'menu') {
            startGame();
        } else if (gameState === 'playing') {
            player.jump();
        } else if (gameState === 'gameOver') {
            resetGame();
        }
    }
}

// UI Management
function updateUI() {
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('high-score').textContent = `High Score: ${highScore}`;
}

function showInstructions() {
    document.getElementById('instructions').classList.remove('hidden');
}

function showGameOver() {
    document.getElementById('game-over').classList.remove('hidden');
}

function hideAllUI() {
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
}

// Prevent spacebar from scrolling the page
window.addEventListener('keydown', function(e) {
    if(e.keyCode === 32 && e.target === document.body) {
        e.preventDefault();
    }
});

// Touch support for mobile
function touchStarted() {
    if (gameState === 'menu') {
        startGame();
    } else if (gameState === 'playing') {
        player.jump();
    } else if (gameState === 'gameOver') {
        resetGame();
    }
    return false; // Prevent default
}