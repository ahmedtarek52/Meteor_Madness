let isGameOver = false;

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
        this.load.image('speed', 'Assets/speed.png');
        this.load.image('shield', 'Assets/shield.png'); 
        this.load.image('rareMeteor', 'Assets/rareMeteor.png');
        this.load.image('restartImage', 'Assets/Restart.png');


        this.load.audio('bgMusic', 'Assets/background.mp3');  
        this.load.audio('meteorHit', 'Assets/meteorHit.mp3');  
        this.load.audio('powerUpSound', 'Assets/powerUp.mp3'); 
        this.load.audio('collect', 'Assets/collect.mp3'); 


    }

    create() {
        this.add.image(400, 300, 'background');
        this.bgmusic = this.sound.add('bgMusic', { loop: true , volume: 0.5});
        this.bgmusic.play();

        this.player = this.physics.add.sprite(500, 500, 'player').setScale(0.3);
        this.player.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();

        this.player2 = this.physics.add.sprite(400, 500, 'player').setScale(0.2);
        this.player2.setCollideWorldBounds(true);
        this.keys = this.input.keyboard.addKeys({ left: 'A', right: 'D' });

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
        
        this.physics.add.overlap(this.player, this.meteors, this.handleMeteorCollision, null, this);
        this.physics.add.overlap(this.player, this.powerUps, this.playerPower, null, this);
        this.physics.add.overlap(this.player2, this.meteors, this.handleMeteorCollision, null, this);
        this.physics.add.overlap(this.player2, this.powerUps, this.playerPower, null, this);
        
        this.meteorCollision = this.physics.add.overlap(this.player, this.meteors, this.gameOver, null, this);
        this.meteorCollision2 = this.physics.add.overlap(this.player2, this.meteors, this.gameOver, null, this)
    }

    update() {
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-this.playerSpeed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.playerSpeed);
        }

        this.player2.setVelocity(0);
        if (this.keys.left.isDown) {
            this.player2.setVelocityX(-this.playerSpeed);
        } else if (this.keys.right.isDown) {
            this.player2.setVelocityX(this.playerSpeed);
        }

        this.meteors.children.iterate(meteor => {
            if (meteor && meteor.y > 600) meteor.destroy();
        });


    }



    spawnMeteor() {
        if (!isGameOver) {
            let x;
            do {
                x = Phaser.Math.Between(50, 750);
            } while (Math.abs(x - this.player.x) < 50 || Math.abs(x - this.player2.x) < 50);
    
            let isRare = Phaser.Math.Between(1, 10) === 1;
            let meteorType = isRare ? 'rareMeteor' : 'meteor';
            let meteor = this.meteors.create(x, 0, meteorType).setScale(isRare ? 0.15 : 0.1);
            meteor.setVelocityY(this.meteorSpeed);
    
            if (this.meteorSpeed < 500) {
                this.meteorSpeed += 2;
            }
        }
    }
    
    
    handleMeteorCollision(player, meteor) {
        if (!meteor || !meteor.texture) return; // Prevent errors
    
        if (player.tintTopLeft === 0x0000ff) { // Check if shield is active
            meteor.destroy(); // Destroy meteor without losing
            return;
        }
    
        if (meteor.texture.key === 'rareMeteor') {
            this.score += 50;
            this.scoreText.setText('Score: ' + this.score);
            this.sound.play('collect');
            meteor.destroy();
        } else {
            this.sound.play('meteorHit');
            this.gameOver();
        }
    }
    

    updateScoreAndTime() {
        if (isGameOver) return;
    
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        this.elapsedTime += 1;
        this.timerText.setText('Time: ' + this.elapsedTime + 's');
    }


    

    spawnPowerUp() {
        if (!isGameOver) {
            let x = Phaser.Math.Between(50, 750);
            let type = Phaser.Math.Between(0, 1) === 0 ? 'speed' : 'shield'; // Randomly select power-up type
    
            let powerup = this.powerUps.create(x, 0, type).setScale(0.1);
            powerup.setVelocityY(this.powerUpSpeed);
        }
    }


    playerPower(player, powerup) {
        this.sound.play('powerUpSound');
        if (powerup.texture.key === 'speed') {
            this.activateSpeedBoost(player);
        } else if (powerup.texture.key === 'shield') {
            this.activateShield(player);
        }
        powerup.destroy();
    }

    activateSpeedBoost(player) {
        player.setTint(0x00ff00); // Green tint to indicate speed boost
        player.speedBoostActive = true;
        this.playerSpeed = 400; 
    
        this.time.delayedCall(5000, () => {
            player.clearTint();
            player.speedBoostActive = false;
            this.playerSpeed = 200;
        });
    }
    
    activateShield(player) {
        player.setTint(0x0000ff); // Blue tint for shield
    
        if (player === this.player) {
            this.meteorCollision.active = false;
            this.physics.world.removeCollider(this.meteorCollision);
            this.physics.world.removeCollider(this.meteorCollision2);
        } 
        if (player === this.player2) {
            this.meteorCollision2.active = false;
            this.physics.world.removeCollider(this.meteorCollision);
            this.physics.world.removeCollider(this.meteorCollision2);
        }
    
        this.time.delayedCall(5000, () => {
            player.clearTint();
            
            // Restore collisions after shield expires
            this.meteorCollision = this.physics.add.overlap(this.player, this.meteors, this.gameOver, null, this);
            this.meteorCollision2 = this.physics.add.overlap(this.player2, this.meteors, this.gameOver, null, this);
        });
    }
    
    
    

    gameOver() {
        if (isGameOver) return;
    
        isGameOver = true;
        this.playerSpeed = 0;
        this.meteorSpeed = 0;
       this.bgmusic.stop();
        this.add.text(170, 150, 'GAME OVER', { fontSize: '72px', fill: '#f00' });
    
        let restartButton = this.add.image(400, 350, 'restartImage').setScale(0.5);
        restartButton.setInteractive();
    
        restartButton.on('pointerdown', () => {
            isGameOver = false;
            this.playerSpeed = 200;
            this.meteorSpeed = 150;
            this.score = 0;
            this.elapsedTime = 0;
            this.scene.restart();
        });
    
        restartButton.on('pointerover', () => restartButton.setScale(0.65));
        restartButton.on('pointerout', () => restartButton.setScale(0.5));
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
