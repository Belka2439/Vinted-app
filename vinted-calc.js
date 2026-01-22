(function() {
    // --- 1. НАСТРОЙКИ ---
    const CONFIG = {
        exchangeRate: 25.0, 
        botUsername: "YOUR_BOT_NAME", // <-- Впишите имя бота
        defaultCountry: "Polska"       // Страна по умолчанию, если не нашли
    };

    // База данных стран
    const countryData = {
        "Polska": { price: 11.75, flag: "🇵🇱" },
        "Poland": { price: 11.75, flag: "🇵🇱" },
        "Česko": { price: 15.87, flag: "🇨🇿" },
        "Czech Republic": { price: 15.87, flag: "🇨🇿" },
        "Czechia": { price: 15.87, flag: "🇨🇿" },
        "Lietuva": { price: 14.29, flag: "🇱🇹" },
        "Lithuania": { price: 14.29, flag: "🇱🇹" },
        "România": { price: 17.91, flag: "🇷🇴" },
        "Romania": { price: 17.91, flag: "🇷🇴" },
        "Slovensko": { price: 15.14, flag: "🇸🇰" },
        "Slovakia": { price: 15.14, flag: "🇸🇰" },
        "Magyarország": { price: 16.65, flag: "🇭🇺" },
        "Hungary": { price: 16.65, flag: "🇭🇺" },
        "Sverige": { price: 22.35, flag: "🇸🇪" },
        "Sweden": { price: 22.35, flag: "🇸🇪" },
        "Suomi": { price: 24.32, flag: "🇫🇮" },
        "Finland": { price: 24.32, flag: "🇫🇮" },
        "Danmark": { price: 21.42, flag: "🇩🇰" },
        "Denmark": { price: 21.42, flag: "🇩🇰" },
        "Hrvatska": { price: 16.21, flag: "🇭🇷" },
        "Croatia": { price: 16.21, flag: "🇭🇷" },
        "Eesti": { price: 6.36, flag: "🇪🇪" },
        "Estonia": { price: 6.36, flag: "🇪🇪" },
        "Latvija": { price: 6.36, flag: "🇱🇻" },
        "Latvia": { price: 6.36, flag: "🇱🇻" }
    };

    // --- 2. ПОПЫТКА АВТО-ПОИСКА ---
    function tryFindData() {
        let foundPrice = 0;
        let foundCountry = null;

        try {
            // 1. Ищем цену (перебор всех возможных вариантов)
            const priceSelectors = [
                '[data-testid$="item-price"]',
                '.web_ui__Text__title', 
                'h1 ~ div',
                '.item-price'
            ];
            
            for (let sel of priceSelectors) {
                const els = document.querySelectorAll(sel);
                for (let el of els) {
                    if (el.innerText.match(/[0-9]/) && (el.innerText.includes('zł') || el.innerText.includes('€'))) {
                        let clean = el.innerText.replace(/[^0-9,.]/g, '').replace(',', '.');
                        foundPrice = parseFloat(clean);
                        if (foundPrice > 0) break;
                    }
                }
                if (foundPrice > 0) break;
            }

            // 2. Ищем страну (Сканируем весь текст страницы на совпадения)
            // Это "грубый", но эффективный метод
            const pageText = document.body.innerText;
            const knownCountries = Object.keys(countryData);
            
            // Ищем блоки, похожие на локацию (рядом со словом Lokalizacja или просто совпадение)
            // Приоритет отдаем тексту, где страна идет после запятой
            
            // Попытка найти конкретный div с запятой
            const divs = document.querySelectorAll('div');
            for (let div of divs) {
                if (div.innerText.includes(',') && div.children.length === 0) {
                    const parts = div.innerText.split(',');
                    const candidate = parts[parts.length - 1].trim();
                    if (countryData[candidate]) {
                        foundCountry = candidate;
                        break;
                    }
                }
            }

        } catch (e) {
            console.log("Auto-detection error:", e);
        }

        return { price: foundPrice, country: foundCountry };
    }

    // --- 3. ИНИЦИАЛИЗАЦИЯ ---
    const detected = tryFindData();
    
    // Если цену не нашли вообще - просим ввести, иначе берем найденную
    let currentPrice = detected.price || 0;
    
    // Если страну не нашли - ставим Польшу
    let currentCountryKey = detected.country || CONFIG.defaultCountry;
    
    function calculate(price, countryKey) {
        const shipping = countryData[countryKey].price;
        const total = Math.ceil((price + shipping) * CONFIG.exchangeRate);
        return { total, shipping, flag: countryData[countryKey].flag };
    }

    // --- 4. РИСУЕМ ВИДЖЕТ ---
    const old = document.getElementById('vinted-hybrid-widget');
    if (old) old.remove();

    const widget = document.createElement('div');
    widget.id = 'vinted-hybrid-widget';
    widget.style = `
        position: fixed; top: 80px; right: 20px; width: 280px;
        background: linear-gradient(135deg, #007AFF, #0056b3);
        color: white; padding: 20px; border-radius: 16px;
        z-index: 2147483647; box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        font-family: -apple-system, sans-serif;
    `;

    // Генерируем HTML для выпадающего списка
    let optionsHTML = "";
    // Сортируем страны по алфавиту для удобства
    const sortedKeys = Object.keys(countryData).sort();
    // Убираем дубликаты (Polska/Poland) для списка, оставляем уникальные
    const uniqueCountries = [...new Set(sortedKeys.map(k => countryData[k].flag + " " + k))];
    
    for (let key of sortedKeys) {
        const isSelected = (key === currentCountryKey) ? "selected" : "";
        optionsHTML += `<option value="${key}" ${isSelected} style="color:#000;">${countryData[key].flag} ${key}</option>`;
    }

    widget.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
            <span style="font-weight:700;">Калькулятор</span>
            <span style="cursor:pointer;" onclick="this.parentElement.parentElement.remove()">✕</span>
        </div>
        
        <div style="margin-bottom:10px;">
            <label style="font-size:12px; opacity:0.8;">Страна отправления:</label>
            <select id="v-country-select" style="
                width:100%; margin-top:5px; padding:8px; border-radius:8px; border:none;
                font-size:14px; color:#333;
            ">
                ${optionsHTML}
            </select>
        </div>

        <div style="margin-bottom:15px;">
             <label style="font-size:12px; opacity:0.8;">Цена товара (zl):</label>
             <input type="number" id="v-price-input" value="${currentPrice}" style="
                width:100%; margin-top:5px; padding:8px; border-radius:8px; border:none;
                font-size:14px; color:#333; font-weight:bold;
             ">
        </div>

        <div id="v-result-area" style="font-size:32px; font-weight:800; margin-bottom:15px; text-align:center;">
            0 ₽
        </div>

        <button id="v-btn-order" style="
            width:100%; padding:14px; border:none; border-radius:10px;
            background:white; color:#007AFF; font-weight:700; font-size:16px; cursor:pointer;
        ">
            Оформить заказ
        </button>
    `;

    document.body.appendChild(widget);

    // --- 5. ЛОГИКА ОБНОВЛЕНИЯ ---
    const selectEl = document.getElementById('v-country-select');
    const inputEl = document.getElementById('v-price-input');
    const resultEl = document.getElementById('v-result-area');

    function updateResult() {
        const p = parseFloat(inputEl.value);
        const c = selectEl.value;
        if (!p) {
            resultEl.innerText = "---";
            return;
        }
        const res = calculate(p, c);
        resultEl.innerText = res.total.toLocaleString() + " ₽";
        return res; // Возвращаем для кнопки
    }

    // Слушаем изменения
    selectEl.onchange = updateResult;
    inputEl.oninput = updateResult;

    // Сразу считаем при запуске
    updateResult();

    // Кнопка заказа
    document.getElementById('v-btn-order').onclick = function() {
        const res = updateResult();
        if (!res) return;
        
        const payload = {
            link: window.location.href,
            price: inputEl.value,
            country: selectEl.value,
            total: res.total
        };
        const msg = btoa(JSON.stringify(payload));
        window.open(`https://t.me/${CONFIG.botUsername}?start=${msg}`, '_blank');
    };

})();
