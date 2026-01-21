(function() {
    // --- НАСТРОЙКИ (КОТОРЫЕ ТЫ МЕНЯЕШЬ) ---
    const CONFIG = {
        exchangeRate: 25.0,   // Курс злотого к рублю (пример)
        defaultShipping: 15,  // Стоимость доставки (пока фиксируем Польшу)
        botUsername: "YOUR_BOT_NAME", // Имя твоего бота (без @)
        
        // Коэффициенты для формул (если понадобятся)
        feeFixed: 2.90,       // Фикс. часть Protection Fee (если нужно считать)
        feePercent: 0.05      // 5% комиссия (если нужно считать)
    };

    // --- ЛОГИКА ПАРСИНГА ---
    function getProductData() {
        try {
            // 1. Ищем цену на странице (обычно data-testid="item-price")
            const priceEl = document.querySelector('[data-testid="item-price"]');
            if (!priceEl) throw new Error("Цена не найдена");
            
            let priceText = priceEl.innerText; 
            // Превращаем "120,50 zł" в число 120.50
            let rawPrice = parseFloat(priceText.replace(/[^0-9,.]/g, '').replace(',', '.'));

            // 2. Ищем фото (первое попавшееся)
            const imgEl = document.querySelector('[data-testid="item-photo"] img') || document.querySelector('img');
            const imgUrl = imgEl ? imgEl.src : "";

            return { rawPrice, imgUrl, title: document.title };
        } catch (e) {
            alert("Ошибка чтения страницы: " + e.message);
            return null;
        }
    }

    // --- ЛОГИКА РАСЧЕТА (ТВОЯ ФОРМУЛА) ---
    function calculateTotal(productPrice) {
        // Здесь мы реализуем твой п.1 и п.2
        // Допустим, мы берем цену товара и добавляем доставку
        // Если Protection Fee уже включен в цену на сайте (как ты сказал), то формула простая:
        
        let priceInPLN = productPrice + CONFIG.defaultShipping;
        
        // Перевод в рубли
        let totalRUB = Math.ceil(priceInPLN * CONFIG.exchangeRate);
        
        return totalRUB;
    }

    // --- СОЗДАНИЕ ИНТЕРФЕЙСА ---
    function createWidget(data, totalPrice) {
        // Удаляем старый виджет, если есть
        const old = document.getElementById('vinted-calc-widget');
        if (old) old.remove();

        const div = document.createElement('div');
        div.id = 'vinted-calc-widget';
        // Твой дизайн: Синий градиент, справа вверху
        div.style = `
            position: fixed; top: 20px; right: 20px; width: 280px;
            background: linear-gradient(135deg, #007AFF, #0056b3);
            color: white; padding: 20px; border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3); z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;
            animation: fadeIn 0.3s ease-out;
        `;

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h3 style="margin:0; font-size:16px; font-weight:700;">Ваш Сервис 🇵🇱</h3>
                <span style="cursor:pointer; opacity:0.7; font-size:20px;" onclick="document.getElementById('vinted-calc-widget').remove()">×</span>
            </div>
            
            <div style="margin-bottom: 15px;">
                <p style="margin:0; font-size:12px; opacity:0.8;">Цена товара: ${data.rawPrice} zł</p>
                <p style="margin:0; font-size:12px; opacity:0.8;">Доставка (PL): ${CONFIG.defaultShipping} zł</p>
                <div style="margin-top:10px; font-size:28px; font-weight:800;">
                    ${totalPrice.toLocaleString()} ₽
                </div>
            </div>

            <button id="vinted-order-btn" style="
                width: 100%; background: white; color: #007AFF; border: none;
                padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer;
                font-size: 14px; transition: transform 0.1s;
            ">
                Оформить заказ
            </button>
        `;

        document.body.appendChild(div);

        // Логика кнопки "Заказать"
        document.getElementById('vinted-order-btn').onclick = function() {
            // Формируем данные для бота
            // Кодируем данные в строку Base64, чтобы передать JSON
            const payload = {
                url: window.location.href,
                price: data.rawPrice,
                total: totalPrice,
                img: data.imgUrl
            };
            const encoded = btoa(JSON.stringify(payload));
            
            // Открываем бота (Deep Link)
            window.open(`https://t.me/${CONFIG.botUsername}?start=${encoded}`, '_blank');
        };
    }

    // --- ЗАПУСК ---
    const data = getProductData();
    if (data) {
        const total = calculateTotal(data.rawPrice);
        createWidget(data, total);
    }
})();
