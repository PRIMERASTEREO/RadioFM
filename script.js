document.addEventListener('DOMContentLoaded', () => {
    const config = window.radioConfig;
    const audio = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const albumArt = document.getElementById('album-art');
    const songTitleDisplay = document.getElementById('song-title');
    const stationNameDisplay = document.getElementById('station-name');
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');

    audio.src = config.streamUrl;
    audio.volume = volumeSlider ? volumeSlider.value : 0.8;

    const toggleMenu = () => {
        if (sideMenu && overlay) {
            sideMenu.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    };

    if (menuBtn) menuBtn.onclick = toggleMenu;
    if (closeBtn) closeBtn.onclick = toggleMenu;
    if (overlay) overlay.onclick = toggleMenu;

    if (playPauseBtn) {
        playPauseBtn.onclick = () => {
            if (audio.paused) {
                audio.play().catch(err => console.error("Error:", err));
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'inline-block';
            } else {
                audio.pause();
                if (playIcon) playIcon.style.display = 'inline-block';
                if (pauseIcon) pauseIcon.style.display = 'none';
            }
        };
    }

    if (volumeSlider) {
        volumeSlider.oninput = (e) => { audio.volume = e.target.value; };
    }

    async function updateMetadata() {
        try {
            const proxy = "https://api.codetabs.com/v1/proxy/?quest=";
            const url = `https://api.laut.fm/station/${config.stationSlug}/current_song`;
            const response = await fetch(proxy + encodeURIComponent(url));
            const data = await response.json();
            if (data && data.title) {
                songTitleDisplay.innerText = data.title;
                stationNameDisplay.innerText = data.artist.name;
                if (data.image && !data.image.includes('placeholder')) {
                    albumArt.src = data.image;
                } else {
                    buscarEnItunes(data.artist.name, data.title);
                }
            }
        } catch (e) { console.error("Error metadata"); }
    }

    async function buscarEnItunes(artista, tema) {
        try {
            const proxy = "https://api.codetabs.com/v1/proxy/?quest=";
            const query = encodeURIComponent(`${artista} ${tema}`);
            const itunesUrl = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;
            const res = await fetch(proxy + encodeURIComponent(itunesUrl));
            const itunesData = await res.json();
            if (itunesData.results.length > 0) {
                albumArt.src = itunesData.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
            } else {
                albumArt.src = "https://primerastereofm.netlify.app/images/PSRO5-8.png";
            }
        } catch (error) { albumArt.src = "https://primerastereofm.netlify.app/images/PSRO5-8.png"; }
    }

    function loadSocials() {
        const menuContainer = document.getElementById('menu-social-icons');
        if (!menuContainer) return;

        const brandColors = {
            facebook: '#1877F2', instagram: '#E4405F', whatsapp: '#25D366',
            twitter: '#1DA1F2', telegram: '#0088cc', tiktok: '#ff0050',
            soundcloud: '#ff3300', youtube: '#FF0000'
        };

        const icons = { 
            facebook: 'fab fa-facebook', instagram: 'fab fa-instagram', 
            whatsapp: 'fab fa-whatsapp', twitter: 'fab fa-x-twitter',
            telegram: 'fab fa-telegram', tiktok: 'fab fa-tiktok',
            soundcloud: 'fab fa-soundcloud', youtube: 'fab fa-youtube'
        };

        menuContainer.innerHTML = '';
        // FORZAR VERTICALIDAD TOTAL
        menuContainer.style.display = 'block'; 

        window.radioConfig.socialLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.target = "_blank";
            
            // ESTILO DE BOTÓN DE LISTA
            a.style.display = 'flex';
            a.style.alignItems = 'center';
            a.style.textDecoration = 'none';
            a.style.marginBottom = '12px';
            a.style.padding = '12px 15px';
            a.style.background = 'rgba(255, 255, 255, 0.1)';
            a.style.borderRadius = '12px';
            a.style.width = '100%';

            const color = brandColors[link.platform] || '#ffffff';
            const iconClass = icons[link.platform] || 'fas fa-link';

            a.innerHTML = `
                <i class="${iconClass}" style="color: ${color} !important; font-size: 24px !important; width: 35px; text-align: center;"></i>
                <span style="color: white !important; margin-left: 15px; font-size: 16px; font-family: sans-serif; text-transform: capitalize;">${link.platform}</span>
            `;
            menuContainer.appendChild(a);
        });
    }

    loadSocials();
    updateMetadata();
    setInterval(updateMetadata, 15000);
});
