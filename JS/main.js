class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        this.load.image('background', 'Assets/space.jpg');
        this.load.image('startButton', 'Assets/NewGame.png');
        this.load.image('quitButton', 'Assets/Quit.png');
    }

    create() {
        this.add.image(400, 300, 'background');
        this.add.text(100, 150, 'Meteor Madness', { fontSize: '76px', fill: '#fff' });

        let startButton = this.add.image(400, 350, 'startButton').setScale(0.5);
        startButton.setInteractive();

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        startButton.on('pointerover', () => startButton.setScale(0.65));
        startButton.on('pointerout', () => startButton.setScale(0.5));

        let quitButton = this.add.image(400, 500, 'quitButton').setScale(0.5);
        quitButton.setInteractive();

        quitButton.on('pointerdown', () => {
            window.close();
        });

        quitButton.on('pointerover', () => quitButton.setScale(0.65));
        quitButton.on('pointerout', () => quitButton.setScale(0.5));
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('background', 'Assets/space.jpg');
        this.load.image('player', 'Assets/player.png');
        this.load.image('meteor', 'Assets/meteor.png');
        this.load.image('PowerUp', 'Assets/PowerUp.jpg');
    }

    create() {
        this.add.image(400, 300, 'background');

        this.player = this.physics.add.sprite(400, 500, 'player').setScale(0.05);
        this.player.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();

        this.meteors = this.physics.add.group();
        this.powerUps = this.physics.add.group();

        this.score = 0;
        this.elapsedTime = 0;
        this.playerSpeed = 200;
        this.meteorSpeed = 150;
        this.powerUpSpeed = 150;
        this.timePerPower = 10000;

        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', fill: '#fff' });
        this.timerText = this.add.text(20, 50, 'Time: 0', { fontSize: '24px', fill: '#fff' });

        this.time.addEvent({ delay: 1000, callback: this.spawnMeteor, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 5000, callback: this.spawnPowerUp, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 1000, callback: this.updateScoreAndTime, callbackScope: this, loop: true });

        this.physics.add.overlap(this.player, this.meteors, this.gameOver, null, this);
        this.physics.add.overlap(this.player, this.powerUps, this.playerPower, null, this);
    }

    update() {
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-this.playerSpeed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.playerSpeed);
        }

        this.meteors.children.iterate(meteor => {
            if (meteor && meteor.y > 600) meteor.destroy();
        });

        this.powerUps.children.iterate(powerUp => {
            if (powerUp && powerUp.y > 600) powerUp.destroy();
        });
    }

    spawnMeteor() {
        let x = Phaser.Math.Between(50, 750);
        let meteor = this.meteors.create(x, 0, 'meteor').setScale(0.1);
        meteor.setVelocityY(this.meteorSpeed);
        this.meteorSpeed += 5;
    }

    spawnPowerUp() {
        let x = Phaser.Math.Between(50, 750);
        let powerUp = this.powerUps.create(x, 0, 'PowerUp').setScale(0.1);
        powerUp.setVelocityY(this.powerUpSpeed);
        this.powerUpSpeed += 5;
    }

    playerPower(player, powerUp) {
        powerUp.destroy();
        this.playerSpeed = 500;

        this.time.delayedCall(this.timePerPower, () => {
            this.playerSpeed = 200;
        }, [], this);
    }

    updateScoreAndTime() {
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        this.elapsedTime += 1;
        this.timerText.setText('Time: ' + this.elapsedTime + 's');
    }

    gameOver() {
        this.scene.pause();
        this.add.text(300, 250, 'GAME OVER', { fontSize: '32px', fill: '#f00' });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [MainMenuScene, GameScene]
};

const game = new Phaser.Game(config);
