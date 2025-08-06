// footer.js
document.addEventListener('DOMContentLoaded', () => {
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
            <footer class="main-footer">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>Legal</h3>
                        <ul>
                            <li><a href="#">Términos y Condiciones</a></li>
                            <li><a href="#">Política de Privacidad</a></li>
                            <li><a href="returns">Política de Devoluciones</a></li>
                            <li><a href="contact">Contacto</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h3>Redes Sociales</h3>
                        <div class="social-icons">
                            <a href="https://www.facebook.com/milidonas.ec" target="_blank" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                            <a href="https://www.instagram.com/milidonas.ec" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                            <a href="https://www.tiktok.com/@karl.milena" target="_blank" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
                            <a href="mailto:milidonas.info@gmail.com" target="_blank" aria-label="Email"><i class="fas fa-envelope"></i></a>
                        </div>
                    </div>
                    <div class="footer-section">
                        <h3>Suscríbete ahora</h3>
                        <p>Recibe nuestras últimas ofertas y noticias.</p>
                        <form class="subscribe-form">
                            <input type="email" placeholder="nombre@dominio.com" required>
                            <button type="submit">Suscribirme</button>
                        </form>
                    </div>
                </div>
                <div class="footer-bottom">
                <p>&copy; 2025 milidonas. Todos los derechos reservados. Hecho con <i class="fas fa-heart text-danger"></i> en Tulcán, Ecuador.</p>
                </div>
            </footer>
        `;
    }
});
