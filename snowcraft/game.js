class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;

        this.level = 1;
        this.score = 0;
        this.gameStarted = false;
        this.players = [];
        this.aiPlayers = [];
        this.snowballs = [];
        this.aiControllers = [];
        this.currentPlayerIndex = 0;
        this.particleSystem = new ParticleSystem();
        this.soundManager = new SoundManager();

        // 添加状态标志
        this.isLevelTransitioning = false;
        
        // 添加拖动相关状态
        this.isDragging = false;
        this.draggedPlayer = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.mouseX = 0;
        this.mouseY = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.gameStarted) return;
            
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;

            // 检查是否点击了雪人
            this.players.forEach((player, index) => {
                if (this.mouseX >= player.x && this.mouseX <= player.x + player.width &&
                    this.mouseY >= player.y && this.mouseY <= player.y + player.height) {
                    this.currentPlayerIndex = index;
                    
                    // 记录拖动起始位置
                    this.dragStartX = this.mouseX - player.x;
                    this.dragStartY = this.mouseY - player.y;
                    this.isDragging = true;
                    this.draggedPlayer = player;

                    // 同时开始蓄力
                    player.startCharging();
                    return;
                }
            });

            // 如果没有点击到雪人，也可以让当前选中的雪人蓄力
            if (!this.isDragging) {
                this.players[this.currentPlayerIndex].startCharging();
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.gameStarted) return;

            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;

            // 如果正在拖动，更新雪人位置
            if (this.isDragging && this.draggedPlayer) {
                const newX = this.mouseX - this.dragStartX;
                const newY = this.mouseY - this.dragStartY;

                // 只限制在画布范围内，不限制左右区域
                this.draggedPlayer.x = Math.min(Math.max(newX, 0), this.canvas.width - this.draggedPlayer.width);
                this.draggedPlayer.y = Math.min(Math.max(newY, 0), this.canvas.height - this.draggedPlayer.height);
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (!this.gameStarted) return;
            
            // 如果正在拖动，结束拖动并发射雪球
            if (this.isDragging) {
                const draggedPlayer = this.draggedPlayer;
                this.isDragging = false;
                this.draggedPlayer = null;

                // 如果正在蓄力，发射雪球
                if (draggedPlayer.isCharging) {
                    const power = draggedPlayer.shoot();
                    this.soundManager.play('throw');
                    this.snowballs.push(new Snowball(
                        draggedPlayer.x,
                        draggedPlayer.y + draggedPlayer.height/2,
                        power,
                        Math.PI,  // 向左射击
                        false
                    ));
                }
            } else {
                // 如果不是拖动，则是普通的发射雪球
                const currentPlayer = this.players[this.currentPlayerIndex];
                if (currentPlayer.isCharging) {
                    const power = currentPlayer.shoot();
                    this.soundManager.play('throw');
                    this.snowballs.push(new Snowball(
                        currentPlayer.x,
                        currentPlayer.y + currentPlayer.height/2,
                        power,
                        Math.PI,  // 向左射击
                        false
                    ));
                }
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            // 鼠标离开画布时结束拖动和蓄力
            if (this.isDragging && this.draggedPlayer) {
                this.draggedPlayer.isCharging = false;
            }
            this.isDragging = false;
            this.draggedPlayer = null;
        });

        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
    }

    startGame() {
        this.gameStarted = true;
        this.level = 1;
        this.score = 0;
        document.getElementById('score').textContent = `得分: ${this.score}`;
        document.getElementById('startMenu').style.display = 'none';
        
        // 初始化音频系统
        this.soundManager.initialize();
        
        // 播放一个音效来确保音频系统正常工作
        setTimeout(() => {
            this.soundManager.play('throw');
        }, 100);
        
        this.initLevel();
    }

    initLevel() {
        // 清空所有数组
        this.players = [];
        this.aiPlayers = [];
        this.snowballs = [];
        this.aiControllers = [];

        // 创建玩家的雪人
        for (let i = 0; i < 3; i++) {
            this.players.push(new Player(600, 150 + i * 200, false));
        }

        // 根据关卡等级创建AI雪人
        const numAI = 3 + (this.level - 1) * 2;  // 每关增加2个AI
        const spacing = this.canvas.height / (numAI + 1);
        
        for (let i = 0; i < numAI; i++) {
            const ai = new Player(50, spacing * (i + 1), true);
            this.aiPlayers.push(ai);
            this.aiControllers.push(new AI(ai));
        }

        // 更新关卡显示
        document.getElementById('level').textContent = `第${this.level}关`;
    }

    update() {
        if (!this.gameStarted || this.isLevelTransitioning) return;

        // 更新当前控制的玩家的蓄力状态
        if (this.players[this.currentPlayerIndex].isCharging) {
            this.players[this.currentPlayerIndex].updateCharge();
        }

        // 更新AI
        this.aiControllers.forEach((ai, index) => {
            if (!this.aiPlayers[index].isDying) {
                const shot = ai.update(this.players[this.currentPlayerIndex]);
                if (shot !== null) {
                    this.soundManager.play('throw');
                    this.snowballs.push(new Snowball(
                        this.aiPlayers[index].x + this.aiPlayers[index].width/2,
                        this.aiPlayers[index].y + this.aiPlayers[index].height/2,
                        shot.power,
                        shot.angle,
                        true
                    ));
                }
            }
        });

        // 更新所有玩家的状态
        this.players.forEach(player => {
            if (player.isDying) {
                player.updateDying();
            }
        });

        // 更新所有AI的状态
        this.aiPlayers.forEach(ai => {
            if (ai.isDying) {
                ai.updateDying();
            }
        });

        // 更新雪球和检查碰撞
        this.snowballs = this.snowballs.filter(snowball => {
            snowball.update();

            // 检查碰撞
            if (snowball.isFromAI) {
                // AI的雪球可以击中任何玩家雪人
                for (let player of this.players) {
                    if (!player.isDying && snowball.checkCollision(player)) {
                        this.soundManager.play('hit');
                        player.takeDamage(20);
                        this.particleSystem.createExplosion(snowball.x, snowball.y);
                        return false;
                    }
                }
            } else {
                // 玩家的雪球可以击中任何AI雪人
                for (let ai of this.aiPlayers) {
                    if (!ai.isDying && snowball.checkCollision(ai)) {
                        this.soundManager.play('hit');
                        ai.takeDamage(20);
                        if (ai.health <= 0) {
                            this.soundManager.play('defeat');
                        }
                        this.score += 10;
                        document.getElementById('score').textContent = `得分: ${this.score}`;
                        this.particleSystem.createExplosion(snowball.x, snowball.y);
                        return false;
                    }
                }
            }

            return snowball.x > 0 && 
                   snowball.x < this.canvas.width && 
                   snowball.y < this.canvas.height;
        });

        // 更新粒子系统
        this.particleSystem.update();

        // 检查游戏状态
        if (this.players.every(player => player.health <= 0)) {
            this.soundManager.play('defeat');
            alert('游戏结束！');
            this.gameStarted = false;
            document.getElementById('startMenu').style.display = 'block';
            return;
        }

        // 检查是否通过关卡
        const allAIDefeated = this.aiPlayers.every(ai => ai.isDying && ai.opacity <= 0);
        if (!this.isLevelTransitioning && allAIDefeated) {
            this.isLevelTransitioning = true;
            this.level++;
            setTimeout(() => {
                alert(`恭喜通过第${this.level-1}关！`);
                this.isLevelTransitioning = false;
                this.initLevel();
            }, 500);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制雪地背景
        this.ctx.fillStyle = '#f0f8ff';  // 淡蓝色的雪地背景
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制一些雪堆装饰
        this.ctx.fillStyle = '#ffffff';
        // 左边的雪堆
        this.ctx.beginPath();
        this.ctx.ellipse(100, this.canvas.height - 20, 150, 40, 0, 0, Math.PI * 2);
        this.ctx.fill();
        // 右边的雪堆
        this.ctx.beginPath();
        this.ctx.ellipse(this.canvas.width - 100, this.canvas.height - 20, 150, 40, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制半圆形庇护区域
        this.ctx.fillStyle = '#e6eeff';  // 略深一点的蓝色
        this.ctx.beginPath();
        this.ctx.arc(100, this.canvas.height / 2, 50, 0.5 * Math.PI, 1.5 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width - 100, this.canvas.height / 2, 50, 1.5 * Math.PI, 0.5 * Math.PI);
        this.ctx.fill();

        if (this.gameStarted) {
            // 绘制所有玩家
            this.players.forEach((player, index) => {
                player.draw(this.ctx);
                // 为当前控制的雪人添加高亮效果
                if (index === this.currentPlayerIndex) {
                    this.ctx.strokeStyle = '#ff0';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
                }
            });
            this.aiPlayers.forEach(ai => ai.draw(this.ctx));

            // 绘制雪球
            this.snowballs.forEach(snowball => snowball.draw(this.ctx));

            // 绘制粒子效果
            this.particleSystem.draw(this.ctx);
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 启动游戏
const game = new Game();
game.gameLoop();
