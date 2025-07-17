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
    const contactNameInput = document.getElementById('contact-name'); // Corrected ID
    const contactApellidoInput = document.getElementById('contact-apellido'); // Corrected ID
    const contactMessageTextarea = document.getElementById('contact-message');
    const contactSubmitButton = document.querySelector('.submit-button[data-form-type="contact"]');

    console.log('Script loaded. Contact form element:', contactForm);
    console.log('Contact name input element:', contactNameInput);
    console.log('Contact apellido input element:', contactApellidoInput);
    console.log('Contact message textarea element:', contactMessageTextarea);
    console.log('Contact submit button element:', contactSubmitButton);


    let cart = JSON.parse(localStorage.getItem('donasCart')) || []; // Cargar carrito de localStorage
    // Se elimina la constante SHIPPING_COST

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

    // Lógica específica para la página del carrito (cart.html)
    if (cartItemsContainer && checkoutWhatsappButton) {
        updateCartDisplay(); // Mostrar el carrito al cargar la página
        checkoutWhatsappButton.addEventListener('click', handleCheckout);

        // Añadir event listener para el botón de vaciar carrito
        if (clearCartButton) {
            clearCartButton.addEventListener('click', clearCart);
        }
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
                    },
                    {
                        "id": "dona005",
                        "nombre": "Dona de Canela y Azúcar",
                        "descripcion": "Una explosión de sabor a canela y azúcar, perfecta para acompañar tu café.",
                        "precio": 1.65,
                        "imagen": "IMAGEN/md1.png"
                    },
                    {
                        "id": "dona006",
                        "nombre": "Dona Rellena de Crema Pastelera",
                        "descripcion": "Suave dona rellena de una deliciosa crema pastelera casera. ¡Un placer cremoso!",
                        "precio": 2.00,
                        "imagen": "IMAGEN/md2.png"
                    },
                    {
                        "id": "dona007",
                        "nombre": "Dona de Café con Glaseado",
                        "descripcion": "El toque perfecto de café en esta dona, ideal para los amantes de esta bebida.",
                        "precio": 1.80,
                        "imagen": "IMAGEN/md3.png"
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

        // Eliminar solo los productos existentes para recargar, sin tocar el título estático
        // Ya no se añade el <h2>Nuestras Donas</h2> aquí, ya que está en products.html
        Array.from(productGrid.children).forEach(child => {
            // Asegurarse de no eliminar el título estático si el productGrid contiene otros elementos
            // En este caso, productGrid solo debería contener los productos, no el título
            child.remove();
        });
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.imagen}" alt="${product.nombre}">
                <h3>${product.nombre}</h3>
                <p>${product.descripcion}</p>
                <p class="price">$${product.precio.toFixed(2)}</p>
                <button class="add-to-cart-btn" data-id="${product.id}">Añadir al Carrito</button>
            `;
            productGrid.appendChild(productCard);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.dataset.id;
                addProductToCart(productId, products); 
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

    // Función para actualizar la visualización del carrito (solo en cart.html)
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

    // Función para manejar el envío del pedido por WhatsApp (en cart.html)
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

        const nombre = checkoutForm ? document.getElementById('nombre').value : '';
        const apellido = checkoutForm ? document.getElementById('apellido').value : '';
        const direccion = checkoutForm ? document.getElementById('direccion').value : '';

        const phoneNumber = '+593985961866'; // Reemplaza con tu número de WhatsApp de Ecuador

        let message = `¡Hola! Me gustaría hacer un pedido de donas:\n\n`;
        
        if (nombre && apellido && direccion) {
            message += `*Datos del Cliente:*\n`;
            message += `Nombre: ${nombre}\n`;
            message += `Apellido: ${apellido}\n`;
            message += `Dirección: ${direccion}\n\n`;
        } else {
            message += `*Datos del Cliente: (No proporcionados en el formulario)*\n\n`;
        }

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
});
