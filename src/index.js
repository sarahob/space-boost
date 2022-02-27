import Phaser from "phaser";
import playerSprite from "./assets/player-sprite.png";
import platformDanger from "./assets/platform-danger.png";
import warp from "./assets/warp.png";
import gameOverScreenLose from "./assets/game-over.png";
import gameOverScreenWin from "./assets/game-over-win.png";
import floatSFX from "./assets/moving.wav";
import themeSFX from "./assets/theme.wav";
import deadSFX from "./assets/dead.wav";

let gameState = {
  objects: { platforms: null, player: null, warpPoint: null, score: null },
  sounds: { float: null, theme: null, death: null },
  input: { kb: null },
  gameover: false,
  score: 0,
};

const platformCoord_1 = [
  [80, 600],
  [177, 556],
  [255, 502],
  [90, 453],
  [172, 402],
  [268, 358],
  [120, 302],
  [100, 254],
  [172, 200],
  [290, 130],
  [169, 690],
  [219, 720],
];

function generatePlatforms() {
  platformCoord_1.forEach((arrCoord) => {
    this.gameState.objects.platforms.create(
      arrCoord[0],
      arrCoord[1],
      "platform-danger"
    );
  });
}

function preload() {
  this.load.audio("float", floatSFX);
  this.load.audio("theme", themeSFX);
  this.load.audio("death", deadSFX);
  this.load.image("warp", warp);
  this.load.image("platform-danger", platformDanger);
  this.load.image("game-over", gameOverScreenLose);
  this.load.image("game-over-win", gameOverScreenWin);
  this.load.spritesheet("player", playerSprite, {
    frameWidth: 32,
    frameHeight: 35,
  });
}

function create() {
  // set up game state
  this.gameState = gameState;

  this.gameState.input.kb = this.input.keyboard.createCursorKeys();

  this.gameState.objects.warpPoint = this.physics.add.group({
    immovable: true,
    allowGravity: false,
  });

  this.gameState.objects.warpPoint.create(175, 50, "warp");

  this.gameState.objects.platforms = this.physics.add.group({
    immovable: true,
    allowGravity: false,
  });

  this.gameState.objects.player = this.physics.add.sprite(185, 840, "player");

  this.gameState.score = 0;

  this.gameState.sounds.float = this.sound.add("float");
  this.gameState.sounds.theme = this.sound.add("theme");
  this.gameState.sounds.death = this.sound.add("death");

  this.gameState.objects.score = this.add.text(
    284,
    16,
    `score ${gameState.score}`,
    {
      fontFamily: "Arial",
      fontSize: "24px",
      fill: "#E5E5E5",
    }
  );

  // handle platforms
  const drawPlatforms = generatePlatforms.bind(this);

  drawPlatforms();

  const { player, platforms, warpPoint } = this.gameState.objects;

  player.setBounce(0.1);
  player.setGravityY(200);

  // create animations for player sprite
  this.anims.create({
    key: "walk-right",
    frames: this.anims.generateFrameNumbers("player", {
      frames: [4, 3],
      suffix: ".png",
    }),
    frameRate: 7,
    repeat: -1,
  });

  this.anims.create({
    key: "idle",
    frames: this.anims.generateFrameNumbers("player", {
      frames: [2],
      suffix: ".png",
    }),
    frameRate: 7,
    repeat: -1,
  });

  this.anims.create({
    key: "walk-left",
    frames: this.anims.generateFrameNumbers("player", {
      frames: [1, 0],
      suffix: ".png",
    }),
    frameRate: 7,
    repeat: -1,
  });

  // add colliders

  player.setCollideWorldBounds(true);

  const {
    sounds: { death },
    input: { kb },
  } = gameState;

  // add tweens for platforms
  platforms.children.entries.reverse().forEach((p, i) => {
    if (i % 2 === 0) {
      this.tweens.add({
        targets: p,
        x: p.x + 200,
        duration: 1200,
        ease: "Linear",
        yoyo: true,
        repeat: -1,
        delay: i === 0 ? 0 : 100 + i * 100,
      });
    } else {
      this.tweens.add({
        targets: p,
        x: p.x - 200,
        duration: 1200,
        ease: "Linear",
        yoyo: true,
        repeat: -1,
        delay: i === 0 ? 0 : 100 + i * 100,
      });
    }
  });

  // colliders
  this.physics.add.overlap(player, platforms, (p, x) => {
    gameState.gameover = true;

    death.play();

    this.add.image(195, 350, "game-over");

    this.physics.pause();
    this.anims.pauseAll();
    this.tweens.pauseAll();
  });

  this.physics.add.overlap(player, warpPoint, (p, x) => {
    gameState.gameover = true;
    this.add.image(195, 350, "game-over-win");

    this.physics.pause();
    this.anims.pauseAll();
    this.tweens.pauseAll();
  });
}

function update() {
  const {
    sounds,
    objects: { player, warpPoint },
    input: { kb },
  } = this.gameState;

  if (!sounds.theme.isPlaying) {
    sounds.theme.play();
  }

  warpPoint.children.entries[0].rotation += 0.1;

  if (Phaser.Input.Keyboard.JustDown(kb.left)) {
    gameState.score++;
  }

  if (Phaser.Input.Keyboard.JustDown(kb.right)) {
    gameState.score++;
  }

  if (kb.left.isDown) {
    this.gameState.objects.score.setText(`score: ${this.gameState.score}`);

    if (!sounds.float.isPlaying) {
      sounds.float.play();
    }
    player.setVelocityX(-100);
    player.setVelocityY(-100);

    player.setImmovable(true);
    player.body.setAllowGravity(false);

    player.play("walk-left", true);
  } else if (kb.right.isDown) {
    this.gameState.objects.score.setText(`score: ${this.gameState.score}`);

    if (!sounds.float.isPlaying) {
      sounds.float.play();
    }
    player.setVelocityX(100);
    player.setVelocityY(-100);

    player.setImmovable(true);
    player.body.setAllowGravity(false);

    player.play("walk-right", true);
  } else {
    if (sounds.float.isPlaying) {
      sounds.float.stop();
    }
    player.setImmovable(false);
    player.body.setAllowGravity(true);
    player.setVelocityX(0);
    player.play("idle");
  }

  if (kb.up.isDown) {
    if (this.gameState.gameover) {
      gameState.gameover = false;
      this.scene.restart();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 390,
  height: 800,
  backgroundColor: "#292B2C",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 100 },
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);
