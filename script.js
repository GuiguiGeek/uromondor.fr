/* ==========================================================
   Service Urologie - CHU Henri Mondor
   Vanilla JavaScript :
     1) Inclusion dynamique des partials header.html / footer.html
     2) Menu burger + dropdowns mobiles (initialisés APRÈS injection)
   ==========================================================
   Note : fetch() requiert un serveur web (http://) — ouvrir le
   fichier en file:// déclenchera une erreur CORS.
   En dev : `python3 -m http.server` ou Live Server (VSCode).
   ========================================================== */

(function () {
    'use strict';

    const MOBILE_BREAKPOINT = 768; // px

    /* ----------------------------------------------------------
       1. Inclusion HTML : charge un partial dans un conteneur cible
       ---------------------------------------------------------- */
    async function loadPartial(url, targetSelector) {
        const target = document.querySelector(targetSelector);
        if (!target) {
            console.warn('Cible introuvable :', targetSelector);
            return;
        }
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} en chargeant ${url}`);
            }
            target.innerHTML = await response.text();
        } catch (error) {
            console.error('Erreur de chargement du partial :', error);
            target.innerHTML = `<!-- Erreur : impossible de charger ${url} -->`;
        }
    }

    /* ----------------------------------------------------------
       2. Initialisation du menu (à appeler APRÈS injection du header)
       ---------------------------------------------------------- */
    function isMobile() {
        return window.innerWidth < MOBILE_BREAKPOINT;
    }

    function initNavigation() {
        const burger = document.getElementById('burger');
        const navList = document.getElementById('nav-list');
        const dropdownLinks = document.querySelectorAll('.has-dropdown > a');

        if (!burger || !navList) {
            console.warn('Header non chargé — menu non initialisé.');
            return;
        }

        /* Toggle burger menu */
        burger.addEventListener('click', function () {
            const isOpen = navList.classList.toggle('open');
            burger.setAttribute('aria-expanded', String(isOpen));
            const icon = burger.querySelector('i');
            if (icon) icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
        });

        /* Toggle dropdowns en mobile (au clic) */
        dropdownLinks.forEach(function (link) {
            link.addEventListener('click', function (event) {
                if (!isMobile()) return; // en desktop : :hover CSS suffit
                event.preventDefault();
                const parent = link.parentElement;
                document.querySelectorAll('.has-dropdown.open').forEach(function (item) {
                    if (item !== parent) item.classList.remove('open');
                });
                parent.classList.toggle('open');
            });
        });

        /* Fermer le menu en cliquant en dehors (mobile) */
        document.addEventListener('click', function (event) {
            if (!isMobile()) return;
            const isClickInsideNav = event.target.closest('.main-nav');
            if (!isClickInsideNav && navList.classList.contains('open')) {
                navList.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
                const icon = burger.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        });

        /* Reset au resize au-dessus du breakpoint mobile */
        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (!isMobile()) {
                    navList.classList.remove('open');
                    burger.setAttribute('aria-expanded', 'false');
                    const icon = burger.querySelector('i');
                    if (icon) icon.className = 'fas fa-bars';
                    document.querySelectorAll('.has-dropdown.open').forEach(function (item) {
                        item.classList.remove('open');
                    });
                }
            }, 150);
        });
    }

    /* ----------------------------------------------------------
       3. Bootstrap : on attend le DOM, on charge les partials
          en parallèle, PUIS on initialise la navigation
       ---------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', async function () {
        await Promise.all([
            loadPartial('header.html', '#header-placeholder'),
            loadPartial('footer.html', '#footer-placeholder')
        ]);
        initNavigation();
    });

})();

/* ============================================================
   Page : Demande de rendez-vous en ligne
   ============================================================ */

/* Compteur de caractères du textarea */
(function initCharCounter() {
    const textarea = document.getElementById('rdv-message');
    const counter  = document.getElementById('rdv-counter');
    if (!textarea || !counter) return;

    const update = () => { counter.textContent = textarea.value.length; };
    textarea.addEventListener('input', update);
    update();
})();

/* Validation souple du numéro de téléphone à la soumission */
(function initPhoneValidation() {
    const form = document.querySelector('.rdv-form');
    const tel  = document.getElementById('rdv-tel');
    if (!form || !tel) return;

    form.addEventListener('submit', (e) => {
        // On retire les séparateurs visuels avant de valider
        const cleaned = tel.value.replace(/[\s.()\-]/g, '');

        if (cleaned && !/^\+?\d{10,15}$/.test(cleaned)) {
            e.preventDefault();
            tel.setCustomValidity('Veuillez saisir un numéro de téléphone valide (10 chiffres minimum).');
            tel.reportValidity();
            tel.focus();
        } else {
            // Reset du message d'erreur si la valeur devient valide
            tel.setCustomValidity('');
        }
    });

    // Efface le message d'erreur dès que l'utilisateur corrige
    tel.addEventListener('input', () => tel.setCustomValidity(''));
})();