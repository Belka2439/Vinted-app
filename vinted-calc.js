(function() {
    // --- ДАННЫЕ ИЗ ВАШЕЙ ТАБЛИЦЫ ---
    const countryData = {
        "Polska": { price: 11.75, flag: "🇵🇱" },
        "Czech Republic": { price: 15.87, flag: "🇨🇿" }, // На Vinted часто на англ.
        "Czechia": { price: 15.87, flag: "🇨🇿" },
        "Lithuania": { price: 14.29, flag: "🇱🇹" },
        "Lietuva": { price: 14.29, flag: "🇱🇹" },
        "Romania": { price: 17.91, flag: "🇷🇴" },
        "România": { price: 17.91, flag: "🇷🇴" },
        "Slovakia": { price: 15.14, flag: "🇸🇰" },
        "Slovensko": { price: 15.14, flag: "🇸🇰" },
        "Hungary": { price: 16.65, flag: "🇭🇺" },
        "Magyarország": { price: 16.65, flag: "🇭🇺" },
        "Sweden": { price: 22.35, flag: "🇸🇪" },
        "Sverige": { price: 22.35, flag: "🇸🇪" },
        "Finland": { price: 24.32, flag: "🇫🇮" },
        "Suomi": { price: 24.32, flag: "🇫🇮" },
        "Denmark": { price: 21.42, flag: "🇩🇰" },
        "Danmark": { price: 21.42, flag: "🇩🇰" },
        "Croatia": { price: 16.21, flag: "🇭🇷" },
        "Hrvatska": { price: 16.21, flag: "🇭🇷" },
        "Estonia": { price: 6.36, flag: "🇪🇪" },
        "Eesti": { price: 6.36, flag: "🇪🇪" },
        "Latvia": { price: 6.36, flag: "🇱🇻" },
        "Latvija": { price: 6.36, flag: "🇱🇻" },
        "Slovenia": { price: 4.22, flag: "🇸🇮" },
        "Slovenija": { price: 4.22, flag: "🇸🇮" }
    };

    const CONFIG = {
        exchangeRate: 25.0, // Твой курс злотый -> рубль
        botUsername: "YOUR_BOT_NAME"
    };

    function getVintedData() {
        try {
            // 1. Парсим цену товара
            const priceEl = document.querySelector('[data-testid$="item-price"]');
            if (!priceEl) return { error: "Цена не найдена" };
            const rawPrice = parseFloat(priceEl.innerText.replace(/[^0-9,.]/g, '').replace(',', '.'));

            // 2. Парсим страну (ищем текст типа "Legnica, Polska")
            // Vinted часто меняет классы, поэтому ищем по иерархии в блоке продавца
            const locationEl = document.querySelector('.u-flex-align-items-center span') || 
                               document.querySelector('.details-list__item-value--location');
            
            if (!locationEl) return { error: "Местоположение не найдено" };
            
            const locationText = locationEl.innerText; // Например: "Legnica, Polska"
            const countryName = locationText.split(',').pop().trim(); // Берем последнее слово после запятой

            const countryInfo = countryData[countryName];
            
            if (!countryInfo) {
                return { error: "В данный момент не можем заказать из этой страны (" + countryName + ")" };
            }

            return {
                price: rawPrice,
                shipping: countryInfo.price,
                flag: countryInfo.flag,
                country: countryName,
                img: document.querySelector('[data-testid$="item-photo"] img')?.src || ""
            };
        } catch (e) {
            return { error: "Ошибка скрипта" };
        }
    }

    const data = getVintedData();

    if (data.error) {
        alert(data.error);
        return;
    }

    // Расчет итоговой цены (Цена + Доставка) * Курс
    const totalRUB = Math.ceil((data.price + data.shipping) * CONFIG.exchangeRate);

    // Создаем виджет
    const widget = document.createElement('div');
    widget.id = 'vinted-custom-widget';
    widget.style = `
        position: fixed; top: 20px; right: 20px; width: 260px;
        background: linear-gradient(135deg, #007AFF, #0056b3);
        color: white; padding: 20px; border-radius: 15px;
        z-index: 999999; box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        font-family: sans-serif;
    `;

    widget.innerHTML = `
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">
            Отправление: ${data.flag} ${data.country}
        </div>
        <div style="font-size: 12px; opacity: 0.7;">Доставка: ${data.shipping} zł</div>
        <div style="font-size: 26px; font-weight: bold; margin: 10px 0;">
            ${totalRUB.toLocaleString()} ₽
        </div>
        <button id="vinted-go-bot" style="
            width: 100%; border: none; padding: 10px; border-radius: 8px;
            background: white; color: #007AFF; font-weight: bold; cursor: pointer;
        ">Заказать</button>
        <div id="close-v-widget" style="margin-top:10px; font-size:11px; cursor:pointer; opacity:0.6; text-align:center;">Закрыть</div>
    `;

    document.body.appendChild(widget);

    document.getElementById('close-v-widget').onclick = () => widget.remove();
    document.getElementById('vinted-go-bot').onclick = () => {
        const message = btoa(JSON.stringify({ url: window.location.href, total: totalRUB }));
        window.open(`https://t.me/${CONFIG.botUsername}?start=${message}`);
    };

})();
