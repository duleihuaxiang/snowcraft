class Player {
    constructor(x, y, isAI = false) {
        this.x = x;
        this.y = y;
        this.width = 30;  
        this.height = 45; 
        this.isAI = isAI;
        this.health = 100;
        this.isCharging = false;
        this.chargePower = 0;
        this.isDying = false;
        this.opacity = 1.0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        const bodyColor = this.isAI ? '#ffcccc' : '#ffffff';  
        const scarfColor = this.isAI ? '#ff6666' : '#4444ff'; 
        
        ctx.fillStyle = bodyColor;
        
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height - this.width/2, 
                this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        const middleY = this.y + this.height - this.width - this.width/3;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, middleY, 
                this.width/2.5, 0, Math.PI * 2);
        ctx.fill();
        
        const headY = this.y + this.width/2;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, headY, 
                this.width/3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = scarfColor;
        ctx.beginPath();
        ctx.rect(this.x + this.width/4, middleY - this.width/6, 
                this.width/2, this.width/3);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, middleY);
        ctx.lineTo(this.x + this.width/2 + this.width/3, middleY + this.width/3);
        ctx.lineTo(this.x + this.width/2 + this.width/4, middleY + this.width/3);
        ctx.lineTo(this.x + this.width/2, middleY + this.width/6);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        const eyeSize = this.width/10;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - eyeSize*1.5, headY - eyeSize, 
                eyeSize, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/2 + eyeSize*1.5, headY - eyeSize, 
                eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, headY);
        ctx.lineTo(this.x + this.width/2 + this.width/4, headY + this.width/8);
        ctx.lineTo(this.x + this.width/2, headY + this.width/8);
        ctx.closePath();
        ctx.fill();
        
        if (this.isCharging) {
            const barWidth = 40;
            const barHeight = 5;
            const barX = this.x;
            const barY = this.y - 10;
            
            ctx.fillStyle = '#666';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            ctx.fillStyle = '#ff0';
            ctx.fillRect(barX, barY, barWidth * (this.chargePower / 100), barHeight);
        }

        const healthBarWidth = 40;
        const healthBarHeight = 5;
        const healthBarX = this.x;
        const healthBarY = this.y - 20;
        
        ctx.fillStyle = '#666';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        ctx.fillStyle = this.isAI ? '#ff6666' : '#4444ff';  
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * (this.health / 100), healthBarHeight);
        
        ctx.restore();
    }

    startCharging() {
        if (!this.isDying) {
            this.isCharging = true;
            this.chargePower = 0;
        }
    }

    updateCharge() {
        if (this.isCharging && !this.isDying) {
            this.chargePower = Math.min(100, this.chargePower + 2);
        }
    }

    shoot() {
        if (!this.isDying) {
            const power = this.chargePower;
            this.isCharging = false;
            this.chargePower = 0;
            return power;
        }
        return 0;
    }

    takeDamage(amount) {
        if (!this.isDying) {
            this.health = Math.max(0, this.health - amount);
            if (this.health <= 0) {
                this.isDying = true;
                this.isCharging = false;
                this.chargePower = 0;
            }
        }
    }

    updateDying() {
        if (this.isDying) {
            this.opacity = Math.max(0, this.opacity - 0.02);
            return this.opacity > 0;
        }
        return true;
    }
}
