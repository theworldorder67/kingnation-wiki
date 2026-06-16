/* 
    ========================================================================
    WIKI KING NATION - LOGIQUE INTERACTIVE ET EFFETS AUDIO
    ========================================================================
    Ce script gère le fonctionnement Single Page Application (SPA), la navigation
    d'onglets, les reflets lumineux dynamiques (Glow Tracker) et le synthétiseur
    de sons rétro-gaming via l'API Web Audio pour une immersion totale.
*/

document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================
    // 1. SYNTHÉTISEUR DE SONS INTERACTIFS (WEB AUDIO API)
    // =====================================================================
    let audioCtx = null;

    /**
     * Initialise l'AudioContext (requis suite aux règles d'interaction navigateur)
     */
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Fonction utilitaire pour jouer une note douce
    const playTone = (freq, type, duration, vol, startTime) => {
        try {
            if (!audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(vol, startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
        } catch(e) {}
    };

    function playHoverSound() {
        initAudio();
        if (!audioCtx || audioCtx.state === 'suspended') return;
        // Petit "tic" très discret au survol
        playTone(1200, 'sine', 0.03, 0.005, audioCtx.currentTime);
    }

    function playClickSound() {
        initAudio();
        if (!audioCtx || audioCtx.state === 'suspended') return;
        // Clic mécanique doux pour les boutons standards
        const t = audioCtx.currentTime;
        playTone(300, 'triangle', 0.05, 0.02, t);
        playTone(150, 'triangle', 0.08, 0.02, t + 0.02);
    }

    function playTabSound() {
        initAudio();
        if (!audioCtx || audioCtx.state === 'suspended') return;
        // Son de changement d'onglet (Doux et fluide)
        const t = audioCtx.currentTime;
        playTone(600, 'sine', 0.1, 0.03, t);
        playTone(800, 'sine', 0.15, 0.03, t + 0.04);
    }

    function playSubTabSound() {
        initAudio();
        if (!audioCtx || audioCtx.state === 'suspended') return;
        // Son de changement de sous-onglet (Plus aigu, plus léger)
        const t = audioCtx.currentTime;
        playTone(900, 'sine', 0.08, 0.02, t);
        playTone(1200, 'sine', 0.1, 0.02, t + 0.03);
    }

    function playDiscordSound() {
        initAudio();
        if (!audioCtx || audioCtx.state === 'suspended') return;
        // Son type notification amusante (clin d'oeil à Discord)
        const t = audioCtx.currentTime;
        playTone(587.33, 'sine', 0.1, 0.04, t);     // D5
        playTone(880.00, 'sine', 0.25, 0.04, t + 0.1); // A5
    }

    /**
     * Joue un son de confirmation propre et premium pour le téléchargement
     */
    function playEpicDownloadSound() {
        try {
            initAudio();
            if (!audioCtx || audioCtx.state === 'suspended') return;
            const t = audioCtx.currentTime;
            // Double ping très propre (UI moderne)
            playTone(880, 'sine', 0.1, 0.08, t); // A5 rapide
            playTone(1760, 'sine', 0.3, 0.08, t + 0.08); // A6 cristallin
        } catch (e) {
            console.error(e);
        }
    }

    // Association des sons aux éléments interactifs principaux
    function attachSoundEffects() {
        // Pour gérer tous les survols globalement
        document.querySelectorAll('a, button, .tab-item, .continent-tab-btn, .discord-link').forEach(el => {
            if (!el.dataset.hoverAttached) {
                el.addEventListener('mouseenter', playHoverSound);
                el.dataset.hoverAttached = "true";
            }
        });

        // Onglets Principaux
        document.querySelectorAll('.tab-item').forEach(el => {
            if (el.dataset.clickAttached) return;
            el.addEventListener('click', playTabSound);
            el.dataset.clickAttached = "true";
        });

        // Sous-Onglets (Continents)
        document.querySelectorAll('.continent-tab-btn').forEach(el => {
            if (el.dataset.clickAttached) return;
            el.addEventListener('click', playSubTabSound);
            el.dataset.clickAttached = "true";
        });

        // Liens Discord
        document.querySelectorAll('.discord-link').forEach(el => {
            if (el.dataset.clickAttached) return;
            el.addEventListener('click', playDiscordSound);
            el.dataset.clickAttached = "true";
        });

        // Boutons standards restants
        document.querySelectorAll('.btn-action, .btn-action-primary, .btn-action-secondary, .header-brand, .mobile-menu-toggle').forEach(el => {
            if (el.dataset.clickAttached) return;
            el.addEventListener('click', playClickSound);
            el.dataset.clickAttached = "true";
        });
    }


    // =====================================================================
    // 2. EFFET GLOW TRACKER (REFLET LUMINEUX DYNAMIQUE)
    // =====================================================================
    function initGlowTracker() {
        const glowSelectors = [
            '.card', 
            '.feature-showcase-card', 
            '.dashboard-hero-card', 
            '.download-main-card', 
            '.staff-profile-card', 
            '.join-step-card', 
            '.command-block-card'
        ];

        glowSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(card => {
                if (card.dataset.glowInitialized) return;

                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    card.style.setProperty('--mouse-x', `${x}px`);
                    card.style.setProperty('--mouse-y', `${y}px`);
                });

                card.dataset.glowInitialized = "true";
            });
        });
    }


    // =====================================================================
    // 3. NAVIGATION SPA ET ROUTAGE
    // =====================================================================
    const sections = document.querySelectorAll('.content-section');
    const tabItems = document.querySelectorAll('.tab-item');

    /**
     * Affiche une section spécifique et met à jour l'onglet actif.
     * @param {string} targetId - L'ID de la section à afficher (ex: 'accueil')
     */
    function showSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        // Désactive toutes les sections
        sections.forEach(sec => sec.classList.remove('active'));
        // Active la section ciblée (déclenchera l'animation CSS)
        targetSection.classList.add('active');

        // Met à jour la classe 'active' sur les onglets du menu
        tabItems.forEach(tab => {
            if (tab.getAttribute('data-target') === targetId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Remonte automatiquement en haut de la page de contenu
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Gère le routage par fragment d'URL (ex: index.html#reglement)
     */
    function handleRouting() {
        const hash = window.location.hash.substring(1);
        
        // Si aucune ancre, charge la section de l'onglet marqué actif par défaut dans le HTML (Règlement)
        if (!hash) {
            const defaultActiveTab = document.querySelector('.tab-item.active');
            if (defaultActiveTab) {
                showSection(defaultActiveTab.getAttribute('data-target'));
            } else {
                showSection('reglement');
            }
        } else {
            showSection(hash);
        }
    }

    // Écoute le changement d'ancre dans l'URL
    window.addEventListener('hashchange', handleRouting);
    // Exécute le routage au premier chargement
    handleRouting();


    // =====================================================================
    // 4. MENU MOBILE BURGER
    // =====================================================================
    const menuToggle = document.getElementById('menuToggle');
    const headerActions = document.querySelector('.header-actions');

    if (menuToggle && headerActions) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            headerActions.classList.toggle('mobile-open');
        });

        document.addEventListener('click', () => {
            headerActions.classList.remove('mobile-open');
        });
    }


    // =====================================================================
    // 5. RÉCUPÉRATION DYNAMIQUE DE LA CONFIGURATION DU TÉLÉCHARGEMENT
    // =====================================================================
    // URL brute (raw) du Gist contenant la configuration du Launcher et de Discord.
    const LAUNCHER_GIST_URL = "https://gist.githubusercontent.com/theworldorder67/c94494129dae6e8b8d9927bf845bfda0/raw/gistfile1.txt";

    function fetchDownloadConfig() {
        const downloadBtn = document.getElementById('launcherDownloadBtn');
        const suspendedWarning = document.getElementById('downloadSuspendedWarning');
        const statusDot = document.querySelector('.server-status-badge .status-dot');
        const statusText = document.querySelector('.server-status-badge span:last-child');

        if (!downloadBtn) return;

        function applyConfig(config) {
            // Mise à jour de tous les liens Discord dynamiquement
            if (config.discord_url) {
                document.querySelectorAll('.discord-link').forEach(link => {
                    link.setAttribute('href', config.discord_url);
                });
            }

            // Vérification de l'état du launcher
            const isEnabled = config.download_enabled === true || String(config.download_enabled).toLowerCase() === 'true';
            
            if (isEnabled) {
                // Téléchargement disponible -> Bouton vert actif
                downloadBtn.classList.remove('disabled');
                downloadBtn.classList.remove('btn-unavailable');
                downloadBtn.classList.add('btn-available');
                downloadBtn.setAttribute('href', config.download_url);
                
                // On ajoute l'événement clic épique
                downloadBtn.addEventListener('click', () => {
                    playEpicDownloadSound();
                    
                    // Animations CSS
                    downloadBtn.classList.add('epic-click-anim');
                    const logo = document.querySelector('.download-glowing-logo');
                    if (logo) logo.classList.add('epic-logo-anim');
                    
                    // Retire les classes d'animation après 800ms
                    setTimeout(() => {
                        downloadBtn.classList.remove('epic-click-anim');
                        if (logo) logo.classList.remove('epic-logo-anim');
                    }, 800);
                });
                
                downloadBtn.innerHTML = `
                    <svg class="download-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>Télécharger pour Windows (.exe)</span>
                `;

                if (suspendedWarning) {
                    suspendedWarning.style.display = 'none';
                }
                if (statusDot && statusText) {
                    statusDot.style.backgroundColor = '#10b981'; // Vert
                    statusDot.style.boxShadow = '0 0 10px #10b981, 0 0 20px rgba(16, 185, 129, 0.4)';
                    statusText.textContent = 'Téléchargement disponible';
                }
            } else {
                // Téléchargement désactivé -> Bouton rouge inactif
                downloadBtn.classList.add('disabled');
                downloadBtn.classList.remove('btn-available');
                downloadBtn.classList.add('btn-unavailable');
                downloadBtn.setAttribute('href', '#');
                
                downloadBtn.innerHTML = `
                    <svg class="download-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    <span>Launcher non disponible</span>
                `;

                if (suspendedWarning) {
                    suspendedWarning.style.display = 'block';
                    suspendedWarning.innerHTML = `⚠️ Le téléchargement est temporairement suspendu par le staff.`;
                }
                if (statusDot && statusText) {
                    statusDot.style.backgroundColor = '#ef4444'; // Rouge
                    statusDot.style.boxShadow = '0 0 10px #ef4444, 0 0 20px rgba(239, 68, 68, 0.4)';
                    statusText.textContent = 'Téléchargement temporairement suspendu';
                }
            }
        }

        // Essaye de charger la configuration depuis le Gist brut
        fetch(LAUNCHER_GIST_URL + "?t=" + Date.now())
            .then(res => {
                if (!res.ok) throw new Error("Fichier Gist launcher.json inexistant ou inaccessible");
                return res.json();
            })
            .then(config => {
                applyConfig(config);
            })
            .catch(gistErr => {
                console.log("Gist launcher non trouvé, tentative de fallback local depuis config.json...", gistErr);
                // Fallback sur le config.json local
                fetch('config.json?t=' + Date.now())
                    .then(res => {
                        if (!res.ok) throw new Error("config.json local introuvable");
                        return res.json();
                    })
                    .then(config => {
                        applyConfig(config);
                    })
                    .catch(localErr => {
                        console.error("Aucune configuration disponible (Gist et local en échec) :", localErr);
                        // Mode sécurité : bouton rouge non disponible
                        downloadBtn.classList.add('disabled');
                        downloadBtn.classList.remove('btn-available');
                        downloadBtn.classList.add('btn-unavailable');
                        downloadBtn.setAttribute('href', '#');
                        downloadBtn.innerHTML = `
                            <svg class="download-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            <span>Launcher non disponible</span>
                        `;
                        if (suspendedWarning) {
                            suspendedWarning.style.display = 'block';
                            suspendedWarning.innerHTML = `⚠️ Erreur de connexion aux serveurs de configuration.`;
                        }
                        if (statusDot && statusText) {
                            statusDot.style.backgroundColor = '#ef4444';
                            statusDot.style.boxShadow = '0 0 10px #ef4444';
                            statusText.textContent = 'Erreur de connexion';
                        }
                    });
            });
    }

    // =====================================================================
    // 6. GESTION DES SOUS-ONGLETS DES CONTINENTS (DIFFICULTÉ PAYS)
    // =====================================================================
    function initContinentSubTabs() {
        const subTabButtons = document.querySelectorAll('.continent-tab-btn');
        const panels = document.querySelectorAll('.continent-panel');

        subTabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const continentTarget = btn.getAttribute('data-continent');

                // Retire l'état actif de tous les boutons de continents
                subTabButtons.forEach(b => b.classList.remove('active'));
                // Active le bouton cliqué
                btn.classList.add('active');

                // Affiche le bon panneau de continent
                panels.forEach(panel => {
                    if (panel.id === `panel-${continentTarget}`) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });

                // Réinitialise le Glow Tracker et attache les sons
                attachSoundEffects();
                initGlowTracker();
            });
        });
    }

    // =====================================================================
    // 7. CHARGEMENT DYNAMIQUE DES STATUTS DEPUIS UN GIST GITHUB (JSON BRUT)
    // =====================================================================
    // URL brute (raw) pour charger les pays sans subir les limites de taux de l'API GitHub.
    const GIST_URL = "https://gist.githubusercontent.com/theworldorder67/9f736d8c1f38cde11ff6b2f09c83cd97/raw/gistfile1.txt";

    function loadCountriesData() {
        if (!GIST_URL) return;

        fetch(GIST_URL + "?t=" + Date.now())
            .then(res => {
                if (!res.ok) throw new Error("Erreur lors de la récupération des pays");
                return res.json();
            })
            .then(statusMap => {
                // Parcourt chaque pays du Gist et met à jour uniquement sa colonne Statut
                for (const [countryName, status] of Object.entries(statusMap)) {
                    const row = document.querySelector(`tr[data-country="${countryName}"]`);
                    if (!row) continue;

                    const statusCell = row.querySelector('.status-cell');
                    if (!statusCell) continue;

                    if (status.toLowerCase() === 'bot') {
                        statusCell.innerHTML = `<span class="status-bot">🤖 BOT</span>`;
                    } else if (status.toLowerCase() === 'joueur') {
                        statusCell.innerHTML = `<span class="status-joueur">👤 JOUEUR</span>`;
                    }
                }
            })
            .catch(err => {
                console.warn("Impossible de charger les statuts depuis le Gist, version locale conservée :", err);
            });
    }

    // =====================================================================
    // 8. SUIVI LIVE DU SERVEUR MINECRAFT (MCSRVSTAT API)
    // =====================================================================
    const MC_SERVER_IP = "kingnation.mine.fun";
    const MC_SERVER_PORT = "28955";

    function checkMinecraftServerStatus() {
        const statusDot = document.querySelector('.mc-status-dot');
        const statusText = document.getElementById('mcStatusText');
        const playersCount = document.getElementById('mcPlayersCount');

        if (!statusDot || !statusText || !playersCount) return;

        // Appel de l'API publique mcsrvstat (Java Edition)
        fetch(`https://api.mcsrvstat.us/2/${MC_SERVER_IP}`)
            .then(res => res.json())
            .then(data => {
                if (data.online) {
                    statusDot.className = 'mc-status-dot online';
                    statusText.innerHTML = `<span style="color: #10b981; font-weight: 700;">Serveur en ligne</span>`;
                    playersCount.textContent = `${data.players.online} / ${data.players.max} Joueurs`;
                } else {
                    statusDot.className = 'mc-status-dot offline';
                    statusText.innerHTML = `<span style="color: #ef4444; font-weight: 700;">Serveur hors ligne</span>`;
                    playersCount.textContent = `0 / 0 Joueurs`;
                }
            })
            .catch(err => {
                console.warn("Impossible de récupérer le statut du serveur Minecraft :", err);
                statusDot.className = 'mc-status-dot offline';
                statusText.innerHTML = `<span style="color: #ef4444; font-weight: 700;">Serveur hors ligne</span>`;
                playersCount.textContent = `-- / -- Joueurs`;
            });
    }

    // Fonction pour copier l'IP dans le presse-papier
    window.copyServerIP = function() {
        const ipText = MC_SERVER_IP;
        navigator.clipboard.writeText(ipText).then(() => {
            const tooltip = document.getElementById('copyTooltip');
            if (tooltip) {
                tooltip.textContent = 'Copié !';
                tooltip.style.borderColor = '#10b981';
                tooltip.style.color = '#10b981';
                
                setTimeout(() => {
                    tooltip.textContent = "Copier l'IP";
                    tooltip.style.borderColor = 'var(--accent-gold)';
                    tooltip.style.color = '#ffffff';
                }, 2000);
            }
        }).catch(err => {
            console.error("Erreur lors de la copie de l'IP :", err);
        });
    };

    // Initialisations au chargement
    attachSoundEffects();
    initGlowTracker();
    fetchDownloadConfig();
    initContinentSubTabs();
    loadCountriesData();
    checkMinecraftServerStatus();
    
    // Rafraîchir toutes les 2 minutes
    setInterval(checkMinecraftServerStatus, 120000);
});

