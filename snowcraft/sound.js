class SoundManager {
    constructor() {
        this.audioContext = null;
        this.soundBuffers = {};
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        
        // 创建音频上下文
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建简单的音效
        this.createHitSound();
        this.createThrowSound();
        this.createDefeatSound();
        
        this.initialized = true;
    }

    createHitSound() {
        const duration = 0.1;
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < audioBuffer.length; i++) {
            // 创建一个短促的打击音效
            channelData[i] = Math.sin(i * 0.05) * Math.exp(-4 * i / audioBuffer.length);
        }
        
        this.soundBuffers.hit = audioBuffer;
    }

    createThrowSound() {
        const duration = 0.2;
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < audioBuffer.length; i++) {
            // 创建一个呼呼声效果
            const t = i / audioBuffer.length;
            channelData[i] = Math.sin(i * 0.03) * Math.exp(-2 * t) * 0.5;
        }
        
        this.soundBuffers.throw = audioBuffer;
    }

    createDefeatSound() {
        const duration = 0.3;
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < audioBuffer.length; i++) {
            // 创建一个下降音调的音效
            const t = i / audioBuffer.length;
            const frequency = 440 * Math.pow(0.5, t);
            channelData[i] = Math.sin(frequency * t * 0.1) * Math.exp(-3 * t) * 0.5;
        }
        
        this.soundBuffers.defeat = audioBuffer;
    }

    play(soundName) {
        if (!this.initialized) {
            this.initialize();
        }

        if (this.soundBuffers[soundName]) {
            // 确保音频上下文处于运行状态
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = this.soundBuffers[soundName];
            
            // 创建增益节点来控制音量
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0.3; // 设置音量为30%
            
            // 连接节点
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 播放音效
            source.start();
        }
    }
}
