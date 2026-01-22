(function() {
    // Получаем данные из URL скрипта
    const scriptSrc = document.currentScript ? document.currentScript.src : Array.from(document.getElementsByTagName('script')).pop().src;
    const urlParams = new URLSearchParams(scriptSrc.split('?')[1]);
    
    let incomingPrice = parseFloat(urlParams.get('p')) || 0;
    let incomingCountry = decodeURIComponent(urlParams.get('c') || "Polska");

    // Актуальная база цен доставки
    const countryData = {
        "Polska": 11.75, "Poland": 11.75,
        "Czechy": 15.87, "Czech Republic": 15.87, "Czechia": 15.87, "Česko": 15.87,
        "Litwa": 14.29, "Lithuania": 14.29, "Lietuva": 14.29, "Litwa": 14.29,
        "Rumunia": 17.91, "Romania": 17.91, "România": 17.91,
        "Słowacja": 15.14, "Slovakia": 15.14, "Slovensko": 15.14,
        "Węgry": 16.65, "Hungary": 16.65, "Magyarország": 16.65
    };

    const CONFIG = { 
        exchangeRate: 25.0, 
        botUsername: "YOUR_BOT_NAME" // ЗАМЕНИТЕ НА ИМЯ ВАШЕГО БОТА
    };

    function renderWidget(price, country) {
        const old = document.getElementById('vinted-fast-ui');
        if (old) old.remove();

        const shipping = countryData[country] || 15.00;
        const total = Math.ceil((price + shipping) * CONFIG.exchangeRate);

        const ui = document.createElement('div');
        ui.id = 'vinted-fast-ui';
        ui.style = `
            position: fixed; top: 20px; right: 20px; width: 260px; 
            background: #09b6bc; color: white; padding: 20px; 
            border-radius: 12px; z-index: 9999999; font-family: sans-serif; 
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        `;

        ui.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-size:10px; font-weight:bold; letter-spacing:1px;">VINTED HELPER</span>
                <span style="cursor:pointer; font-size:18px;" onclick="this.parentElement.parentElement.remove()">×</span>
            </div>
            <div style="font-size:12px; opacity:0.8; margin-bottom:5px;">ЛОКАЦИЯ: ${country}</div>
            <div style="font-size:32px; font-weight:bold; margin-bottom:10px;">${total.toLocaleString()} ₽</div>
            <div style="font-size:11px; opacity:0.8; margin-bottom:15px;">Товар: ${price} + Доставка: ${shipping} (zł)</div>
            <button id="v-order" style="
                width:100%; padding:12px; border:none; border-radius:6px; 
                background:white; color:#09b6bc; font-weight:bold; cursor:pointer;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            ">ЗАКАЗАТЬ</button>
        `;

        document.body.appendChild(ui);

        document.getElementById('v-order').onclick = function() {
            const info = btoa(`URL: ${window.location.href} | Total: ${total} RUB`);
            window.open(`https://t.me/${CONFIG.botUsername}?start=${info}`);
        };
    }

    renderWidget(incomingPrice, incomingCountry);
})();
