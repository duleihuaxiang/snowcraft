class AI {
    constructor(player) {
        this.player = player;
        this.shootCooldown = 0;
        this.maxCooldown = 60;
        this.chargeDuration = 0;
        this.moveTimer = 0;
        this.targetY = this.player.y;
        this.targetX = this.player.x;
        this.moveSpeed = 0.3;  
    }

    update(target) {
        // 随机选择新的目标位置
        if (this.moveTimer <= 0) {
            // 随机选择Y坐标
            this.targetY = Math.random() * (600 - this.player.height);
            
            // 随机选择X坐标，可以移动到整个画布范围
            this.targetX = Math.random() * 700;  
            
            // 设置较长的移动间隔，让AI不会太频繁改变方向
            this.moveTimer = Math.random() * 300 + 200;
        }
        this.moveTimer--;

        // 平滑移动到目标位置
        const dx = this.targetX - this.player.x;
        const dy = this.targetY - this.player.y;

        // X方向移动
        if (Math.abs(dx) > 1) {
            this.player.x += Math.sign(dx) * this.moveSpeed;
        }

        // Y方向移动
        if (Math.abs(dy) > 1) {
            this.player.y += Math.sign(dy) * this.moveSpeed;
        }

        if (this.shootCooldown > 0) {
            this.shootCooldown--;
            return null;
        }

        // 随机决定是否开始蓄力
        if (!this.player.isCharging && Math.random() < 0.02) {
            this.player.startCharging();
            this.chargeDuration = Math.random() * 50 + 30;
        }

        // 如果正在蓄力
        if (this.player.isCharging) {
            this.player.updateCharge();
            this.chargeDuration--;

            // 蓄力结束时发射
            if (this.chargeDuration <= 0) {
                const power = this.player.shoot();
                this.shootCooldown = this.maxCooldown;

                // 根据与目标的相对位置决定射击角度
                const targetDx = target.x - this.player.x;
                const targetDy = target.y - this.player.y;
                const angle = Math.atan2(targetDy, targetDx);

                return {
                    power: power,
                    angle: angle  
                };
            }
        }

        return null;
    }
}
