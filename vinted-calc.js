(function() {
    // 1. Проверка наличия данных от закладки
    if (!window.vintedData) {
        alert("Ошибка: Данные не переданы из закладки.");
        return;
    }

    const price = parseFloat(window.vintedData.p) || 0;
    const country = window.vintedData.c || "Polska";

    // 2. Твои формулы и настройки
    const CONFIG = {
        exchangeRate: 25.0, // Курс злотый -> рубль
        botUsername: "YOUR_BOT_NAME" // ЗАМЕНИ НА СВОЕГО БОТА
    };

    const countryData = {
        "Polska": 11.75, "Poland": 11.75,
        "Czechy": 15.87, "Czech Republic": 15.87, "Česko": 15.87,
        "Litwa": 14.29, "Lithuania": 14.29, "Lietuva": 14.29,
        "Rumunia": 17.91, "Romania": 17.91, "România": 17.91,
        "Słowacja": 15.14, "Slovakia": 15.14, "Slovensko": 15.14,
        "Węgry": 16.65, "Hungary": 16.65, "Magyarország": 16.65
    };

    // 3. Логика расчета
    const shipping = countryData[country] || 15.00;
    const totalRUB = Math.ceil((price + shipping) * CONFIG.exchangeRate);

    // 4. Визуал (создание окна на сайте)
    const old = document.getElementById('vinted-fast-ui');
    if (old) old.remove();

    const ui = document.createElement('div');
    ui.id = 'vinted-fast-ui';
    ui.style = `
        position: fixed; top: 20px; right: 20px; width: 280px; 
        background: #09b6bc; color: white; padding: 25px; 
        border-radius: 18px; z-index: 9999999; font-family: sans-serif; 
        box-shadow: 0 12px 40px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2);
    `;

    ui.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:15px; opacity:0.7; font-size:11px; font-weight:bold; letter-spacing:1px;">
            <span>VINTED HELPER</span>
            <span style="cursor:pointer; font-size:20px;" onclick="this.parentElement.parentElement.remove()">×</span>
        </div>
        <div style="font-size:14px; margin-bottom:5px;">Локация: <b>${country}</b></div>
        <div style="font-size:38px; font-weight:900; margin-bottom:10px;">${totalRUB.toLocaleString()} ₽</div>
        <div style="font-size:12px; opacity:0.9; margin-bottom:20px; background:rgba(0,0,0,0.1); padding:10px; border-radius:8px;">
            ${price} zł + доставка ${shipping} zł
        </div>
        <button id="v-order-btn" style="
            width:100%; padding:14px; border:none; border-radius:10px; 
            background:white; color:#09b6bc; font-weight:bold; font-size:16px; cursor:pointer;
        ">ЗАКАЗАТЬ</button>
    `;

    document.body.appendChild(ui);

    // 5. Действие кнопки
    document.getElementById('v-order-btn').onclick = function() {
        const text = `Товар: ${window.location.href}\nЦена: ${totalRUB} руб.`;
        window.open(`https://t.me/${CONFIG.botUsername}?start=${btoa(unescape(encodeURIComponent(text)))}`);
    };

    // Очистка данных из памяти
    delete window.vintedData;
})();
