const canvas = document.querySelector("canvas");
canvas.height = innerHeight;
canvas.width = innerWidth;
const c = canvas.getContext("2d");

const scoreID = document.querySelector("#scoreID");

const modalScoreID = document.querySelector("#modalScoreID");

const ReStartModalID = document.querySelector("#ReStartModalID");
const RestartButtonID = document.querySelector("#RestartButtonID");

const startModalID = document.querySelector("#startModalID");
const startButtonID = document.querySelector("#startButtonID");

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

class ProjectTile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class EnemyParticles {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }
  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.1;
  }
}
const x = canvas.width / 2;
const y = canvas.height / 2;
let player = new Player(x, y, 10, "#fff");

let enemies = [];
let projectTiles = [];
let particles = [];
let friction = 0.99;
let animationId;
let intervalID;
let score = 0;

function init() {
  player = new Player(x, y, 10, "#fff");
  enemies = [];
  projectTiles = [];
  particles = [];
  animationId;
  score = 0;
  scoreID.innerHTML=0
}

function swapEnemy() {
  intervalID = setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4;
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    var color = `hsl(${Math.random() * 360}, 50%,50%)`;
     const angle = Math.atan2(canvas.height/ 2 - y , canvas.width / 2 - x);

    const velocity = { x: Math.cos(angle), y: Math.sin(angle) };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0,0,0,0.1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
    //  particle.update()
  });

  projectTiles.forEach((projectTile, projectTileIndex) => {
    projectTile.update();
    if (
      projectTile.x + projectTile.radius < 0 ||
      projectTile.x - projectTile.radius > canvas.width ||
      projectTile.y + projectTile.radius < 0 ||
      projectTile.y - projectTile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectTiles.splice(projectTileIndex, 1);
      }, 0);
    }
  });

  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index];
    enemy.update();
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (distance - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      clearInterval(intervalID);
      gsap.fromTo(
        "#ReStartModalID",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          ease: "expo",
        }
      );
      ReStartModalID.style.display = "block";
      modalScoreID.innerHTML = score;
    }

    projectTiles.forEach((projectTile, projectTileIndex) => {
      const distance = Math.hypot(
        projectTile.x - enemy.x,
        projectTile.y - enemy.y
      );

      if (distance - enemy.radius - projectTile.radius < 1) {
        for (i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new EnemyParticles(
              projectTile.x,
              projectTile.y,
              Math.random() * 50,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }
        if (enemy.radius - 10 > 5) {
          score += 100;
          scoreID.innerHTML = score;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });

          projectTiles.splice(projectTileIndex, 1);
        } else {
          score += 150;
          scoreID.innerHTML = score;

          enemies.splice(index, 1);
          projectTiles.splice(projectTileIndex, 1);
        }
      }
    });
    // }
  }
}
const projectTile = new ProjectTile(
  canvas.width / 2,
  canvas.height / 2,
  5,
  "#FFF",
  { x: 1, y: 1 }
);
addEventListener("click", (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  projectTiles.push(
    new ProjectTile(canvas.width / 2, canvas.height / 2, 5, "#FFF", velocity)
  );
});

RestartButtonID.addEventListener("click", (event) => {
  init();
  animate();
  swapEnemy();
  gsap.to("#ReStartModalID", {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    ease: "expo.in",
    onComplete: () => {
      RestartButtonID.style.display = "none";
    },
  });
  
});

startButtonID.addEventListener("click", (event) => {
  init();
  animate();
  swapEnemy();

  gsap.to("#startModalID", {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    ease: "expo.in",
    onComplete: () => {
      startModalID.style.display = "none";
    },
  });
});
