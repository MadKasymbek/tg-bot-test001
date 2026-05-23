// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// Настройки движка Phaser
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight - 220, // Оставляем место под нижнюю панель кнопок
    transparent: true,
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);
let playerSprite, enemySprite;
let isProcessing = false;
let isGameOver = false;

// Характеристики персонажей
let player = { hp: 100, maxHp: 100, dmg: 15, lvl: 1, gold: 0, exp: 0 };
let enemy = { hp: 80, maxHp: 80, dmg: 10, name: "Скелет-Воин" };

const zones = { "head": "голову", "body": "корпус", "legs": "ноги" };
const zoneKeys = ["head", "body", "legs"];

// Выбранные зоны по умолчанию
let selectedAtk = "head";
let selectedDef = "head";

function preload() {
    // Точный размер кадра на твоих спрайт-листах: 110x110 пикселей
    this.load.spritesheet('gladiator', 'gladiator.png', { frameWidth: 110, frameHeight: 110 });
    this.load.spritesheet('skeleton', 'skeleton.png', { frameWidth: 110, frameHeight: 110 });
}

function create() {
    const centerY = window.innerHeight / 2 - 100;
    const playerX = window.innerWidth * 0.25;
    const enemyX = window.innerWidth * 0.75;

    // Отрисовка персонажей (увеличиваем в 2.5 раза для сочного пиксель-арта)
    playerSprite = this.add.sprite(playerX, centerY, 'gladiator').setScale(2.5);
    enemySprite = this.add.sprite(enemyX, centerY, 'skeleton').setScale(2.5);
    enemySprite.setFlipX(true);

    // --- СОЗДАНИЕ АНИМАЦИЙ (Кадры посчитаны с учетом заголовков картинок) ---
    
    // Стойка (Idle) - начинается с 16 кадра (3-я строка спрайт-листа)
    this.anims.create({
        key: 'hero_idle',
        frames: this.anims.generateFrameNumbers('gladiator', { start: 16, end: 19 }),
        frameRate: 6, repeat: -1
    });
    this.anims.create({
        key: 'enemy_idle',
        frames: this.anims.generateFrameNumbers('skeleton', { start: 16, end: 19 }),
        frameRate: 6, repeat: -1
    });

    // Анимация удара (Attack general)
    this.anims.create({
        key: 'hero_atk',
        frames: this.anims.generateFrameNumbers('gladiator', { start: 24, end: 26 }),
        frameRate: 10, repeat: 0
    });
    this.anims.create({
        key: 'enemy_atk',
        frames: this.anims.generateFrameNumbers('skeleton', { start: 24, end: 26 }),
        frameRate: 10, repeat: 0
    });

    // Анимация получения урона (Hurt/Recoil)
    this.anims.create({
        key: 'hero_hurt',
        frames: this.anims.generateFrameNumbers('gladiator', { start: 32, end: 33 }),
        frameRate: 8, repeat: 0
    });
    this.anims.create({
        key: 'enemy_hurt',
        frames: this.anims.generateFrameNumbers('skeleton', { start: 32, end: 33 }),
        frameRate: 8, repeat: 0
    });

    // Смерть (Death)
    this.anims.create({
        key: 'enemy_death',
        frames: this.anims.generateFrameNumbers('skeleton', { start: 41, end: 43 }),
        frameRate: 5, repeat: 0
    });

    // Запуск анимации покоя
    playerSprite.play('hero_idle');
    enemySprite.play('enemy_idle');

    // Загрузка сохранений из Облака Telegram
    if (tg.initDataUnsafe?.user?.first_name) {
        document.getElementById('heroName').innerText = tg.initDataUnsafe.user.first_name;
    }
    
    tg.CloudStorage.getItem('mobitva_save_v3', (err, val) => {
        if (!err && val) {
            let s = JSON.parse(val);
            player.maxHp = s.maxHp || 100;
            player.hp = player.maxHp;
            player.dmg = s.dmg || 15;
            player.lvl = s.lvl || 1;
            player.gold = s.gold || 0;
            player.exp = s.exp || 0;
        }
        updateUI();
    });

    // Привязываем клики по зонам в HTML UI к движку
    initUiListeners();
}

function update() {}

// --- ЛОГИКА ИНТЕРФЕЙСА И КНОПОК ---
function initUiListeners() {
    const zonesEl = document.querySelectorAll('.btn-zone');
    zonesEl.forEach(btn => {
        btn.style.pointerEvents = 'auto'; // Явно разрешаем клики
        btn.onclick = (e) => {
            const parent = e.target.parentElement;
            const type = parent.querySelector('.zone-title').innerText;
            const value = e.target.getAttribute('data-zone');

            parent.querySelectorAll('.btn-zone').forEach(b => b.classList.remove('active-atk', 'active-def'));
            
            if (type === "АТАКА") {
                selectedAtk = value;
                e.target.classList.add('active-atk');
            } else {
                selectedDef = value;
                e.target.classList.add('active-def');
            }
        };
    });

    const actionBtn = document.querySelector('.btn-action');
    actionBtn.style.pointerEvents = 'auto';
    actionBtn.onclick = () => { processCombatTurn(); };
}

