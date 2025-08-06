// script.js
document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productos');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const cartSubtotalAmount = document.getElementById('cart-subtotal-amount'); // Subtotal
    const shippingCostSpan = document.getElementById('shipping-cost'); // Costo de envío (ahora será un mensaje)
    const checkoutWhatsappButton = document.getElementById('checkout-whatsapp');
    const checkoutForm = document.getElementById('checkout-form');
    const clearCartButton = document.getElementById('clear-cart-btn'); // Botón de vaciar carrito

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

    console.log('Script loaded. Contact form element:', contactForm);
    console.log('Contact name input element:', contactNameInput);
    console.log('Contact apellido input element:', contactApellidoInput);
    console.log('Contact message textarea element:', contactMessageTextarea);
    console.log('Contact submit button element:', contactSubmitButton);

    let cart = JSON.parse(localStorage.getItem('donasCart')) || []; // Cargar carrito de localStorage

    // Datos de provincias y cantones de Ecuador (puedes expandir esta lista)
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
        updateCartCountDisplay(); // Actualizar el contador cada vez que el carrito cambia
    }

    // Función para actualizar la visualización del contador de productos en el encabezado
    function updateCartCountDisplay() {
        const cartCountSpan = document.getElementById('cart-count');

        if (cartCountSpan) {
            const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
            cartCountSpan.textContent = totalItems;

            if (totalItems > 0) {
                cartCountSpan.style.display = 'flex'; // Usar flex para centrar el número
            } else {
                cartCountSpan.style.display = 'none'; // Ocultar si no hay productos
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
        updateCartDisplay(); // Mostrar el carrito al cargar la página
        checkoutWhatsappButton.addEventListener('click', handleCheckout);

        // Añadir event listener para el botón de vaciar carrito
        if (clearCartButton) {
            clearCartButton.addEventListener('click', clearCart);
        }

        // Lógica para poblar provincias y cantones
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

    // Inicializar el contador del carrito al cargar cualquier página
    setTimeout(updateCartCountDisplay, 0);


    // Función para cargar los productos desde productos.json
    async function loadProducts() {
        try {
            const products = [
                {
                    "id": "dona001",
                    "nombre": "Capricho de Donas Surtida",
                    "descripcion": "¡Satisface tu antojo con nuestra Caja de 10 Mini Donas Capricho de Donas Surtidas! 🤤 Disfruta de una deliciosa combinación: mini donas con chocolate y trocitos de Oreo 🍪🍫, y otras glaseadas con coloridos confites ✨. ¡El tamaño perfecto para un capricho dulce en cualquier momento! 🎉",
                    "unidades": "10 mini donas", // Nuevo campo para las unidades
                    "precio": 2.50,
                    "imagen": "https://milidonas.github.io/IMAGEN/md1.png"
                },
                {
                    "id": "dona002",
                    "nombre": "Un Momento Choco & Coco",
                    "descripcion": "Dos minidonas, dos sabores únicos en una sola caja de antojo. Choco: esponjosa, con chocolate derretido y confites crujientes 🌈 Coco: dulce de leche + coco rallado para un toque tropical 🥥✨  Perfectas para compartir, consentirte o alegrar tu día 💖 ¡Choco & Coco, el dúo que endulza tu antojo! 🍩💥",
                    "unidades": "10 mini donas", // Nuevo campo para las unidades
                    "precio": 2.50,
                    "imagen": "https://milidonas.github.io/IMAGEN/md2.png"
                },
                {
                    "id": "dona003",
                    "nombre": "ChocoCrush & CookiePop",
                    "descripcion": "Dos minidonas, dos formas de romper la dieta (con gusto).  ChocoCrush: chocolate fundido + confites crujientes 🌈 CookiePop: dulce de leche con trozos de galleta Oreo 🍪✨  Dulces, esponjosas y adictivas. 🎉 ¡Una combinación explosiva para tus antojos! 💣🍩",
                    "unidades": "10 mini donas", // Nuevo campo para las unidades
                    "precio": 2.50,
                    "imagen": "https://milidonas.github.io/IMAGEN/md3.png"
                },
                {
                    "id": "dona004",
                    "nombre": "Donitas Dúo Delicia",
                    "descripcion": "Una explosión de sabor en cada bocado 🤤. Este dúo combina nuestras mini donas 🍩 suaves y esponjosas, cubiertas con una mezcla irresistible de coco rallado 🧀, leche condensada 🥛 y trozos de galleta Oreo 🍫. Perfectas para los amantes de lo dulce 🍬 con un toque único y cremoso 💖. ¡Te las vas a devorar! 😍✨",
                    "unidades": "10 mini donas", // Nuevo campo para las unidades
                    "precio": 2.50,
                    "imagen": "https://milidonas.github.io/IMAGEN/md4.png"
                }
            ];
            displayProducts(products);
            handleProductDeepLink(); // Llamar después de que los productos estén cargados
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

        Array.from(productGrid.children).forEach(child => {
            child.remove();
        });

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.id = product.id; // Asignar ID al product-card para el deep link
            // Se ajusta el formato de la descripción, unidades y el precio según lo solicitado
            productCard.innerHTML = `
                <img src="${product.imagen}" alt="${product.nombre}">
                <h3>${product.nombre}</h3>
                <p><strong>Descripción:</strong> ${product.descripcion}</p>
                <p><strong>Unidades:</strong> ${product.unidades}</p> <!-- Nuevo campo para unidades -->
                <p class="price">Precio: $${product.precio.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="add-to-cart-btn" data-id="${product.id}">Añadir al Carrito</button>
                    <button class="share-product-btn" data-id="${product.id}">
                        <i class="fas fa-share-alt"></i> Compartir
                    </button>
                </div>
            `;
            productGrid.appendChild(productCard);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.dataset.id;
                addProductToCart(productId, products);
            });
        });

        // Añadir event listeners para los botones de compartir
        document.querySelectorAll('.share-product-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.currentTarget.dataset.id;
                copyShareLink(productId, event.currentTarget); // Pasar el botón para feedback visual
            });
        });
    }

    // Función para añadir un producto al carrito
    function addProductToCart(productId, allProducts) {
        const productToAdd = allProducts.find(p => p.id === productId);
        if (productToAdd) {
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.cantidad++;
            } else {
                cart.push({ ...productToAdd, cantidad: 1 });
            }
            saveCart();
            console.log('Producto añadido al carrito:', cart);
        }
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
            // Deshabilitar selectores de ubicación si el carrito está vacío
            if (provinceSelect) provinceSelect.disabled = true;
            if (cantonSelect) cantonSelect.disabled = true;
            if (streetAddressInput) streetAddressInput.disabled = true;
            if (referenceTextarea) referenceTextarea.disabled = true;

            return;
        }

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            // Se ajusta el formato de la cantidad y el precio en el carrito
            itemElement.innerHTML = `
                <span>${item.nombre}</span>
                <div class="item-quantity-controls">
                    <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                    <span class="item-quantity">Cantidad: ${item.cantidad}</span>
                    <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                </div>
                <span>Precio: $${(item.precio * item.cantidad).toFixed(2)}</span>
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
        // Habilitar selectores de ubicación si hay productos en el carrito
        if (provinceSelect) provinceSelect.disabled = false;
        // Canton select will be enabled by populateCantons if a province is selected
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

    // Función para eliminar un producto del carrito (mantenerla por si acaso, aunque ya no se usa con los botones +/-)
    function removeProductFromCart(productId) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            cart.splice(itemIndex, 1);
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

        // Limpiar opciones existentes (excepto la primera "Selecciona una provincia")
        provinceSelect.innerHTML = '<option value="">Selecciona una provincia</option>';
        cantonSelect.innerHTML = '<option value="">Selecciona un cantón</option>';
        cantonSelect.disabled = true; // Deshabilitar cantones hasta que se elija una provincia

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
        cantonSelect.disabled = true; // Deshabilitar por defecto

        if (selectedProvince && ecuadorLocations[selectedProvince]) {
            ecuadorLocations[selectedProvince].forEach(canton => {
                const option = document.createElement('option');
                option.value = canton;
                option.textContent = canton;
                cantonSelect.appendChild(option);
            });
            cantonSelect.disabled = false; // Habilitar cantones si hay una provincia seleccionada
        }
    }


    // Función para manejar el envío del pedido por WhatsApp (en checkout.html)
    function handleCheckout() {
        if (cart.length === 0) {
            console.log('Tu carrito está vacío. ¡Añade algunas donas!');
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
        const reference = referenceTextarea.value; // Este campo no es requerido, puede estar vacío

        const phoneNumber = '+593985961866'; // Reemplaza con tu número de WhatsApp de Ecuador

        let message = `> Datos de Factura:\n\n`;

        message += `*Datos del Cliente:*\n`;
        message += `Nombre: ${nombre}\n`;
        message += `Apellido: ${apellido}\n`;
        // Combinar la dirección en una sola línea
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
            populateProvinces(); // Volver a inicializar los selectores de ubicación
        }
    }

    // Función para manejar el envío del formulario de contacto por WhatsApp
    function handleContactFormSubmit(event) {
        console.log('handleContactFormSubmit function called.'); // Mensaje de depuración
        event.preventDefault(); // Prevenir el envío normal del formulario

        // Verificar si los elementos de entrada existen antes de intentar acceder a sus valores
        if (!contactNameInput || !contactApellidoInput || !contactMessageTextarea) {
            console.error('Error: One or more contact form input elements are null. Check your HTML IDs.');
            return; // Detener la ejecución si los elementos no se encuentran
        }

        // Realizar la validación del formulario
        // checkValidity() verifica si todos los campos requeridos tienen un valor
        if (!contactForm.checkValidity()) {
            contactForm.reportValidity(); // Muestra los mensajes de error de validación del navegador
            console.log('Form validation failed. Please fill all required fields.'); // Mensaje de depuración
            return;
        }
        console.log('Form validation passed.'); // Mensaje de depuración

        // Obtener los valores de los campos y eliminar espacios en blanco al inicio y al final
        const nombre = contactNameInput.value.trim();
        const apellido = contactApellidoInput.value.trim();
        const mensaje = contactMessageTextarea.value.trim();

        // Volver a verificar si los campos están vacíos después de eliminar espacios en blanco
        // Esto es importante porque un campo con solo espacios en blanco pasa checkValidity()
        if (!nombre || !apellido || !mensaje) {
            console.log('One or more required fields are empty after trimming whitespace.'); // Mensaje de depuración
            // Puedes reportar la validez de nuevo si quieres un mensaje específico, pero el 'required' de HTML ya lo maneja
            return;
        }

        const phoneNumber = '+593985961866'; // Reemplaza con tu número de WhatsApp de Ecuador

        let whatsappMessage = `¡Hola! Tengo un mensaje desde el formulario de contacto de Milidonas:\n\n`;
        whatsappMessage += `*Nombre:* ${nombre}\n`;
        whatsappMessage += `*Apellido:* ${apellido}\n`;
        whatsappMessage += `*Mensaje:*\n${mensaje}`;

        console.log('WhatsApp message to send:', whatsappMessage); // Mensaje de depuración

        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        console.log('Opening WhatsApp URL:', whatsappUrl); // Mensaje de depuración
        try {
            window.open(whatsappUrl, '_blank');
            console.log('WhatsApp URL opened successfully.'); // Mensaje de depuración
        } catch (e) {
            console.error('Error opening WhatsApp URL:', e); // Mensaje de error
            // Opcionalmente, puedes mostrar un mensaje al usuario si la ventana no se abre
            // alert('No se pudo abrir WhatsApp. Por favor, asegúrate de tener una aplicación de WhatsApp instalada o inténtalo más tarde.');
        }

        // Limpiar el formulario después de enviar
        contactForm.reset();
        console.log('Formulario de contacto limpiado.'); // Mensaje de depuración
        console.log('Mensaje de contacto enviado por WhatsApp.'); // Mensaje de depuración
    }

    // --- Nuevas funciones para compartir productos ---

    // Función para copiar el enlace del producto al portapapeles
    async function copyShareLink(productId, buttonElement) {
        const currentPath = window.location.pathname;
        const baseUrl = currentPath.substring(0, currentPath.lastIndexOf('/'));
        const shareUrl = `${window.location.origin}${baseUrl}/products.html?id=${productId}`;

        try {
            // Usar document.execCommand('copy') como fallback para entornos que no soportan navigator.clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareUrl);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = shareUrl;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            // Feedback visual al usuario
            const originalText = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fas fa-check"></i> Copiado!';
            buttonElement.disabled = true; // Deshabilitar temporalmente

            setTimeout(() => {
                buttonElement.innerHTML = originalText;
                buttonElement.disabled = false; // Habilitar de nuevo
            }, 2000); // Volver al texto original después de 2 segundos

            console.log('Enlace copiado:', shareUrl);
        } catch (err) {
            console.error('Error al copiar el enlace:', err);
            // Puedes mostrar un mensaje de error al usuario si la copia falla
            const originalText = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fas fa-times"></i> Error!';
            buttonElement.disabled = true;
            setTimeout(() => {
                buttonElement.innerHTML = originalText;
                buttonElement.disabled = false;
            }, 2000);
        }
    }

    // Función para manejar el deep linking a un producto específico
    function handleProductDeepLink() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            // Esperar un momento para asegurar que los productos se hayan renderizado
            setTimeout(() => {
                const productElement = document.getElementById(productId);
                if (productElement) {
                    productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Opcional: resaltar el producto por un momento
                    productElement.style.transition = 'box-shadow 0.5s ease-in-out';
                    productElement.style.boxShadow = '0 0 15px 5px rgba(52, 152, 219, 0.7)'; // Azul vibrante
                    setTimeout(() => {
                        productElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)'; // Volver a la sombra original
                    }, 3000);
                } else {
                    console.warn(`Producto con ID "${productId}" no encontrado.`);
                }
            }, 500); // Pequeño retraso para asegurar que el DOM esté listo
        }
    }
});
