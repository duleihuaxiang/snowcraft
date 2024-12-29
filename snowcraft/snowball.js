class Snowball {
    constructor(x, y, power, angle, isFromAI) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.power = power;
        this.speed = power * 0.15;
        this.angle = angle;
        this.isFromAI = isFromAI;
        this.gravity = 0.1;
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += this.gravity;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // 根据是否是AI的雪球使用不同的颜色
        if (this.isFromAI) {
            // AI的雪球使用浅红色
            ctx.fillStyle = '#ffcccc';
            ctx.strokeStyle = '#ff9999';
        } else {
            // 玩家的雪球使用浅蓝色
            ctx.fillStyle = '#cce6ff';
            ctx.strokeStyle = '#99ccff';
        }
        
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // 添加一个小亮点使雪球看起来更立体
        ctx.beginPath();
        ctx.arc(this.x - this.radius/3, this.y - this.radius/3, this.radius/4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        ctx.closePath();
    }

    checkCollision(player) {
        const dx = Math.abs(this.x - (player.x + player.width/2));
        const dy = Math.abs(this.y - (player.y + player.height/2));
        
        return dx < player.width/2 + this.radius && 
               dy < player.height/2 + this.radius;
    }
}
