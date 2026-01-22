(function() {
    // 1. Извлекаем данные из URL скрипта
    const scriptSrc = document.currentScript ? document.currentScript.src : Array.from(document.getElementsByTagName('script')).pop().src;
    const urlParams = new URLSearchParams(scriptSrc.split('?')[1]);
    
    let incomingPrice = parseFloat(urlParams.get('p')) || 0;
    let incomingCountry = decodeURIComponent(urlParams.get('c') || "Polska");

    // 2. Актуальная база данных
    const countryData = {
        "Polska": 11.75, "Poland": 11.75,
        "Czechy": 15.87, "Czech Republic": 15.87, "Czechia": 15.87, "Česko": 15.87,
        "Litwa": 14.29, "Lithuania": 14.29, "Lietuva": 14.29,
        "Rumunia": 17.91, "Romania": 17.91, "România": 17.91,
        "Słowacja": 15.14, "Slovakia": 15.14, "Slovensko": 15.14,
        "Węgry": 16.65, "Hungary": 16.65, "Magyarország": 16.65
    };

    const CONFIG = { 
        exchangeRate: 25.0, 
        botUsername: "YOUR_BOT_NAME" // !!! ЗАМЕНИ НА ИМЯ СВОЕГО БОТА
    };

    function renderWidget(price, country) {
        const old = document.getElementById('v-final-calc');
        if (old) old.remove();

        // Если страны нет в списке, ставим стандартную доставку 15 zł
        const shipping = countryData[country] || 15.00;
        const total = Math.ceil((price + shipping) * CONFIG.exchangeRate);

        const widget = document.createElement('div');
        widget.id = 'v-final-calc';
        widget.style = `
            position: fixed; top: 20px; right: 20px; width: 280px;
            background: #09b6bc; color: white; padding: 20px; border-radius: 15px;
            z-index: 10000000; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            font-family: sans-serif;
        `;

        // Генерируем список стран для ручного выбора
        const options = Object.keys(countryData)
            .filter(k => !["Poland", "Czechia", "Slovakia", "Romania", "Lithuania", "Hungary"].includes(k))
            .map(k => `<option value="${k}" ${k === country ? 'selected' : ''} style="color:black">${k}</option>`)
            .join('');

        widget.innerHTML = `
            <div style="display:flex;justify-content:space-between;font-size:12px;opacity:0.8;margin-bottom:10px;">
                <span>VINTED HELPER</span>
                <span style="cursor:pointer" onclick="this.parentElement.parentElement.remove()">✕</span>
            </div>
            <div style="margin-bottom:12px">
                <label style="font-size:10px; display:block; margin-bottom:4px;">СТРАНА ОТПРАВКИ:</label>
                <select id="v-change-country" style="background:rgba(255,255,255,0.2);color:white;border:none;border-radius:5px;padding:5px;font-size:14px;width:100%;outline:none;">
                    ${options}
                </select>
            </div>
            <div style="font-size:36px;font-weight:bold;margin-bottom:5px;">${total.toLocaleString()} ₽</div>
            <div style="font-size:13px;opacity:0.9;margin-bottom:15px;">
                Товар: ${price} zł + Доставка: ${shipping} zł
            </div>
            <button id="v-send-btn" style="width:100%;padding:12px;border:none;border-radius:8px;background:white;color:#09b6bc;font-weight:bold;cursor:pointer;transition:0.2s;">Оформить заказ</button>
        `;

        document.body.appendChild(widget);

        // Пересчет при смене страны вручную
        document.getElementById('v-change-country').onchange = function(e) {
            renderWidget(price, e.target.value);
        };

        // Кнопка заказа в ТГ
        document.getElementById('v-send-btn').onclick = function() {
            const data = {
                url: window.location.href,
                price: price,
                shipping: shipping,
                total: total,
                country: country
            };
            const msg = btoa(JSON.stringify(data));
            window.open(`https://t.me/${CONFIG.botUsername}?start=${msg}`);
        };
    }

    renderWidget(incomingPrice, incomingCountry);
})();
