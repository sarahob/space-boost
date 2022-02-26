import Phaser from "phaser";
import playerSprite from "./assets/player-sprite.png";
import platformDanger from "./assets/platform-danger.png";
import warp from "./assets/warp.png";
import floatSFX from "./assets/moving.wav";
import themeSFX from "./assets/theme.wav";
import deadSFX from "./assets/dead.wav";

let platforms;
let player;
let floatSound;
let themeMusic;
let goal;
let deathSound;

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
    platforms.create(arrCoord[0], arrCoord[1], "platform-danger");
  });
}

function preload() {
  this.load.audio("float", floatSFX);
  this.load.audio("theme", themeSFX);
  this.load.audio("death", deadSFX);
  this.load.image("warp", warp);
  this.load.image("platform-danger", platformDanger);
  this.load.spritesheet("player", playerSprite, {
    frameWidth: 32,
    frameHeight: 32,
  });
}

function create() {
  goal = this.physics.add.group({ immovable: true, allowGravity: false });
  goal.create(175, 50, "warp");

  platforms = this.physics.add.group({ immovable: true, allowGravity: false });

  const callGenerate = generatePlatforms.bind(this);

  callGenerate();

  player = this.physics.add.sprite(185, 840, "player");
  player.setBounce(0.1);
  player.setGravityY(200);

  // create animations for player sprite
  this.anims.create({
    key: "walk-right",
    frames: this.anims.generateFrameNumbers("player", {
      frames: [6, 5, 4],
      suffix: ".png",
    }),
    frameRate: 7,
    repeat: -1,
  });

  this.anims.create({
    key: "idle",
    frames: this.anims.generateFrameNumbers("player", {
      frames: [3],
      suffix: ".png",
    }),
    frameRate: 7,
    repeat: -1,
  });

  this.anims.create({
    key: "walk-left",
    frames: this.anims.generateFrameNumbers("player", {
      frames: [2, 1, 0],
      suffix: ".png",
    }),
    frameRate: 7,
    repeat: -1,
  });

  player.setCollideWorldBounds(true);

  // colliders
  this.physics.add.collider(player, platforms, (p, x) => {
    deathSound.play();

    this.add.text(80, 350, "Game Over.\nClick to play again.", {
      fontFamily: "Arial",
      fontSize: 32,
      color: "#ffffff",
    });

    this.physics.pause();
    this.anims.pauseAll();
    this.tweens.pauseAll();

    this.input.on("pointerup", () => {
      this.scene.restart();
    });
  });

  this.physics.add.collider(player, goal, (p, x) => {
    this.add.text(80, 350, "You escaped!/nwell done!", {
      fontFamily: "Arial",
      fontSize: 32,
      color: "#ffffff",
    });

    this.physics.pause();
    this.anims.pauseAll();
    this.tweens.pauseAll();

    this.input.on("pointerup", () => {
      this.anims.resumeAll();
      this.scene.restart();
    });
  });

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

  floatSound = this.sound.add("float");
  themeMusic = this.sound.add("theme");
  deathSound = this.sound.add("death");
}

function update() {
  if (!themeMusic.isPlaying) {
    themeMusic.play();
  }

  goal.children.entries[0].rotation += 0.1;

  const kb = this.input.keyboard.createCursorKeys();
  if (kb.left.isDown) {
    if (!floatSound.isPlaying) {
      floatSound.play();
    }
    player.setVelocityX(-100);
    player.setVelocityY(-100);
    player.play("walk-left", true);
  } else if (kb.right.isDown) {
    if (!floatSound.isPlaying) {
      floatSound.play();
    }
    player.setVelocityX(100);
    player.setVelocityY(-100);
    player.play("walk-right", true);
  } else {
    if (floatSound.isPlaying) {
      floatSound.stop();
    }
    player.setVelocityX(0);
    player.play("idle");
  }
}

const config = {
  type: Phaser.AUTO,
  width: 390,
  height: 844,
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
