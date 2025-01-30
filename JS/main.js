const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player;
let cursors;
let meteors;
let meteorSpeed = 150;
let score = 0;
let scoreText;
let timerText;
let elapsedTime = 0;

function preload() {
    this.load.image('background', 'Assets/space.jpg');
    this.load.image('player', 'Assets/player.png');
    this.load.image('meteor', 'assets/meteor.png');
}

function create() {
    this.add.image(400, 300, 'background');
    player = this.physics.add.sprite(400, 500, 'player').setScale(0.05);
    player.setCollideWorldBounds(true);
    cursors = this.input.keyboard.createCursorKeys();

    meteors = this.physics.add.group();
    // this.physics.add.collider(player, meteors, hitMeteor, null, this);


    this.time.addEvent({
        delay: 1000,
        callback: spawnMeteor,
        callbackScope: this,
        loop: true
    });

    scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', fill: '#fff' });
    timerText = this.add.text(20, 50, 'Time: 0', { fontSize: '24px', fill: '#fff' });

    this.time.addEvent({
        delay: 1000,
        callback: updateScoreAndTime,
        callbackScope: this,
        loop: true
    });
}

function update() {

    player.setVelocity(0);
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    }

    meteors.children.iterate(meteor => {
        if (meteor && meteor.y > 600) {
            meteor.destroy();
        }
    });

    this.physics.add.overlap(player, meteors, gameOver, null, this);
}

function spawnMeteor() {
    let x = Phaser.Math.Between(50,750);
    let meteor = meteors.create(x, 0, 'meteor').setScale(0.1);
    meteor.setVelocityY(meteorSpeed);
    meteorSpeed += 5;
}

function updateScoreAndTime() {
    score += 10;
    scoreText.setText('Score: ' + score);

    elapsedTime += 1;
    timerText.setText('Time: ' + elapsedTime + 's');
}

function gameOver() {
    this.scene.pause();
    this.add.text(300, 250, 'GAME OVER', { fontSize: '32px', fill: '#f00' });
}