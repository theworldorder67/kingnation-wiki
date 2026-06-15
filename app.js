/* 
    ========================================================================
    WIKI KING NATION - LOGIQUE JAVASCRIPT (THEME HORIZONTAL & CENTRÉ)
    ========================================================================
    Ce script gère le fonctionnement Single Page Application (SPA), le routage
    par ancres d'URL, le menu déroulant mobile et le copieur d'IP du serveur.
*/

document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================
    // 1. INITIALISATION DES ANCRES ET NAVIGATION SPA
    // =====================================================================
    const sections = document.querySelectorAll('.content-section');
    const tabItems = document.querySelectorAll('.tab-item');

    /**
     * Affiche une section spécifique et met à jour l'onglet actif.
     * @param {string} targetId - L'ID de la section à afficher (ex: 'accueil')
     */
    function showSection(targetId) {
        // Validation que la section ciblée existe dans le HTML
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        // Désactive toutes les sections
        sections.forEach(sec => sec.classList.remove('active'));
        // Active la section ciblée
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
        // Récupère l'ancre (hash) dans l'URL sans le caractère '#'
        const hash = window.location.hash.substring(1);
        
        // Si aucune ancre ou ancre invalide, affiche l'accueil par défaut
        if (!hash) {
            showSection('accueil');
        } else {
            showSection(hash);
        }
    }

    // Écoute le changement d'ancre dans l'URL (permet le bouton retour du navigateur et le partage de liens directs)
    window.addEventListener('hashchange', handleRouting);

    // Exécute le routage au premier chargement de la page
    handleRouting();


    // =====================================================================
    // 2. GESTION DU MENU MOBILE ACTIONS (DISCORD / TELECHARGER)
    // =====================================================================
    const menuToggle = document.getElementById('menuToggle');
    const headerActions = document.querySelector('.header-actions');

    if (menuToggle && headerActions) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            headerActions.classList.toggle('mobile-open');
        });

        // Ferme le menu mobile si on clique ailleurs sur la page
        document.addEventListener('click', () => {
            headerActions.classList.remove('mobile-open');
        });
    }


    // =====================================================================
    // 3. FONCTIONNALITÉ COPIE IP DU SERVEUR
    // =====================================================================
    const ipCopyBtn = document.getElementById('ipCopyBtn');
    const tooltip = document.getElementById('copyTooltip');

    if (ipCopyBtn && tooltip) {
        ipCopyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Récupère le texte de l'IP du serveur
            const ipText = document.getElementById('server-ip').textContent;

            // Utilise l'API Clipboard du navigateur pour copier le texte
            navigator.clipboard.writeText(ipText).then(() => {
                // Modifie le texte de l'infobulle pour confirmer la copie
                tooltip.textContent = "IP Copiée avec succès !";
                tooltip.classList.add('show');
                
                // Masque l'infobulle après 2 secondes et réinitialise son texte
                setTimeout(() => {
                    tooltip.classList.remove('show');
                    setTimeout(() => {
                        tooltip.textContent = "Cliquer pour copier l'IP !";
                    }, 200);
                }, 2000);
            }).catch(err => {
                console.error("Erreur lors de la copie de l'IP : ", err);
                tooltip.textContent = "Erreur lors de la copie...";
                tooltip.classList.add('show');
                setTimeout(() => tooltip.classList.remove('show'), 2000);
            });
        });

        // Affiche l'infobulle d'aide au survol du bouton IP (sur desktop)
        ipCopyBtn.addEventListener('mouseenter', () => {
            if (!tooltip.classList.contains('show')) {
                tooltip.classList.add('show');
            }
        });

        // Masque l'infobulle quand la souris quitte le bouton IP
        ipCopyBtn.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });
    }

    // =====================================================================
    // 4. RÉCUPÉRATION DYNAMIQUE DE LA CONFIGURATION DU TÉLÉCHARGEMENT
    // =====================================================================
    function fetchDownloadConfig() {
        const downloadBtn = document.getElementById('launcherDownloadBtn');
        const suspendedWarning = document.getElementById('downloadSuspendedWarning');
        const statusDot = document.querySelector('.server-status-badge .status-dot');
        const statusText = document.querySelector('.server-status-badge span:last-child');

        if (!downloadBtn) return;

        // Requête vers le fichier config.json (situé sur votre dépôt GitHub Pages)
        fetch('config.json')
            .then(res => {
                if (!res.ok) throw new Error("Fichier de config introuvable");
                return res.json();
            })
            .then(config => {
                if (config.download_enabled) {
                    // Téléchargement autorisé par le staff
                    downloadBtn.classList.remove('disabled');
                    downloadBtn.setAttribute('href', config.download_url);
                    
                    if (suspendedWarning) {
                        suspendedWarning.style.display = 'none';
                    }
                    if (statusDot && statusText) {
                        statusDot.style.backgroundColor = '#10b981'; // Vert opérationnel
                        statusDot.style.boxShadow = '0 0 8px #10b981';
                        statusText.textContent = 'Téléchargement en ligne';
                    }
                } else {
                    // Téléchargement suspendu
                    downloadBtn.classList.add('disabled');
                    downloadBtn.setAttribute('href', '#');
                    
                    if (suspendedWarning) {
                        suspendedWarning.style.display = 'block';
                    }
                    if (statusDot && statusText) {
                        statusDot.style.backgroundColor = '#ef4444'; // Rouge suspendu
                        statusDot.style.boxShadow = '0 0 8px #ef4444';
                        statusText.textContent = 'Téléchargement suspendu par le staff';
                    }
                }
            })
            .catch(err => {
                console.error("Impossible de charger la config de téléchargement :", err);
                // Comportement sécurisé par défaut : désactiver le bouton
                downloadBtn.classList.add('disabled');
                downloadBtn.setAttribute('href', '#');
                if (suspendedWarning) {
                    suspendedWarning.style.display = 'block';
                }
                if (statusDot && statusText) {
                    statusDot.style.backgroundColor = '#ef4444';
                    statusDot.style.boxShadow = '0 0 8px #ef4444';
                    statusText.textContent = 'Erreur de connexion serveur';
                }
            });
    }

    // Exécute la vérification de téléchargement
    fetchDownloadConfig();
});

/**
 * Fonction globale d'aide à la navigation pouvant être appelée depuis le HTML
 * @param {string} sectionId - L'ID de la section cible
 */
function navigateToSection(sectionId) {
    window.location.hash = sectionId;
}