// --- СИСТЕМА ПОШАГОВОГО БОЯ ---
function processCombatTurn() {
    if (isGameOver || isProcessing) return;
    isProcessing = true;
    document.querySelector('.btn-action').disabled = true;

    const enemyAtk = zoneKeys[Math.floor(Math.random() * zoneKeys.length)];
    const enemyDef = zoneKeys[Math.floor(Math.random() * zoneKeys.length)];

    // 1. АТАКА ИГРОКА
    playerSprite.play('hero_atk');
    
    setTimeout(() => {
        if (selectedAtk === enemyDef) {
            logMsg(`🛡️ Скелет заблокировал твой удар в ${zones[selectedAtk]}!`, 'e');
        } else {
            let dmg = player.dmg + Phaser.Math.Between(0, 5);
            enemy.hp -= dmg;
            logMsg(`💥 Ты нанес Скелету ${dmg} урона в ${zones[selectedAtk]}.`, 'p');
            enemySprite.play('enemy_hurt');
        }
        updateUI();

        if (enemy.hp <= 0) return handleWin();

        // 2. ОТВЕТ СКЕЛЕТА
        setTimeout(() => {
            enemySprite.play('enemy_atk');
            
            setTimeout(() => {
                if (enemyAtk === selectedDef) {
                    logMsg(`🛡️ Прекрасный блок! Удар Скелета в ${zones[enemyAtk]} отражен.`, 'p');
                } else {
                    let eDmg = enemy.dmg + Phaser.Math.Between(0, 3);
                    player.hp -= eDmg;
                    logMsg(`💀 Скелет пробил твою защиту и нанес ${eDmg} урона в ${zones[enemyAtk]}.`, 'e');
                    playerSprite.play('hero_hurt');
                }
                updateUI();

                if (player.hp <= 0) return handleLose();

                // Возвращаем персонажей в стойку ожидания
                setTimeout(() => {
                    if (!isGameOver) {
                        playerSprite.play('hero_idle');
                        enemySprite.play('enemy_idle');
                        isProcessing = false;
                        document.querySelector('.btn-action').disabled = false;
                    }
                }, 300);

            }, 200);
        }, 600);

    }, 200);
}

function handleWin() {
    isGameOver = true;
    enemySprite.play('enemy_death');
    let goldEarned = 15 + player.lvl * 3;
    player.gold += goldEarned;
    player.exp += 50;

    logMsg(`🏆 ПОБЕДА! Скелет рассыпался в прах. Найдено: ${goldEarned} 💰`, 's');

    if (player.exp >= player.lvl * 100) {
        player.lvl++; player.maxHp += 15; player.dmg += 4; player.exp = 0;
        logMsg(`⭐ НОВЫЙ УРОВЕНЬ! Твой текущий уровень: ${player.lvl}.`, 's');
    }
    player.hp = player.maxHp;
    saveGame();
    endCombatUI();
}

function handleLose() {
    isGameOver = true;
    logMsg(`💀 Ты пал под ударами нежити. Воскрешение...`, 's');
    player.hp = player.maxHp;
    saveGame();
    endCombatUI();
}

function endCombatUI() {
    let btn = document.querySelector('.btn-action');
    btn.disabled = false;
    btn.innerText = "Искать новый бой";
    btn.style.background = "linear-gradient(135deg, #2ecc71, #27ae60)";
    btn.onclick = () => {
        enemy.hp = 60 + player.lvl * 10;
        isGameOver = false; isProcessing = false;
        playerSprite.play('hero_idle');
        enemySprite.play('enemy_idle');
        btn.innerText = "УДАРИТЬ";
        btn.style.background = "linear-gradient(135deg, #e67e22, #d35400)";
        btn.onclick = () => { processCombatTurn(); };
        logMsg("⚔️ Из темноты появляется новый противник!", "s");
        updateUI();
    };
}

function saveGame() {
    tg.CloudStorage.setItem('mobitva_save_v3', JSON.stringify({
        maxHp: player.maxHp, dmg: player.dmg, lvl: player.lvl, gold: player.gold, exp: player.exp
    }));
}

function updateUI() {
    document.getElementById('heroInfo').innerText = `Ур. ${player.lvl} | HP: ${Math.max(0, player.hp)}/${player.maxHp}`;
    document.getElementById('heroGold').innerText = player.gold;
    document.getElementById('enemyInfo').innerText = `HP: ${Math.max(0, enemy.hp)}/${enemy.maxHp}`;
    
    document.querySelector('.hero-hp').style.width = `${(player.hp / player.maxHp) * 100}%`;
    document.querySelector('.enemy-hp').style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
}

function logMsg(text, type) {
    let log = document.getElementById('log');
    let color = type === 'p' ? '#2ecc71' : (type === 'e' ? '#e74c3c' : '#f1c40f');
    log.innerHTML += `<div style="color:${color}; margin-bottom:4px;">${text}</div>`;
    log.scrollTop = log.scrollHeight;
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
