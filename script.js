// Importar módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // Variables globales de Firebase (proporcionadas por el entorno Canvas)
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    let app;
    let db;
    let auth;
    let userId = null; // Para almacenar el ID del usuario autenticado o anónimo
    let isAuthReady = false; // Bandera para saber si la autenticación está lista

    // Inicializar Firebase y autenticar
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                userId = user.uid;
                console.log("Firebase Auth listo. Usuario ID:", userId);
            } else {
                // Si no hay usuario, intentar iniciar sesión anónimamente
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                    userId = auth.currentUser.uid;
                    console.log("Sesión de usuario anónimo iniciada. Usuario ID:", userId);
                } catch (error) {
                    console.error("Error al iniciar sesión en Firebase:", error);
                }
            }
            isAuthReady = true;
            // Una vez que la autenticación está lista, podemos cargar los comentarios
            if (document.getElementById('comments-list')) {
                loadComments();
            }
        });
    } catch (error) {
        console.error("Error al inicializar Firebase:", error);
        // Mostrar un mensaje al usuario si Firebase no se inicializa
        const commentsList = document.getElementById('comments-list');
        if (commentsList) {
            commentsList.innerHTML = '<p class="error-message">Error al cargar el sistema de comentarios. Por favor, inténtalo de nuevo más tarde.</p>';
        }
    }


    // Elementos del DOM existentes
    const productGrid = document.getElementById('product-grid');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const cartSubtotalAmount = document.getElementById('cart-subtotal-amount');
    const shippingCostSpan = document.getElementById('shipping-cost');
    const checkoutWhatsappButton = document.getElementById('checkout-whatsapp');
    const checkoutForm = document.getElementById('checkout-form');
    const clearCartButton = document.getElementById('clear-cart-btn');

    // Contact form elements
    const contactForm = document.querySelector('.contact-form');
    const contactNameInput = document.getElementById('contact-name');
    const contactApellidoInput = document.getElementById('contact-apellido');
    const contactMessageTextarea = document.getElementById('contact-message');
    const contactSubmitButton = document.querySelector('.submit-button[data-form-type="contact"]');

    // Nuevos elementos para la ubicación en checkout.html
    const provinceSelect = document.getElementById('province');
    const cantonSelect = document.getElementById('canton');
    const streetAddressInput = document.getElementById('street-address');
    const referenceTextarea = document.getElementById('reference');

    // Nuevos elementos para la página de comentarios
    const commentForm = document.getElementById('comment-form');
    const commentsList = document.getElementById('comments-list');
    const commentNameInput = document.getElementById('comment-name');
    const commentApellidoInput = document.getElementById('comment-apellido');
    const socialLinkInput = document.getElementById('social-link');
    const commentTextarea = document.getElementById('comment-text');


    console.log('Script loaded. Contact form element:', contactForm);
    console.log('Contact name input element:', contactNameInput);
    console.log('Contact apellido input element:', contactApellidoInput);
    console.log('Contact message textarea element:', contactMessageTextarea);
    console.log('Contact submit button element:', contactSubmitButton);

    let cart = JSON.parse(localStorage.getItem('donasCart')) || [];

    const ecuadorLocations = {
        "Azuay": ["Cuenca", "Gualaceo", "Paute"],
        "Bolívar": ["Guaranda", "Chillanes", "San Miguel"],
        "Cañar": ["Azogues", "Cañar", "La Troncal"],
        "Carchi": ["Tulcán", "Bolívar", "Espejo", "Montúfar", "San Pedro de Huaca", "Mira"],
        "Chimborazo": ["Riobamba", "Alausí", "Guano"],
        "Cotopaxi": ["Latacunga", "La Maná", "Pujilí"],
        "El Oro": ["Machala", "Pasaje", "Santa Rosa"],
        "Esmeraldas": ["Esmeraldas", "Atacames", "Quinindé"],
        "Galápagos": ["San Cristóbal", "Isabela", "Santa Cruz"],
        "Guayas": ["Guayaquil", "Daule", "Milagro", "Samborondón", "Durán"],
        "Imbabura": ["Ibarra", "Otavalo", "Cotacachi", "Antonio Ante", "Pimampiro", "San Miguel de Urcuquí"],
        "Loja": ["Loja", "Catamayo", "Saraguro"],
        "Los Ríos": ["Babahoyo", "Quevedo", "Vinces"],
        "Manabí": ["Portoviejo", "Manta", "Chone", "Jipijapa", "Montecristi", "Sucre"],
        "Morona Santiago": ["Macas", "Gualaquiza", "Sucúa"],
        "Napo": ["Tena", "Archidona", "El Chaco"],
        "Orellana": ["Coca", "Aguarico", "La Joya de los Sachas"],
        "Pastaza": ["Puyo", "Mera", "Santa Clara"],
        "Pichincha": ["Quito", "Cayambe", "Machachi", "Rumiñahui", "Mejía", "Pedro Moncayo", "San Miguel de los Bancos", "Puerto Quito"],
        "Santa Elena": ["Santa Elena", "La Libertad", "Salinas"],
        "Santo Domingo de los Tsáchilas": ["Santo Domingo", "La Concordia"],
        "Sucumbíos": ["Nueva Loja", "Cascales", "Lago Agrio"],
        "Tungurahua": ["Ambato", "Baños de Agua Santa", "Pelileo"],
        "Zamora Chinchipe": ["Zamora", "Yacuambi", "Centinela del Cóndor"]
    };


    // Función para guardar el carrito en localStorage y actualizar el contador
    function saveCart() {
        localStorage.setItem('donasCart', JSON.stringify(cart));
        updateCartCountDisplay();
    }

    // Función para actualizar la visualización del contador de productos en el encabezado
    function updateCartCountDisplay() {
        const cartCountSpan = document.getElementById('cart-count');

        if (cartCountSpan) {
            const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
            cartCountSpan.textContent = totalItems;

            if (totalItems > 0) {
                cartCountSpan.style.display = 'flex';
            } else {
                cartCountSpan.style.display = 'none';
            }
        } else {
            console.log('Error: cart-count span not found in the DOM. Retrying in 100ms...');
            setTimeout(updateCartCountDisplay, 100);
        }
    }

    // Lógica específica para la página de productos (products.html)
    if (productGrid) {
        loadProducts();
    }

    // Lógica específica para la página del carrito (checkout.html)
    if (cartItemsContainer && checkoutWhatsappButton) {
        updateCartDisplay();
        checkoutWhatsappButton.addEventListener('click', handleCheckout);

        if (clearCartButton) {
            clearCartButton.addEventListener('click', clearCart);
        }

        populateProvinces();
        provinceSelect.addEventListener('change', populateCantons);
    }

    // Lógica específica para la página de contacto (contact.html)
    if (contactForm && contactSubmitButton) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
        console.log('Event listener added to contact form for submit event.');
    } else {
        console.log('Contact form or submit button not found, cannot attach submit event listener.');
    }

    // Lógica específica para la página de comentarios (comments.html)
    if (commentForm && commentsList) {
        commentForm.addEventListener('submit', handleCommentSubmit);
        // Los comentarios se cargarán después de que Firebase Auth esté listo
    }

    // Inicializar el contador del carrito al cargar cualquier página
    setTimeout(updateCartCountDisplay, 0);

    // Función para cargar los productos (datos de ejemplo)
    async function loadProducts() {
        try {
            const products = [
                {
                    "id": "dona001",
                    "nombre": "Dona Clásica Glaseada",
                    "descripcion": "Nuestra dona original, suave y cubierta con un dulce glaseado. ¡Un clásico irresistible!",
                    "precio": 1.00,
                    "imagen": "IMAGEN/md1.png"
                },
                {
                    "id": "dona002",
                    "nombre": "Dona de Chocolate con Chispas",
                    "descripcion": "El doble de chocolate en esta dona suave, cubierta y con chispas de chocolate. ¡Para amantes del cacao!",
                    "precio": 1.55,
                    "imagen": "IMAGEN/md2.png"
                },
                {
                    "id": "dona003",
                    "nombre": "Dona de Fresa con Sprinkles",
                    "descripcion": "Sabor vibrante a fresa con coloridos sprinkles. ¡Perfecta para alegrar tu día!",
                    "precio": 1.60,
                    "imagen": "IMAGEN/md3.png"
                },
                {
                    "id": "dona004",
                    "nombre": "Dona de Vainilla con Glaseado",
                    "descripcion": "Suave dona de vainilla con un dulce glaseado blanco. Simple y deliciosa.",
                    "precio": 1.40,
                    "imagen": "IMAGEN/md4.png"
                }
            ];
            displayProducts(products);
        } catch (error) {
            console.error('Error al cargar los productos:', error);
            if (productGrid) {
                productGrid.innerHTML = '<p>Lo sentimos, no pudimos cargar los productos en este momento.</p>';
            }
        }
    }

    // Función para mostrar los productos en la página de productos
    function displayProducts(products) {
        if (!productGrid) return;

        productGrid.innerHTML = '';

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.imagen}" alt="${product.nombre}">
                <h3>${product.nombre}</h3>
                <p>${product.descripcion}</p>
                <p class="price">$${product.precio.toFixed(2)}</p>
                <div class="quantity-selector">
                    <label for="quantity-${product.id}">Cantidad:</label>
                    <input type="number" id="quantity-${product.id}" class="product-quantity-input" value="1" min="1">
                </div>
                <div class="product-actions">
                    <button class="add-to-cart-btn" data-id="${product.id}">Añadir al Carrito</button>
                    <button class="share-product-btn" data-id="${product.id}" data-name="${product.nombre}" data-description="${product.descripcion}">
                        <i class="fas fa-share-alt"></i> Compartir
                    </button>
                </div>
            `;
            productGrid.appendChild(productCard);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                const quantityInput = document.getElementById(`quantity-${productId}`);
                const quantity = parseInt(quantityInput.value, 10);
                addProductToCart(productId, products, quantity);
            });
        });

        document.querySelectorAll('.share-product-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id || event.target.closest('button').dataset.id;
                const productName = event.target.dataset.name || event.target.closest('button').dataset.name;
                const productDescription = event.target.dataset.description || event.target.closest('button').dataset.description;
                shareProduct(productId, productName, productDescription);
            });
        });
    }

    // Función para añadir un producto al carrito
    function addProductToCart(productId, allProducts, quantity = 1) {
        const productToAdd = allProducts.find(p => p.id === productId);
        if (productToAdd) {
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.cantidad += quantity;
            } else {
                cart.push({ ...productToAdd, cantidad: quantity });
            }
            saveCart();
            console.log('Producto añadido al carrito:', cart);
        }
    }

    // Función para compartir un producto
    async function shareProduct(productId, productName, productDescription) {
        const productUrl = `${window.location.origin}/products.html?id=${productId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `¡Mira esta dona de Milidonas: ${productName}!`,
                    text: productDescription,
                    url: productUrl,
                });
                console.log('Contenido compartido exitosamente.');
            } catch (error) {
                console.error('Error al compartir:', error);
            }
        } else {
            try {
                const tempInput = document.createElement('textarea');
                tempInput.value = `¡Mira esta dona de Milidonas: ${productName}!\n${productDescription}\n${productUrl}`;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                // Usar un modal personalizado en lugar de alert
                showCustomAlert('Enlace del producto copiado al portapapeles. ¡Pégalo donde quieras!');
                console.log('Enlace copiado al portapapeles:', productUrl);
            } catch (err) {
                console.error('Error al copiar al portapapeles:', err);
                showCustomAlert('No se pudo copiar el enlace. Por favor, cópialo manualmente: ' + productUrl);
            }
        }
    }

    // Función para mostrar un modal de alerta personalizado (reemplazo de alert)
    function showCustomAlert(message) {
        const alertModal = document.createElement('div');
        alertModal.classList.add('custom-alert-modal');
        alertModal.innerHTML = `
            <div class="custom-alert-content">
                <p>${message}</p>
                <button class="custom-alert-close-btn">OK</button>
            </div>
        `;
        document.body.appendChild(alertModal);

        alertModal.querySelector('.custom-alert-close-btn').addEventListener('click', () => {
            document.body.removeChild(alertModal);
        });

        // Cerrar al hacer clic fuera del modal
        alertModal.addEventListener('click', (e) => {
            if (e.target === alertModal) {
                document.body.removeChild(alertModal);
            }
        });
    }


    // Función para actualizar la visualización del carrito (solo en checkout.html)
    function updateCartDisplay() {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
            cartSubtotalAmount.textContent = '0.00';
            shippingCostSpan.textContent = 'A calcular';
            cartTotalAmount.textContent = '0.00';
            checkoutWhatsappButton.disabled = true;
            if (clearCartButton) {
                clearCartButton.disabled = true;
            }
            if (checkoutForm) {
                Array.from(checkoutForm.elements).forEach(element => {
                    if (element.tagName !== 'BUTTON') {
                        element.disabled = true;
                    }
                });
            }
            if (provinceSelect) provinceSelect.disabled = true;
            if (cantonSelect) cantonSelect.disabled = true;
            if (streetAddressInput) streetAddressInput.disabled = true;
            if (referenceTextarea) referenceTextarea.disabled = true;

            return;
        }

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span>${item.nombre}</span>
                <div class="item-quantity-controls">
                    <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                    <span class="item-quantity">${item.cantidad}</span>
                    <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                </div>
                <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
            `;
            cartItemsContainer.appendChild(itemElement);
            subtotal += item.precio * item.cantidad;
        });

        cartSubtotalAmount.textContent = subtotal.toFixed(2);
        shippingCostSpan.textContent = 'A calcular';
        cartTotalAmount.textContent = subtotal.toFixed(2);
        checkoutWhatsappButton.disabled = false;
        if (clearCartButton) {
            clearCartButton.disabled = false;
        }

        if (checkoutForm) {
            Array.from(checkoutForm.elements).forEach(element => {
                element.disabled = false;
            });
        }
        if (provinceSelect) provinceSelect.disabled = false;
        if (streetAddressInput) streetAddressInput.disabled = false;
        if (referenceTextarea) referenceTextarea.disabled = false;


        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                changeQuantity(productId, 1);
            });
        });

        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.id;
                changeQuantity(productId, -1);
            });
        });
    }

    // Función para cambiar la cantidad de un producto en el carrito
    function changeQuantity(productId, change) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            cart[itemIndex].cantidad += change;
            if (cart[itemIndex].cantidad <= 0) {
                cart.splice(itemIndex, 1);
            }
            saveCart();
            updateCartDisplay();
        }
    }

    // Función para vaciar todo el carrito
    function clearCart() {
        cart = [];
        saveCart();
        updateCartDisplay();
        console.log('Carrito vaciado.');
    }

    // Función para poblar el selector de provincias
    function populateProvinces() {
        if (!provinceSelect) return;

        provinceSelect.innerHTML = '<option value="">Selecciona una provincia</option>';
        cantonSelect.innerHTML = '<option value="">Selecciona un cantón</option>';
        cantonSelect.disabled = true;

        for (const province in ecuadorLocations) {
            const option = document.createElement('option');
            option.value = province;
            option.textContent = province;
            provinceSelect.appendChild(option);
        }
    }

    // Función para poblar el selector de cantones basado en la provincia seleccionada
    function populateCantons() {
        if (!provinceSelect || !cantonSelect) return;

        const selectedProvince = provinceSelect.value;
        cantonSelect.innerHTML = '<option value="">Selecciona un cantón</option>';
        cantonSelect.disabled = true;

        if (selectedProvince && ecuadorLocations[selectedProvince]) {
            ecuadorLocations[selectedProvince].forEach(canton => {
                const option = document.createElement('option');
                option.value = canton;
                option.textContent = canton;
                cantonSelect.appendChild(option);
            });
            cantonSelect.disabled = false;
        }
    }

    // Función para manejar el envío del pedido por WhatsApp (en checkout.html)
    function handleCheckout() {
        if (cart.length === 0) {
            showCustomAlert('Tu carrito está vacío. ¡Añade algunas donas para hacer un pedido!');
            return;
        }

        if (checkoutForm && !checkoutForm.checkValidity()) {
            checkoutForm.reportValidity();
            console.log('Por favor, completa todos los campos requeridos del formulario.');
            return;
        }

        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const country = document.getElementById('country').value;
        const province = provinceSelect.value;
        const canton = cantonSelect.value;
        const streetAddress = streetAddressInput.value;
        const reference = referenceTextarea.value;

        const phoneNumber = '+593985961866';

        let message = `¡Hola! Me gustaría hacer un pedido de donas:\n\n`;

        message += `*Datos del Cliente:*\n`;
        message += `Nombre: ${nombre}\n`;
        message += `Apellido: ${apellido}\n`;
        let fullAddress = `${province}, ${canton}, ${streetAddress}`;
        if (reference) {
            fullAddress += `, ${reference}`;
        }
        message += `Dirección: ${fullAddress}\n\n`;


        message += `*Detalle del Pedido:*\n`;
        cart.forEach(item => {
            message += `- ${item.nombre} (x${item.cantidad}) - $${(item.precio * item.cantidad).toFixed(2)}\n`;
        });
        message += `\n*Subtotal: $${cartSubtotalAmount.textContent}*\n`;
        message += `*Envío: A calcular (se confirmará por interno)*\n`;
        message += `*Total a pagar: $${cartTotalAmount.textContent}*\n`;
        message += '\nPor favor, confírmame la disponibilidad y el método de pago. ¡Gracias!';

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');

        cart = [];
        saveCart();
        updateCartDisplay();
        if (checkoutForm) {
            checkoutForm.reset();
            populateProvinces();
        }
    }

    // Función para manejar el envío del formulario de contacto por WhatsApp
    function handleContactFormSubmit(event) {
        console.log('handleContactFormSubmit function called.');
        event.preventDefault();

        if (!contactNameInput || !contactApellidoInput || !contactMessageTextarea) {
            console.error('Error: One or more contact form input elements are null. Check your HTML IDs.');
            return;
        }

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            console.log('Form validation failed. Please fill all required fields.');
            return;
        }
        console.log('Form validation passed.');

        const nombre = contactNameInput.value.trim();
        const apellido = contactApellidoInput.value.trim();
        const mensaje = contactMessageTextarea.value.trim();

        if (!nombre || !apellido || !mensaje) {
            console.log('One or more required fields are empty after trimming whitespace.');
            return;
        }

        const phoneNumber = '+593985961866';

        let whatsappMessage = `¡Hola! Tengo un mensaje desde el formulario de contacto de Milidonas:\n\n`;
        whatsappMessage += `*Nombre:* ${nombre}\n`;
        whatsappMessage += `*Apellido:* ${apellido}\n`;
        whatsappMessage += `*Mensaje:*\n${mensaje}`;

        console.log('WhatsApp message to send:', whatsappMessage);

        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        console.log('Opening WhatsApp URL:', whatsappUrl);
        try {
            window.open(whatsappUrl, '_blank');
            console.log('WhatsApp URL opened successfully.');
        } catch (e) {
            console.error('Error opening WhatsApp URL:', e);
        }

        contactForm.reset();
        console.log('Formulario de contacto limpiado.');
        console.log('Mensaje de contacto enviado por WhatsApp.');
    }

    // --- Lógica para Comentarios (Firebase Firestore) ---

    async function handleCommentSubmit(event) {
        event.preventDefault();

        if (!isAuthReady) {
            showCustomAlert('El sistema de comentarios no está listo. Por favor, inténtalo de nuevo en unos segundos.');
            return;
        }

        if (!commentForm.checkValidity()) {
            commentForm.reportValidity();
            return;
        }

        const name = commentNameInput.value.trim();
        const apellido = commentApellidoInput.value.trim();
        const socialLink = socialLinkInput.value.trim();
        const commentText = commentTextarea.value.trim();

        if (!name || !apellido || !commentText) {
            showCustomAlert('Por favor, completa todos los campos requeridos del comentario.');
            return;
        }

        try {
            // Referencia a la colección de comentarios (pública)
            const commentsCollectionRef = collection(db, `artifacts/${appId}/public/data/comments`);

            await addDoc(commentsCollectionRef, {
                name: name,
                lastName: apellido,
                socialLink: socialLink,
                commentText: commentText,
                timestamp: serverTimestamp(), // Marca de tiempo del servidor para ordenar
                userId: userId // ID del usuario que publica el comentario
            });

            showCustomAlert('¡Gracias! Tu comentario ha sido publicado.');
            commentForm.reset(); // Limpiar el formulario
        } catch (error) {
            console.error("Error al añadir el comentario a Firestore:", error);
            showCustomAlert('Hubo un error al publicar tu comentario. Por favor, inténtalo de nuevo.');
        }
    }

    function loadComments() {
        if (!isAuthReady || !commentsList) {
            // Si la autenticación no está lista o no estamos en la página de comentarios, no hacer nada
            return;
        }

        const commentsCollectionRef = collection(db, `artifacts/${appId}/public/data/comments`);
        // Consulta para obtener comentarios ordenados por fecha de publicación
        const q = query(commentsCollectionRef, orderBy("timestamp", "desc"));

        onSnapshot(q, (snapshot) => {
            commentsList.innerHTML = ''; // Limpiar la lista actual de comentarios
            if (snapshot.empty) {
                commentsList.innerHTML = '<p class="no-comments-message">Aún no hay comentarios. ¡Sé el primero en dejar uno!</p>';
                return;
            }

            snapshot.forEach((doc) => {
                const commentData = doc.data();
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment-item');

                const date = commentData.timestamp ? new Date(commentData.timestamp.toDate()).toLocaleString() : 'Fecha desconocida';

                let socialLinkHtml = '';
                if (commentData.socialLink) {
                    const iconClass = commentData.socialLink.includes('facebook.com') ? 'fab fa-facebook' :
                                      commentData.socialLink.includes('instagram.com') ? 'fab fa-instagram' :
                                      'fas fa-link'; // Icono genérico si no es FB/IG
                    socialLinkHtml = `<a href="${commentData.socialLink}" target="_blank" rel="noopener noreferrer" class="social-link-icon"><i class="${iconClass}"></i> Ver Perfil</a>`;
                }

                commentElement.innerHTML = `
                    <div class="comment-header">
                        <span class="comment-author">${commentData.name} ${commentData.lastName}</span>
                        <span class="comment-date">${date}</span>
                    </div>
                    <p class="comment-text">${commentData.commentText}</p>
                    <div class="comment-footer">
                        ${socialLinkHtml}
                        <span class="comment-user-id">ID de Usuario: ${commentData.userId.substring(0, 8)}...</span>
                    </div>
                `;
                commentsList.appendChild(commentElement);
            });
        }, (error) => {
            console.error("Error al obtener comentarios de Firestore:", error);
            commentsList.innerHTML = '<p class="error-message">Error al cargar los comentarios. Por favor, inténtalo de nuevo más tarde.</p>';
        });
    }
});
