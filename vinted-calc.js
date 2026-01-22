(function() {
    // 1. Получаем данные из URL скрипта
    const scriptSrc = document.currentScript ? document.currentScript.src : Array.from(document.getElementsByTagName('script')).pop().src;
    const urlParams = new URLSearchParams(scriptSrc.split('?')[1]);
    
    const incomingPrice = parseFloat(urlParams.get('p')) || 0;
    const incomingCountry = urlParams.get('c') || "Polska";

    // 2. База данных (цены из вашей таблицы)
    const countryData = {
        "Polska": { price: 11.75, flag: "🇵🇱" },
        "Poland": { price: 11.75, flag: "🇵🇱" },
        "Czechy": { price: 15.87, flag: "🇨🇿" },
        "Czech Republic": { price: 15.87, flag: "🇨🇿" },
        "Czechia": { price: 15.87, flag: "🇨🇿" },
        "Česko": { price: 15.87, flag: "🇨🇿" },
        "Litwa": { price: 14.29, flag: "🇱🇹" },
        "Lithuania": { price: 14.29, flag: "🇱🇹" },
        "Lietuva": { price: 14.29, flag: "🇱🇹" },
        "Rumunia": { price: 17.91, flag: "🇷🇴" },
        "Romania": { price: 17.91, flag: "🇷🇴" },
        "România": { price: 17.91, flag: "🇷🇴" },
        "Słowacja": { price: 15.14, flag: "🇸🇰" },
        "Slovakia": { price: 15.14, flag: "🇸🇰" },
        "Slovensko": { price: 15.14, flag: "🇸🇰" },
        "Węgry": { price: 16.65, flag: "🇭🇺" },
        "Hungary": { price: 16.65, flag: "🇭🇺" },
        "Magyarország": { price: 16.65, flag: "🇭🇺" },
        "Estonia": { price: 6.36, flag: "🇪🇪" },
        "Eesti": { price: 6.36, flag: "🇪🇪" }
    };

    const CONFIG = {
        exchangeRate: 25.0, // Курс злотый -> рубль
        botUsername: "YOUR_BOT_NAME" // ЗАМЕНИТЕ НА ВАШЕГО БОТА
    };

    // 3. Логика расчета
    const info = countryData[incomingCountry] || { price: 18.00, flag: "🌍" };
    const totalRUB = Math.ceil((incomingPrice + info.price) * CONFIG.exchangeRate);

    // 4. Отрисовка виджета
    const oldWidget = document.getElementById('vinted-final-calc');
    if (oldWidget) oldWidget.remove();

    const widget = document.createElement('div');
    widget.id = 'vinted-final-calc';
    widget.style = `
        position: fixed; top: 20px; right: 20px; width: 280px;
        background: #09b6bc; color: white; padding: 20px; border-radius: 12px;
        z-index: 1000000; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-family: sans-serif; text-align: left;
    `;

    widget.innerHTML = `
        <div style="font-size: 14px; margin-bottom: 8px; display: flex; justify-content: space-between;">
            <span>${info.flag} ${incomingCountry}</span>
            <span style="cursor:pointer;" onclick="this.parentElement.parentElement.remove()">✕</span>
        </div>
        <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">${totalRUB.toLocaleString()} ₽</div>
        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 15px;">
            ${incomingPrice} zł + доставка ${info.price} zł
        </div>
        <button id="v-order-btn" style="
            width: 100%; padding: 12px; border: none; border-radius: 6px;
            background: white; color: #09b6bc; font-weight: bold; cursor: pointer;
        ">Оформить в Telegram</button>
    `;

    document.body.appendChild(widget);

    document.getElementById('v-order-btn').onclick = function() {
        const text = `Заказ: ${window.location.href}\nЦена: ${totalRUB} ₽`;
        window.open(`https://t.me/${CONFIG.botUsername}?start=${btoa(text)}`);
    };
})();
