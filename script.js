// script.js

document.addEventListener('DOMContentLoaded', function () {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let originalProducts = [];
    let filteredProducts = [];
    let currentSort = 'popularity'; // Для отслеживания текущего критерия сортировки

    // Функция для сортировки товаров с учетом скидки, если она есть
    function sortProducts(criteria) {
        if (criteria === 'popularity') {
            // Возвращаем товары в исходный порядок (по умолчанию)
            filteredProducts = [...originalProducts]; // Восстанавливаем исходный порядок товаров
        } else {
            // Сортировка с учетом скидки, если она есть
            filteredProducts.sort((a, b) => {
                const priceA = a.discount_price || a.actual_price; // Если есть скидка
                const priceB = b.discount_price || b.actual_price; // Если есть скидка

                switch (criteria) {
                    case 'price-asc':
                        return priceA - priceB; // По цене от меньшей к большей
                    case 'price-desc':
                        return priceB - priceA; // По цене от большей к меньшей
                    case 'rating':
                        return (b.rating || 0) - (a.rating || 0); // По рейтингу
                    default:
                        return 0; // Без сортировки по умолчанию
                }
            });
        }

        currentSort = criteria; // Обновляем текущий критерий сортировки
        renderProducts(); // Обновляем отображение товаров
    }

    // Обработчик изменения сортировки
    const sortSelect = document.getElementById('sort-options');
    sortSelect.addEventListener('change', function () {
        const selectedOption = sortSelect.value;
        sortProducts(selectedOption); // Сортируем товары по выбранному критерию
    });

    // Функция для отображения товаров
    function renderProducts() {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;

        productGrid.innerHTML = '';

        if (filteredProducts.length === 0) {
            productGrid.innerHTML = '<p>Нет товаров для отображения.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const productItem = document.createElement('div');
            productItem.classList.add('product-card');

            const productImage = document.createElement('img');
            productImage.src = product.image_url;
            productImage.alt = product.name;

            const productName = document.createElement('h3');
            productName.textContent = product.name;

            const productRating = document.createElement('div');
            productRating.classList.add('product-rating');
            productRating.textContent = `Рейтинг: ${product.rating || 'N/A'}`;

            const productPrice = document.createElement('div');
            if (product.discount_price) {
                const originalPrice = document.createElement('span');
                originalPrice.textContent = `${product.actual_price} руб.`;
                originalPrice.style.textDecoration = 'line-through';
                originalPrice.style.color = '#000';

                const discountedPrice = document.createElement('span');
                discountedPrice.textContent = `${product.discount_price} руб.`;
                discountedPrice.style.color = 'red';

                productPrice.appendChild(originalPrice);
                productPrice.appendChild(document.createElement('br'));
                productPrice.appendChild(discountedPrice);
            } else {
                productPrice.textContent = `${product.actual_price} руб.`;
            }

            const addToCartBtn = document.createElement('button');
            addToCartBtn.textContent = 'Добавить в корзину';
            addToCartBtn.addEventListener('click', () => {
                moveToCart(product);
            });

            productItem.appendChild(productImage);
            productItem.appendChild(productName);
            productItem.appendChild(productRating);
            productItem.appendChild(productPrice);
            productItem.appendChild(addToCartBtn);
            productGrid.appendChild(productItem);
        });
    }

    // Функция перемещения товара в корзину
    function moveToCart(product) {
        const existingProduct = cart.find(item => item.id === product.id);

        if (!existingProduct) {
            const price = product.discount_price || product.actual_price;
            cart.push({ ...product, quantity: 1, price });
            showNotification(`Товар добавлен в корзину!`);
        } else {
            existingProduct.quantity += 1;
            showNotification(`Количество товара "${product.name}" увеличено на 1!`);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    // Функция для отображения уведомления
    function showNotification(message) {
        // Создаём уведомление
        const notification = document.createElement('div');
        notification.className = 'notification';

        // Текст сообщения
        const messageText = document.createElement('span');
        messageText.textContent = message;

        // Кнопка закрытия
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            notification.remove();
        });

        // Добавляем элементы в уведомление
        notification.appendChild(messageText);
        notification.appendChild(closeButton);

        // Добавляем уведомление на страницу
        document.body.appendChild(notification);

        // Автоматическое закрытие, если не нажат крестик
        setTimeout(() => {
            notification.remove();
        }, 15000);
    }

    // Функция для общей стоимости заказа с доставкой
    function calculateFinalTotal() {
        let baseDeliveryCost = 200;
        const eveningExtraCost = 200;
        const weekendExtraCost = 300;

        const deliveryDate = document.getElementById('delivery-date').value;
        const deliveryTime = document.getElementById('delivery-time').value;

        if (!deliveryDate || !deliveryTime) {
            return; // Не обновляем, если данные о доставке отсутствуют
        }

        const deliveryDay = new Date(deliveryDate).getDay();
        const isWeekend = deliveryDay === 0 || deliveryDay === 6;
        const isEvening = deliveryTime.includes('18:00') || deliveryTime.includes('21:00');

        if (isWeekend) {
            baseDeliveryCost += weekendExtraCost;
        } else if (isEvening) {
            baseDeliveryCost += eveningExtraCost;
        }

        const totalProductsCost = cart.reduce((total, item) => total + item.price * item.quantity, 0);

        const deliveryPriceElement = document.getElementById('delivery-price');
        if (deliveryPriceElement) {
            deliveryPriceElement.textContent = `Стоимость доставки: ${baseDeliveryCost} руб.`;
        }

        const finalTotal = totalProductsCost + baseDeliveryCost;

        const finalTotalPriceElement = document.getElementById('total-price');
        if (finalTotalPriceElement) {
            finalTotalPriceElement.textContent = `Итоговая стоимость: ${finalTotal} руб.`;
        }
    }
    
    

    // Функция отображения корзины
    function renderCart() {
        const cartItemsContainer = document.getElementById('cart-content');
        const totalPriceElement = document.getElementById('total-price');
        const cartEmptyMessage = document.getElementById('cart-empty-message');
        const deliveryPriceElement = document.getElementById('delivery-price');

        if (!cartItemsContainer || !totalPriceElement || !cartEmptyMessage || !deliveryPriceElement) return;

        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartEmptyMessage.style.display = 'block';
            totalPriceElement.textContent = 'Итоговая стоимость: 0 руб.';
            deliveryPriceElement.textContent = 'Стоимость доставки: 200 руб.';
            return;
        } else {
            cartEmptyMessage.style.display = 'none';
        }

        let totalPrice = 0;
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('product-card');

            const cartItemImage = document.createElement('img');
            cartItemImage.src = item.image_url;
            cartItemImage.alt = item.name;

            const cartItemName = document.createElement('h3');
            cartItemName.textContent = item.name;

            const cartItemPrice = document.createElement('div');
            cartItemPrice.textContent = `${item.price} руб.`;

            const cartItemQuantity = document.createElement('div');
            cartItemQuantity.textContent = `Количество: ${item.quantity}`;

            const cartItemTotalPrice = document.createElement('div');
            cartItemTotalPrice.textContent = `Общая стоимость: ${item.price * item.quantity} руб.`;

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Удалить';
            removeBtn.addEventListener('click', () => {
                removeFromCart(item.id);
            });

            cartItem.appendChild(cartItemImage);
            cartItem.appendChild(cartItemName);
            cartItem.appendChild(cartItemPrice);
            cartItem.appendChild(cartItemQuantity);
            cartItem.appendChild(cartItemTotalPrice);
            cartItem.appendChild(removeBtn);

            cartItemsContainer.appendChild(cartItem);

            totalPrice += item.price * item.quantity;
        });

        
    // Привязываем обработчики событий к элементам доставки
        document.getElementById('delivery-date').addEventListener('change', calculateFinalTotal);
        document.getElementById('delivery-time').addEventListener('change', calculateFinalTotal);
        calculateFinalTotal();
    }
    


    // Удаление товара из корзины
    function removeFromCart(productId) {
        const productIndex = cart.findIndex(item => item.id === productId);
        if (productIndex !== -1) {
            cart.splice(productIndex, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        }
    }

    // Функция для очистки корзины
    function clearCart() {
        localStorage.removeItem('cart');
        cart.length = 0; // Очищаем массив корзины
        renderCart();
    }

    // Обработчик кнопки "Очистить корзину"
    const element = document.getElementById('clear-cart-btn');
        if (element) {
            element.addEventListener('click', clearCart);
        }


    // Функция для отображения подсказок при поиске
    function showSuggestions(suggestions) {
        const suggestionsList = document.getElementById('autocomplete-suggestions');
        if (!suggestionsList) return;

        suggestionsList.innerHTML = '';
        suggestions.forEach(suggestion => {
            const listItem = document.createElement('li');
            listItem.textContent = suggestion.name;
            listItem.addEventListener('click', function () {
                const searchInput = document.getElementById('search');
                const currentValue = searchInput.value.trim();
                const lastWord = currentValue.split(' ').pop();
                const newValue = currentValue.slice(0, -lastWord.length) + suggestion.name;

                searchInput.value = newValue;
                filterProducts(newValue); // фильтруем по выбранной подсказке
                suggestionsList.innerHTML = ''; // Скрыть список подсказок
            });
            suggestionsList.appendChild(listItem);
        });

        suggestionsList.style.display = 'block';
    }

    // Функция для получения подсказок
    async function fetchSuggestions(query) {
        try {
            const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=53c010a5-dd23-448e-ba0f-9df5fee7e3e3&query=${query}`);
            const suggestions = await response.json();
            showSuggestions(suggestions.slice(0, 5));
        } catch (error) {
            console.error('Ошибка поиска подсказок:', error);
        }
    }

    // Убираем обработчик ввода для поиска
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const query = searchInput.value;
            if (query.length >= 3) {
                fetchSuggestions(query); // Показываем подсказки
            } else {
                document.getElementById('autocomplete-suggestions').innerHTML = ''; // Очищаем подсказки
                document.getElementById('autocomplete-suggestions').style.display = 'none'; // Скрыть подсказки
            }
        });
    }

    // Функция для фильтрации товаров по запросу
    function filterProducts(query) {
        // Если введено меньше трех символов, можно не фильтровать или фильтровать по первым буквам
        if (query.length >= 3) {
            filteredProducts = originalProducts.filter(product =>
                product.name.toLowerCase().startsWith(query.toLowerCase()) // Поиск по началу названия
            );
        } else {
            filteredProducts = originalProducts; // Показываем все товары, если введено меньше 3 символов
        }
        applyFilters(); // Применяем фильтры после поиска
    }

    // Обработчик кнопки "Найти"
    const searchButton = document.getElementById('search-btn');
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            const query = document.getElementById('search').value;
            filterProducts(query); // Фильтруем товары только по нажатию кнопки
        });
    }

    // Применение фильтров (цена и скидка)
    function applyFilters() {
        const priceFrom = parseFloat(document.getElementById('price-from').value) || 0;
        const priceTo = parseFloat(document.getElementById('price-to').value) || Infinity;
        const discountFilter = document.getElementById('discount-filter').checked;

        filteredProducts = filteredProducts.filter(product => {
            const matchesPrice = product.actual_price >= priceFrom && product.actual_price <= priceTo;
            const matchesDiscount = discountFilter ? product.discount_price !== null : true;
            return matchesPrice && matchesDiscount;
        });

        renderProducts();
    }

    // Обработчик фильтров
    const filtersForm = document.getElementById('filters-form');
    if (filtersForm) {
        filtersForm.addEventListener('submit', function (e) {
            e.preventDefault();
            applyFilters();
        });
    }

    // Инициализация страницы
    async function init() {
        const response = await fetch('https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=53c010a5-dd23-448e-ba0f-9df5fee7e3e3');
        const data = await response.json();
        originalProducts = data;
        filteredProducts = data; // Изначально показываем все товары
        renderProducts();
        renderCart();
    }

    init();
});

document.addEventListener('DOMContentLoaded', function () {
    const shoppingCart = JSON.parse(localStorage.getItem('cart')) || [];

    // Локальные переменные для хранения данных о заказе
    let userData = {}; 
    let orderData = {};

    // Функция для обработки оформления заказа
    function handleOrder(event) {
        event.preventDefault();

        // Сбор данных из формы
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const subscribe = document.getElementById('subscribe').checked;
        const address = document.getElementById('address').value;
        const deliveryDate = document.getElementById('delivery-date').value;
        const deliveryTime = document.getElementById('delivery-time').value;
        const comment = document.getElementById('comment').value;

        // Сохраняем данные пользователя
        userData = {
            name,
            email,
            phone,
            subscribe,
        };

        // Сохраняем данные заказа
        const totalPrice = shoppingCart.reduce((total, item) => total + item.price * item.quantity, 0);
        const orderTime = new Date().toLocaleTimeString();  // Время оформления заказа
        orderData = {
            address,
            deliveryDate,
            deliveryTime,
            comment,
            items: shoppingCart,
            totalPrice,
            date: new Date().toLocaleDateString(),
            time: orderTime,  // Добавление времени
            userData: userData
        };
        

        // Добавление заказа в localStorage
        const orders = getOrdersFromLocalStorage();
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));
        console.log(deliveryTime);

        // Очистка корзины после оформления заказа
        localStorage.removeItem('cart');
        shoppingCart.length = 0;

        renderCart();

        // Сообщение об успешном оформлении заказа
        showNotification('Заказ успешно оформлен!');
    }

    // Функция для отображения уведомления
    function showNotification(message) {
        // Создаём уведомление
        const notification = document.createElement('div');
        notification.className = 'notification';

        // Текст сообщения
        const messageText = document.createElement('span');
        messageText.textContent = message;

        // Кнопка закрытия
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            notification.remove();
        });

        // Добавляем элементы в уведомление
        notification.appendChild(messageText);
        notification.appendChild(closeButton);

        // Добавляем уведомление на страницу
        document.body.appendChild(notification);

        // Автоматическое закрытие, если не нажат крестик
        setTimeout(() => {
            notification.remove();
        }, 15000);
    }

    // Подключаем обработчик к форме
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrder);
    }

    // Получение заказов из localStorage
    function getOrdersFromLocalStorage() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }

    // Функция для отображения корзины
    function renderCart() {
        const cartItemsContainer = document.getElementById('cart-content');
        const totalPriceElement = document.getElementById('total-price');
        const cartEmptyMessage = document.getElementById('cart-empty-message');

        if (!cartItemsContainer || !totalPriceElement || !cartEmptyMessage) return;

        cartItemsContainer.innerHTML = '';

        if (shoppingCart.length === 0) {
            cartEmptyMessage.style.display = 'block';
            totalPriceElement.textContent = 'Итоговая стоимость: 0 руб.';
            return;
        } else {
            cartEmptyMessage.style.display = 'none';
        }

        let totalPrice = 0;
        const DeliveryCost = 200;
        shoppingCart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('product-card');

            const cartItemImage = document.createElement('img');
            cartItemImage.src = item.image_url;
            cartItemImage.alt = item.name;

            const cartItemName = document.createElement('h3');
            cartItemName.textContent = item.name;

            const cartItemPrice = document.createElement('div');
            cartItemPrice.textContent = `${item.price} руб.`;

            const cartItemQuantity = document.createElement('div');
            cartItemQuantity.textContent = `Количество: ${item.quantity}`;

            const cartItemTotalPrice = document.createElement('div');
            cartItemTotalPrice.textContent = `Общая стоимость: ${item.price * item.quantity} руб.`;

            cartItem.appendChild(cartItemImage);
            cartItem.appendChild(cartItemName);
            cartItem.appendChild(cartItemPrice);
            cartItem.appendChild(cartItemQuantity);
            cartItem.appendChild(cartItemTotalPrice);

            cartItemsContainer.appendChild(cartItem);

            totalPrice += item.price * item.quantity;
        });

        // Добавляем фиксированное значение 200
        totalPrice += DeliveryCost;

        totalPriceElement.textContent = `Итоговая стоимость: ${totalPrice} руб.`;
    }

    function getOrdersFromLocalStorage() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }

    renderCart();
});

document.addEventListener('DOMContentLoaded', function () {
    const ordersTableBody = document.querySelector('#orders-table tbody');

    // Получение данных заказов из локального хранилища
    function getOrdersFromLocalStorage() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }

    // Функция для отображения заказов в таблице
    function renderOrders() {
        const orders = getOrdersFromLocalStorage();
        const ordersTableBody = document.querySelector('#orders-table tbody');

        ordersTableBody.innerHTML = '';

        if (orders.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="7">Нет заказов для отображения.</td>';
            ordersTableBody.appendChild(emptyRow);
            return;
        }

        orders.forEach((order, index) => {
            // Расчёт стоимости доставки
            let deliveryCost = 200; // Базовая стоимость доставки
            const deliveryDay = new Date(order.deliveryDate).getDay(); // День недели для даты доставки
            const isWeekend = (deliveryDay === 0 || deliveryDay === 6); // Суббота или воскресенье
            const isEvening = order.deliveryTime && (order.deliveryTime.includes('18:00') || order.deliveryTime.includes('21:00')); // Вечернее время

            if (isWeekend) {
                deliveryCost += 300; // В выходные добавляется 300 руб.
            } else if (isEvening) {
                deliveryCost += 200; // Вечернее время добавляется 200 руб.
            }

            // Общая стоимость товаров
            const totalProductsCost = order.items.reduce((total, item) => total + item.price * item.quantity, 0);

            // Общая стоимость с учётом доставки
            const finalTotal = totalProductsCost + deliveryCost;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${order.date} ${order.time}</td>
                <td>${order.items.map(item => item.name).join(', ')}</td>
                <td>${totalProductsCost} руб.</td> <!-- Стоимость товаров -->
                <td>${deliveryCost} руб.</td> <!-- Стоимость доставки -->
                <td>${finalTotal} руб.</td> <!-- Итоговая стоимость с доставкой -->
                <td>${order.deliveryDate}, ${order.deliveryTime}</td>
                <td>
                    <button class="view-btn" data-id="${index}">Просмотр</button>
                    <button class="edit-btn" data-id="${index}">Редактировать</button>
                    <button class="delete-btn" data-id="${index}">Удалить</button>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });
    }


    // Открытие модального окна для просмотра заказа
    function openViewModal(orderIndex) {
        const orders = getOrdersFromLocalStorage();
        const order = orders[orderIndex];
        const userData = order.userData || {};  // Изменение сюда, чтобы корректно получить данные пользователя из заказа
        console.log(userData);

        if (!order) return;

        // Добавление данных о заказе
        const viewOrderContent = document.getElementById('view-order-content');
                // Расчёт стоимости доставки
        let deliveryCost = 200; // Базовая стоимость доставки
        const deliveryDay = new Date(order.deliveryDate).getDay(); // День недели для даты доставки
        const isWeekend = (deliveryDay === 0 || deliveryDay === 6); // Суббота или воскресенье
        const isEvening = order.deliveryTime && (order.deliveryTime.includes('18:00') || order.deliveryTime.includes('21:00')); // Вечернее время

        if (isWeekend) {
            deliveryCost += 300; // В выходные добавляется 300 руб.
        } else if (isEvening) {
            deliveryCost += 200; // Вечернее время добавляется 200 руб.
        }

        // Общая стоимость товаров
        const totalProductsCost = order.items.reduce((total, item) => total + item.price * item.quantity, 0);

        // Общая стоимость с учётом доставки
        const finalTotal = totalProductsCost + deliveryCost;
        viewOrderContent.innerHTML = `
            <p><strong>Дата оформления:</strong> ${order.date} ${order.time}</p>  
            <p><strong>Состав:</strong> ${order.items.map(item => `${item.name}`).join(', ')}</p>
            <p><strong>Итоговая сумма:</strong> ${finalTotal} руб.</p>
            <p><strong>Дата и интервал доставки:</strong> ${order.deliveryDate}, ${order.deliveryTime}</p>
            <p><strong>Комментарий:</strong> ${order.comment || 'Нет комментариев'}</p>
        `;

        // Добавление данных пользователя
        document.getElementById('user-name').textContent = userData.name || 'Не указано';
        document.getElementById('user-email').textContent = userData.email || 'Не указано';
        document.getElementById('user-phone').textContent = userData.phone || 'Не указано';
        document.getElementById('user-subscribe').textContent = userData.subscribe ? 'Да' : 'Нет';

        const modalView = document.getElementById('modal-view');
        modalView.classList.remove('hidden');
    }



    function openEditModal(orderIndex) {
        const orders = getOrdersFromLocalStorage();
        const order = orders[orderIndex];
        const userData = order.userData || {};
        console.log(order);  // Проверка, что значение deliveryTime присутствует

        if (!order) return;

        // Устанавливаем значения в поля формы
        document.getElementById('edit-deliveryDate').value = order.deliveryDate;
        document.getElementById('edit-deliveryTime').value = order.deliveryTime;  // Здесь устанавливаем интервал времени
        document.getElementById('edit-comment').value = order.comment || '';

        document.getElementById('edit-name').value = userData.name || '';
        document.getElementById('edit-email').value = userData.email || '';
        document.getElementById('edit-phone').value = userData.phone || '';
        document.getElementById('edit-subscribe').checked = userData.subscribe || false;

        const modalEdit = document.getElementById('modal-edit');
        modalEdit.classList.remove('hidden');

        const editForm = document.getElementById('edit-order-form');
        editForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const updatedOrder = {
                date: order.date,
                time: order.time,
                items: order.items,
                totalPrice: order.totalPrice,
                deliveryDate: document.getElementById('edit-deliveryDate').value,
                deliveryTime: document.getElementById('edit-deliveryTime').value,  // Получаем выбранный интервал
                comment: document.getElementById('edit-comment').value || null,
                userData: {
                    name: document.getElementById('edit-name').value,
                    email: document.getElementById('edit-email').value,
                    phone: document.getElementById('edit-phone').value,
                    subscribe: document.getElementById('edit-subscribe').checked
                }
            };

            orders[orderIndex] = updatedOrder;
            localStorage.setItem('orders', JSON.stringify(orders));
            renderOrders();

            closeModal(modalEdit);
        });
    }


    // Обработчик кнопки "Просмотр"
    ordersTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('view-btn')) {
            const orderIndex = parseInt(event.target.dataset.id, 10);
            openViewModal(orderIndex);
        }
    });

    // Обработчик кнопки "Редактировать"
    ordersTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('edit-btn')) {
            const orderIndex = parseInt(event.target.dataset.id, 10);
            openEditModal(orderIndex);
        }
    });


    // Закрытие модального окна
    function closeModal(modal) {
        modal.classList.add('hidden');
    }
    

    // Обработчик кнопки "Удалить"
    ordersTableBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const orderIndex = parseInt(event.target.dataset.id, 10);
            deleteOrder(orderIndex);
        }
    });

    // Функция для удаления заказа с подтверждением через модальное окно
    function deleteOrder(orderIndex) {
        // Создаем модальное окно
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'custom-modal';

        const message = document.createElement('p');
        message.textContent = 'Точно ли Вы хотите удалить заказ?';

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'custom-modal-buttons';

        const confirmButton = document.createElement('button');
        confirmButton.className = 'custom-confirm-button';
        confirmButton.textContent = 'Да';

        const cancelButton = document.createElement('button');
        cancelButton.className = 'custom-cancel-button';
        cancelButton.textContent = 'Нет';

        // Добавляем кнопкам обработчики событий
        confirmButton.addEventListener('click', () => {
            // Удаляем заказ, если подтверждено
            const orders = getOrdersFromLocalStorage();
            orders.splice(orderIndex, 1); // Удаляем заказ по индексу
            localStorage.setItem('orders', JSON.stringify(orders)); // Обновляем данные в localStorage

            // Перерисовываем таблицу с заказами
            renderOrders();

            // Закрываем модальное окно
            closeModal(overlay);
        });

        cancelButton.addEventListener('click', () => {
            // Закрываем модальное окно без удаления
            closeModal(overlay);
        });

        // Добавляем элементы в модальное окно
        buttonsContainer.appendChild(confirmButton);
        buttonsContainer.appendChild(cancelButton);
        modal.appendChild(message);
        modal.appendChild(buttonsContainer);
        overlay.appendChild(modal);

        // Добавляем модальное окно на страницу
        document.body.appendChild(overlay);

        // Функция для плавного закрытия модального окна
        function closeModal(modalElement) {
            modalElement.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(modalElement);
            }, 300); // Время совпадает с transition в стилях
        }

        // Устанавливаем плавный показ окна
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 0); // Немедленный показ
    }




    // Обработчик кнопки "Закрыть" в модальном окне
    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('close-modal')) {
            closeModal(event.target.closest('.modal'));
        }
    });

    // Инициализация отображения заказов
    renderOrders();
});