class MusicPlayer {
    constructor() {
        this.isPlaying = false;
        this.currentTrackIndex = 0;
        this.audio = new Audio();
        this.autoPlayAttempted = false;
        
        this.playlist = [
            {
                title: "Дьявол!",
                artist: "Cupsize",
                src: "music/CUPSIZE_-_dyavol_79803706.mp3"
            },
            {
                title: "I AM EVIL", 
                artist: "dekma",
                src: "music/dekma,_hessfire,_endo!!_—_I_AM_EVIL_www_lightaudio_ru.mp3"
            },
            {
                title: "Сезон Охоты",
                artist: "GENJUTSU", 
                src: "music/GENJUTSU - сезон охоты.mp3"
            },
            {
                title: "Hangman's Eyes",
                artist: "LAZZY2WICE",
                src: "music/LAZZY2WICE_-_Hangmans_Eyes_73462949.mp3"
            },
            {
                title: "сдвг",
                artist: "TWEETT",
                src: "music/TWEETT - сдвг.mp3"
            }
        ];
        
        this.playPauseBtn = document.querySelector('.play-pause-btn');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.progress = document.querySelector('.progress');
        this.progressBar = document.querySelector('.progress-bar');
        this.currentTimeEl = document.querySelector('.current-time');
        this.durationEl = document.querySelector('.duration');
        this.trackNameEl = document.querySelector('.track-name');
        this.artistNameEl = document.querySelector('.artist-name');
        
        this.init();
    }
    
    init() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        this.progressBar.addEventListener('click', (e) => this.setProgress(e));
        this.progressBar.addEventListener('touchstart', (e) => this.handleTouchProgress(e));
        
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.nextTrack());
        
        this.loadTrack(this.currentTrackIndex);
        
        this.attemptAutoPlay();
        
        document.addEventListener('click', () => this.handleUserInteraction(), { once: true });
        document.addEventListener('keydown', () => this.handleUserInteraction(), { once: true });
        document.addEventListener('touchstart', () => this.handleUserInteraction(), { once: true });
    }
    
    handleTouchProgress(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = touch.clientX - rect.left;
        this.setProgress({ offsetX: clickX });
    }
    
    attemptAutoPlay() {
        if (this.autoPlayAttempted) return;
        this.autoPlayAttempted = true;
        
        const attempts = [
            { delay: 100, volume: 0.1 },
            { delay: 500, volume: 0.3 },
            { delay: 1000, volume: 0.5 },
            { delay: 2000, volume: 0.7 }
        ];
        
        attempts.forEach((attempt, index) => {
            setTimeout(() => {
                if (!this.isPlaying) {
                    this.audio.volume = attempt.volume;
                    this.audio.play().then(() => {
                        console.log('Автовоспроизведение успешно запущено!');
                        this.isPlaying = true;
                        document.querySelector('.play-icon').style.display = 'none';
                        document.querySelector('.pause-icon').style.display = 'block';
                    }).catch(error => {
                        console.log(`Попытка автовоспроизведения ${index + 1} не удалась`);
                        if (index === attempts.length - 1) {
                            document.querySelector('.play-icon').style.display = 'block';
                            document.querySelector('.pause-icon').style.display = 'none';
                        }
                    });
                }
            }, attempt.delay);
        });
    }
    
    handleUserInteraction() {
        if (!this.isPlaying) {
            this.audio.play().then(() => {
                this.isPlaying = true;
                document.querySelector('.play-icon').style.display = 'none';
                document.querySelector('.pause-icon').style.display = 'block';
            }).catch(e => {
                console.log('Воспроизведение после взаимодействия тоже заблокировано');
            });
        }
    }
    
    loadTrack(index) {
        const track = this.playlist[index];
        this.audio.src = track.src;
        this.trackNameEl.textContent = track.title;
        this.artistNameEl.textContent = track.artist;
        this.currentTrackIndex = index;
        
        this.audio.volume = 0.7;
        
        if (!this.autoPlayAttempted) {
            this.audio.play().catch(e => {
                
            });
        }
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        this.isPlaying = true;
        this.audio.play().catch(e => {
            console.log('Ошибка воспроизведения:', e);
            this.isPlaying = false;
        });
        document.querySelector('.play-icon').style.display = 'none';
        document.querySelector('.pause-icon').style.display = 'block';
    }
    
    pause() {
        this.isPlaying = false;
        this.audio.pause();
        document.querySelector('.play-icon').style.display = 'block';
        document.querySelector('.pause-icon').style.display = 'none';
    }
    
    previousTrack() {
        this.currentTrackIndex--;
        if (this.currentTrackIndex < 0) {
            this.currentTrackIndex = this.playlist.length - 1;
        }
        this.loadTrack(this.currentTrackIndex);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    nextTrack() {
        this.currentTrackIndex++;
        if (this.currentTrackIndex >= this.playlist.length) {
            this.currentTrackIndex = 0;
        }
        this.loadTrack(this.currentTrackIndex);
        if (this.isPlaying) {
            this.play();
        }
    }
    
    updateProgress() {
        if (this.audio.duration) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            this.progress.style.width = `${percent}%`;
            this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        }
    }
    
    updateDuration() {
        if (this.audio.duration) {
            this.durationEl.textContent = this.formatTime(this.audio.duration);
        }
    }
    
    setProgress(e) {
        if (this.audio.duration) {
            const width = this.progressBar.clientWidth;
            const clickX = e.offsetX;
            const duration = this.audio.duration;
            
            this.audio.currentTime = (clickX / width) * duration;
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});