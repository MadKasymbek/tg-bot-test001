// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// Настройки движка Phaser
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    transparent: true,
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
    // Устанавливаем точный размер одного кадра для твоих спрайт-листов - 256x256 пикселей
    this.load.spritesheet('gladiator', 'gladiator.png', { 
        frameWidth: 256, 
        frameHeight: 256 
    });
    
    this.load.spritesheet('skeleton', 'skeleton.png', { 
        frameWidth: 256, 
        frameHeight: 256 
    });
}

// 2. СОЗДАНИЕ СЦЕНЫ И АНИМАЦИЙ
function create() {
    const centerY = window.innerHeight / 2 - 40;
    const playerX = window.innerWidth * 0.25;
    const enemyX = window.innerWidth * 0.75;

    // Добавляем спрайты. Смещаем их чуть ниже, так как сетка кадра большая
    playerSprite = this.add.sprite(playerX, centerY, 'gladiator').setScale(1.2);
    enemySprite = this.add.sprite(enemyX, centerY, 'skeleton').setScale(1.2);

    // Зеркалим врага, чтобы он смотрел на игрока
    enemySprite.setFlipX(true);

    // --- НАСТРОЙКА АНИМАЦИЙ (Используем точные номера кадров из твоих файлов) ---
    
    // Для Гладиатора: берем первые 4 кадра анимации IDLE (они идут сразу под текстом)
    // В сетке 256x256 на твоих листах первая строка героев - это кадры с 4 по 7.
    this.anims.create({
        key: 'hero_idle',
        frames: this.anims.generateFrameNumbers('gladiator', { start: 4, end: 7 }),
        frameRate: 5,
        repeat: -1
    });

    // Для Скелета: точно так же берем кадры анимации IDLE со второй строки
    this.anims.create({
        key: 'enemy_idle',
        frames: this.anims.generateFrameNumbers('skeleton', { start: 4, end: 7 }),
        frameRate: 5,
        repeat: -1
    });

    // ЗАПУСКАЕМ АНИМАЦИИ!
    playerSprite.play('hero_idle');
    enemySprite.play('enemy_idle');
}

function update() {}
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
