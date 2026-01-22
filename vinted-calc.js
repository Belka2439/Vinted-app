(function() {
    // --- 1. БАЗА ДАННЫХ СТРАН И ЦЕН ---
    // Ключи - это то, как страна написана на сайте (на польском или английском)
    const countryData = {
        // Польша
        "Polska": { price: 11.75, flag: "🇵🇱" },
        "Poland": { price: 11.75, flag: "🇵🇱" },
        
        // Чехия
        "Česko": { price: 15.87, flag: "🇨🇿" },
        "Czechy": { price: 15.87, flag: "🇨🇿" },
        "Czech Republic": { price: 15.87, flag: "🇨🇿" },
        "Czechia": { price: 15.87, flag: "🇨🇿" },
        
        // Литва
        "Lietuva": { price: 14.29, flag: "🇱🇹" },
        "Lithuania": { price: 14.29, flag: "🇱🇹" },
        "Litwa": { price: 14.29, flag: "🇱🇹" },
        
        // Румыния
        "România": { price: 17.91, flag: "🇷🇴" },
        "Romania": { price: 17.91, flag: "🇷🇴" },
        "Rumunia": { price: 17.91, flag: "🇷🇴" },
        
        // Словакия
        "Slovensko": { price: 15.14, flag: "🇸🇰" },
        "Slovakia": { price: 15.14, flag: "🇸🇰" },
        "Słowacja": { price: 15.14, flag: "🇸🇰" },
        
        // Венгрия
        "Magyarország": { price: 16.65, flag: "🇭🇺" },
        "Hungary": { price: 16.65, flag: "🇭🇺" },
        "Węgry": { price: 16.65, flag: "🇭🇺" },
        
        // Швеция
        "Sverige": { price: 22.35, flag: "🇸🇪" },
        "Sweden": { price: 22.35, flag: "🇸🇪" },
        "Szwecja": { price: 22.35, flag: "🇸🇪" },

        // Другие страны (по аналогии)
        "Finland": { price: 24.32, flag: "🇫🇮" },
        "Suomi": { price: 24.32, flag: "🇫🇮" },
        "Denmark": { price: 21.42, flag: "🇩🇰" },
        "Danmark": { price: 21.42, flag: "🇩🇰" },
        "Croatia": { price: 16.21, flag: "🇭🇷" },
        "Hrvatska": { price: 16.21, flag: "🇭🇷" }
    };

    const CONFIG = {
        exchangeRate: 25.0, // Твой курс
        botUsername: "YOUR_BOT_NAME" // ЗАМЕНИТЬ НА ИМЯ БОТА
    };

    // --- 2. ФУНКЦИЯ ПОИСКА ДАННЫХ ---
    function getVintedData() {
        try {
            // --- А. ИЩЕМ ЦЕНУ ---
            // Используем класс, который ты прислал: web_ui__Text__title
            let price = 0;
            // Ищем все элементы с этим классом
            const titleElements = document.querySelectorAll('.web_ui__Text__title');
            
            for (let el of titleElements) {
                // Проверяем, похоже ли содержимое на цену (есть цифры и валюта)
                if (el.innerText.match(/[0-9]/) && (el.innerText.includes('zł') || el.innerText.includes('€'))) {
                    // Чистим текст: "370,40 zł" -> 370.40
                    let clean = el.innerText.replace(/[^0-9,.]/g, '').replace(',', '.');
                    price = parseFloat(clean);
                    break; // Нашли цену - выходим
                }
            }
            
            // Запасной вариант (data-testid), если класс сменят
            if (price === 0) {
                const altPrice = document.querySelector('[data-testid$="item-price"]');
                if (altPrice) {
                    let clean = altPrice.innerText.replace(/[^0-9,.]/g, '').replace(',', '.');
                    price = parseFloat(clean);
                }
            }

            if (price === 0) return { error: "Не удалось найти цену" };


            // --- Б. ИЩЕМ СТРАНУ ---
            let foundCountryKey = null;
            let rawLocationText = "";

            // Стратегия: Перебираем все div-ы на странице.
            // Это надежнее всего, так как мы ищем именно ТЕКСТ страны.
            const allDivs = document.getElementsByTagName('div');

            // Собираем все ключи стран (Polska, Czech Republic...)
            const knownCountries = Object.keys(countryData);

            for (let div of allDivs) {
                // Оптимизация: пропускаем пустые или слишком длинные блоки
                if (!div.innerText || div.innerText.length > 50) continue;

                // Текст элемента (например "Tuszyma, Polska")
                let text = div.innerText.trim();

                // Проверяем каждую известную страну
                for (let countryName of knownCountries) {
                    // Если в тексте есть название страны (например "Polska")
                    if (text.includes(countryName)) {
                        
                        // ПРОВЕРКА ЗАПЯТОЙ (Твое условие)
                        // Если есть запятая, убеждаемся, что страна стоит ПОСЛЕ запятой
                        if (text.includes(',')) {
                            const parts = text.split(',');
                            const partAfterComma = parts[parts.length - 1].trim(); // Берем хвост
                            
                            // Если хвост совпадает с названием страны
                            if (partAfterComma === countryName) {
                                foundCountryKey = countryName;
                                rawLocationText = text;
                            }
                        } 
                        // Если запятой нет, но текст совпадает со страной (например просто "Polska")
                        else if (text === countryName) {
                            foundCountryKey = countryName;
                            rawLocationText = text;
                        }

                        if (foundCountryKey) break;
                    }
                }
                if (foundCountryKey) break;
            }

            if (!foundCountryKey) {
                return { error: "Не удалось определить страну доставки. Проверьте, указана ли она." };
            }

            const countryInfo = countryData[foundCountryKey];

            return {
                price: price,
                shipping: countryInfo.price,
                flag: countryInfo.flag,
                countryName: foundCountryKey,
                fullLocation: rawLocationText,
                img: document.querySelector('img')?.src || "" // Берем первую картинку
            };

        } catch (e) {
            console.error(e);
            return { error: "Ошибка скрипта: " + e.message };
        }
    }

    // --- 3. ЗАПУСК И ОТРИСОВКА ---
    const data = getVintedData();

    if (data.error) {
        alert("⚠️ " + data.error);
        return;
    }

    // Расчет
    const totalRUB = Math.ceil((data.price + data.shipping) * CONFIG.exchangeRate);

    // Удаляем старый виджет, если был
    const old = document.getElementById('vinted-calc-v2');
    if (old) old.remove();

    // Рисуем новый
    const widget = document.createElement('div');
    widget.id = 'vinted-calc-v2';
    widget.style = `
        position: fixed; top: 80px; right: 20px; width: 260px;
        background: linear-gradient(135deg, #007AFF, #0056b3);
        color: white; padding: 15px 20px; border-radius: 16px;
        z-index: 2147483647; box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        animation: fadeIn 0.3s ease;
    `;

    widget.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span style="font-size:12px; opacity:0.8; text-transform:uppercase; letter-spacing:1px;">Калькулятор</span>
            <span style="cursor:pointer;" onclick="this.parentElement.parentElement.remove()">✕</span>
        </div>
        
        <div style="margin-bottom:15px;">
            <div style="font-size:15px; margin-bottom:4px;">${data.flag} <b>${data.countryName}</b></div>
            <div style="font-size:12px; opacity:0.7;">Цена: ${data.price} zł + Доставка: ${data.shipping} zł</div>
        </div>

        <div style="font-size:32px; font-weight:700; margin-bottom:15px; letter-spacing:-0.5px;">
            ${totalRUB.toLocaleString()} ₽
        </div>

        <button id="v-btn-order" style="
            width:100%; padding:12px; border:none; border-radius:10px;
            background:white; color:#007AFF; font-weight:600; font-size:15px; cursor:pointer;
        ">
            Оформить заказ
        </button>
    `;

    document.body.appendChild(widget);

    // Клик по кнопке
    document.getElementById('v-btn-order').onclick = function() {
        const payload = {
            link: window.location.href,
            price: data.price,
            country: data.countryName,
            total: totalRUB
        };
        const msg = btoa(JSON.stringify(payload));
        window.open(`https://t.me/${CONFIG.botUsername}?start=${msg}`, '_blank');
    };

    // Стили анимации
    const style = document.createElement('style');
    style.innerHTML = `@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`;
    document.head.appendChild(style);

})();
