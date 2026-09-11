// Audio System with Hebrew text-to-speech and sound effects
class AudioSystem {
    constructor() {
        this.synth = window.speechSynthesis;
        this.sounds = {};
        this.setupSounds();
    }

    setupSounds() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Text-to-speech in Hebrew
    speak(text, options = {}) {
        if (!text) return;

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'he-IL'; // Hebrew Israel
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;

        this.synth.speak(utterance);
    }

    // Play sound effect using Web Audio API
    playSound(type) {
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const duration = 0.2;

        switch(type) {
            case 'click':
                this.playTone(ctx, 800, 0.1, now, duration);
                break;
            case 'door':
                this.playTone(ctx, 200, 0.15, now, duration * 2);
                break;
            case 'interaction':
                this.playTone(ctx, 600, 0.1, now, duration);
                this.playTone(ctx, 800, 0.1, now + 0.1, duration);
                break;
            case 'error':
                this.playTone(ctx, 300, 0.1, now, duration);
                break;
        }
    }

    playTone(ctx, frequency, volume, startTime, duration) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    // Hebrew phrases for interactions
    getHebrewPhrase(key) {
        const phrases = {
            welcome: "!ברוכים הבאים לבית שלי",
            livingroom: "אנחנו בסלון",
            kitchen: "אנחנו במטבח",
            bedroom: "אנחנו בחדר שינה",
            bathroom: "אנחנו בחדר האמבטיה",
            sofa: "זה הספה, היא נעימה מאוד",
            table: "זה שולחן הדינינג",
            bed: "זה מיטה רכה ונוחה",
            fridge: "זה מקרר, בו יש אוכל",
            sink: "זה כיור, כאן נשטוף ידיים",
            mirror: "זה מראה, אתה יכול להיראות בו",
            lamp: "זה מנורה, היא מאירה את החדר",
            window: "זו חלון, אתה יכול לראות את העולם החיצון",
            door: "זה דלת, אתה יכול לעבור דרכה"
        };
        return phrases[key] || "שלום";
    }
}

// Create global audio system
window.audioSystem = new AudioSystem();