/**
 * Fonction globale d'aide à la navigation pouvant être appelée depuis le HTML
 * @param {string} sectionId - L'ID de la section cible
 */
function navigateToSection(sectionId) {
    window.location.hash = sectionId;
}

// =====================================================================
// EFFETS PREMIUM (LOADING SCREEN & MOUSE AURA)
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. GESTION DE L'ÉCRAN DE CHARGEMENT
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        // Force un affichage minimum de 1.2s pour l'effet "premium"
        const minLoadingTime = 1200; 
        const startTime = Date.now();
        
        window.addEventListener('load', () => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
            
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                // Retirer du DOM après la transition
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 800);
            }, remainingTime);
        });
    }

    // 2. GESTION DU HALO DE SOURIS
    const mouseAura = document.getElementById('mouse-aura');
    if (mouseAura) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let auraX = mouseX;
        let auraY = mouseY;
        
        // Suivi de la souris
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Animation fluide (Lerp)
        const animateAura = () => {
            // Lissage du mouvement
            auraX += (mouseX - auraX) * 0.15;
            auraY += (mouseY - auraY) * 0.15;
            
            mouseAura.style.transform = `translate(calc(-50% + ${auraX}px), calc(-50% + ${auraY}px))`;
            requestAnimationFrame(animateAura);
        };
        
        animateAura();
    }
});
