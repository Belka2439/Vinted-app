(function() {
    // 1. Получаем данные, которые прислала закладка через URL
    const urlParams = new URLSearchParams(window.scripts[window.scripts.length - 1].src.split('?')[1]);
    const incomingPrice = parseFloat(urlParams.get('p')) || 0;
    const incomingCountry = urlParams.get('c') || "Polska";

    // 2. Актуальные цены доставки и курс (МЕНЯТЬ ЗДЕСЬ)
    const countryData = {
        "Polska": { price: 11.75, flag: "🇵🇱" },
        "Czechy": { price: 15.87, flag: "🇨🇿" },
        "Czech Republic": { price: 15.87, flag: "🇨🇿" },
        "Litwa": { price: 14.29, flag: "🇱🇹" },
        "Lithuania": { price: 14.29, flag: "🇱🇹" },
        "Rumunia": { price: 17.91, flag: "🇷🇴" },
        "Romania": { price: 17.91, flag: "🇷🇴" },
        "Słowacja": { price: 15.14, flag: "🇸🇰" },
        "Slovakia": { price: 15.14, flag: "🇸🇰" }
        /* Добавь остальные страны по аналогии */
    };

    const CONFIG = {
        exchangeRate: 25.0,
        botUsername: "YOUR_BOT_NAME"
    };

    // 3. Расчет
    const countryInfo = countryData[incomingCountry] || { price: 0, flag: "❓" };
    const totalRUB = Math.ceil((incomingPrice + countryInfo.price) * CONFIG.exchangeRate);

    // 4. Отрисовка (если страны нет в базе, показываем предупреждение)
    if (countryInfo.price === 0 && incomingCountry !== "Polska") {
        alert("В данный момент не можем заказать из этой страны: " + incomingCountry);
        return;
    }

    const old = document.getElementById('vinted-fast-calc');
    if (old) old.remove();

    const widget = document.createElement('div');
    widget.id = 'vinted-fast-calc';
    widget.style = `
        position: fixed; top: 20px; right: 20px; width: 260px;
        background: #007AFF; color: white; padding: 20px; border-radius: 15px;
        z-index: 1000000; box-shadow: 0 5px 20px rgba(0,0,0,0.3); font-family: sans-serif;
    `;

    widget.innerHTML = `
        <div style="font-size:12px; opacity:0.8; margin-bottom:5px;">${countryInfo.flag} ${incomingCountry}</div>
        <div style="font-size:28px; font-weight:bold; margin-bottom:10px;">${totalRUB.toLocaleString()} ₽</div>
        <div style="font-size:11px; opacity:0.7; margin-bottom:15px;">Товар: ${incomingPrice} + Доставка: ${countryInfo.price} (zł)</div>
        <button onclick="window.open('https://t.me/${CONFIG.botUsername}?start=${btoa(totalRUB)}')" style="
            width:100%; border:none; padding:10px; border-radius:8px; background:white; color:#007AFF; font-weight:bold; cursor:pointer;
        ">Заказать</button>
    `;

    document.body.appendChild(widget);
})();
