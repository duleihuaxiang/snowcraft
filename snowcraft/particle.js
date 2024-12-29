class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Math.random() * 3 + 1;
        this.speed = Math.random() * 3 + 2;
        this.angle = Math.random() * Math.PI * 2;
        this.life = 1.0;  // 生命值从1递减到0
        this.decay = Math.random() * 0.02 + 0.02;  // 生命衰减速度
        
        // 随机选择粒子颜色
        const colors = ['#cce6ff', '#e6f2ff', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life -= this.decay;
        return this.life > 0;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace(')', `,${this.life})`);
        ctx.fill();
        ctx.closePath();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    createExplosion(x, y) {
        // 创建多个粒子形成爆炸效果
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(x, y));
        }
    }

    update() {
        this.particles = this.particles.filter(particle => particle.update());
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }
}
