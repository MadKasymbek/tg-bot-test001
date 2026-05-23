// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// Настройки движка Phaser
const config = {
    type: Phaser.AUTO,
    parent: 'game-container', // ID div-а из HTML
    width: window.innerWidth,
    height: window.innerHeight,
    transparent: true, // Прозрачный фон, если захочешь задать его через CSS
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let playerSprite;
let enemySprite;

// 1. ЗАГРУЗКА АССЕТОВ
function preload() {
    // Грузим фон (положи любую картинку bg.jpg в папку assets)
    // this.load.image('bg', 'assets/bg.jpg'); 

    // Загружаем твои Спрайт-листы. 
    // ВНИМАНИЕ: frameWidth и frameHeight должны точно совпадать с размером ОДНОГО кадра в твоей картинке!
    this.load.spritesheet('gladiator', 'assets/gladiator.png', { 
        frameWidth: 128, 
        frameHeight: 128 
    });
    
    this.load.spritesheet('skeleton', 'assets/skeleton.png', { 
        frameWidth: 128, 
        frameHeight: 128 
    });
}

// 2. СОЗДАНИЕ СЦЕНЫ И АНИМАЦИЙ
function create() {
    // Если есть фон, раскомментируй:
    // let bg = this.add.image(window.innerWidth/2, window.innerHeight/2, 'bg');
    // bg.setDisplaySize(window.innerWidth, window.innerHeight);

    // Вычисляем координаты для персонажей (чтобы стояли красиво по центру экрана)
    const centerY = window.innerHeight / 2 - 50;
    const playerX = window.innerWidth * 0.25;
    const enemyX = window.innerWidth * 0.75;

    // Добавляем спрайты на экран (увеличиваем их в 1.5 раза через setScale для пиксель-арта)
    playerSprite = this.add.sprite(playerX, centerY, 'gladiator').setScale(1.5);
    enemySprite = this.add.sprite(enemyX, centerY, 'skeleton').setScale(1.5);

    // Зеркалим врага, чтобы он смотрел на игрока (если на картинке он смотрит вправо)
    enemySprite.setFlipX(true);

    // --- СОЗДАНИЕ АНИМАЦИЙ ---
    
    // Анимация стойки Гладиатора (кадры 0, 1, 2, 3 из файла)
    this.anims.create({
        key: 'hero_idle',
        frames: this.anims.generateFrameNumbers('gladiator', { start: 0, end: 3 }),
        frameRate: 6,      // Скорость анимации (кадров в секунду)
        repeat: -1         // Зациклить бесконечно
    });

    // Анимация стойки Скелета
    this.anims.create({
        key: 'enemy_idle',
        frames: this.anims.generateFrameNumbers('skeleton', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
    });

    // ЗАПУСКАЕМ АНИМАЦИИ!
    playerSprite.play('hero_idle');
    enemySprite.play('enemy_idle');
}

// 3. ИГРОВОЙ ЦИКЛ (вызывается каждый кадр, пока оставляем пустым)
function update() {}
