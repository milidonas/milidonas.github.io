// header.js
document.addEventListener('DOMContentLoaded', () => {
    const headerPlaceholder = document.getElementById('header-placeholder');

    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = `
            <header class="main-header">
                <div class="header-left">
                    <a href="/" class="logo-link">
                        <div class="logo">
                            <img src="SM/LG_WB.svg" alt="Logo milidonas" height="40">
                        </div>
                    </a>
                </div>
                <nav class="main-nav">
                    <ul>
                        <li><a href="/">Inicio</a></li>
                        <li><a href="products">Nuestras Donas</a></li>
                        <li><a href="about">Sobre Nosotros</a></li>
                        <li><a href="contact">Contacto</a></li>
                    </ul>
                </nav>
                <div class="header-right">
                    <button class="menu-toggle" aria-label="Abrir menú">
                        <i class="fas fa-bars"></i>
                    </button>
                    <a href="checkout" class="cart-link"> <!-- CAMBIO AQUÍ: de "cart" a "checkout" -->
                        <i class="fas fa-shopping-cart"></i>
                        <span id="cart-count" class="cart-count">0</span>
                    </a>
                </div>
            </header>

            <!-- Menú móvil (oculto por defecto) -->
            <div class="mobile-nav-overlay" id="mobile-nav-overlay">
                <nav class="mobile-nav">
                    <button class="close-menu" aria-label="Cerrar menú">
                        <i class="fas fa-times"></i>
                    </button>
                    <ul>
                        <li><a href="/">Inicio</a></li>
                        <li><a href="products">Nuestras Donas</a></li>
                        <li><a href="about">Sobre Nosotros</a></li>
                        <li><a href="contact">Contacto</a></li>
                    </ul>
                </nav>
            </div>
        `;

        // Lógica para el menú móvil
        const menuToggle = document.querySelector('.menu-toggle');
        const closeMenu = document.querySelector('.close-menu');
        const mobileNavOverlay = document.getElementById('mobile-nav-overlay');

        if (menuToggle && mobileNavOverlay) {
            menuToggle.addEventListener('click', () => {
                mobileNavOverlay.classList.add('open');
            });
        }

        if (closeMenu && mobileNavOverlay) {
            closeMenu.addEventListener('click', () => {
                mobileNavOverlay.classList.remove('open');
            });
        }

        // Cerrar menú al hacer clic en un enlace (opcional)
        mobileNavOverlay.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNavOverlay.classList.remove('open');
            });
        });
    }
});
