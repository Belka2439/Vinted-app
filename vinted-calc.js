(function() {
    // --- 1. НАСТРОЙКИ И ДАННЫЕ ---
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
        // Другие страны
        "Finland": { price: 24.32, flag: "🇫🇮" },
        "Suomi": { price: 24.32, flag: "🇫🇮" },
        "Denmark": { price: 21.42, flag: "🇩🇰" },
        "Danmark": { price: 21.42, flag: "🇩🇰" },
        "Croatia": { price: 16.21, flag: "🇭🇷" },
        "Hrvatska": { price: 16.21, flag: "🇭🇷" },
        "Estonia": { price: 6.36, flag: "🇪🇪" },
        "Eesti": { price: 6.36, flag: "🇪🇪" },
        "Latvia": { price: 6.36, flag: "🇱🇻" },
        "Latvija": { price: 6.36, flag: "🇱🇻" }
    };

    const CONFIG = {
        exchangeRate: 25.0, 
        botUsername: "YOUR_BOT_NAME" // !!! ВПИШИТЕ ИМЯ ВАШЕГО БОТА ЗДЕСЬ
    };

    // --- 2. ЛОГИКА ПОИСКА ---
    function getVintedData() {
        try {
            // А. ИЩЕМ ЦЕНУ (По заголовку или data-testid)
            let price = 0;
            const priceSelectors = [
                '.web_ui__Text__title', // Ваш класс
                '[data-testid$="item-price"]',
                'h1 ~ div', // Часто цена идет рядом с заголовком
            ];

            for (let sel of priceSelectors) {
                const els = document.querySelectorAll(sel);
                for (let el of els) {
                    if (el.innerText.match(/[0-9]/) && (el.innerText.includes('zł') || el.innerText.includes('€'))) {
                        let clean = el.innerText.replace(/[^0-9,.]/g, '').replace(',', '.');
                        price = parseFloat(clean);
                        if (price > 0) break;
                    }
                }
                if (price > 0) break;
            }
            if (price === 0) return { error: "Не удалось найти цену." };

            // Б. ИЩЕМ СТРАНУ ПО SVG ИКОНКЕ (САМЫЙ НАДЕЖНЫЙ СПОСОБ)
            let rawLocationText = "";
            
            // Уникальный "отпечаток" иконки локации (начало пути d="...")
            const locationIconPathStart = "M8 0a6.5 6.5 0 0 0-6.5 6.5"; 

            const allPaths = document.querySelectorAll('path');
            for (let path of allPaths) {
                // Если мы нашли путь, который начинается с кода иконки локации
                if (path.getAttribute('d') && path.getAttribute('d').startsWith(locationIconPathStart)) {
                    
                    // Начинаем подниматься вверх по дереву, чтобы найти общий контейнер
                    // Ищем ближайший родительский div с классом u-flexbox (как в вашем примере)
                    const container = path.closest('.u-flexbox');
                    
                    if (container) {
                        // В этом контейнере ищем текстовый блок.
                        // Обычно структура: Иконка -> Spacer -> Текст
                        // Берем текст всего контейнера
                        const text = container.innerText; 
                        
                        // Проверяем, похоже ли это на локацию (не пустое)
                        if (text && text.trim().length > 2) {
                            rawLocationText = text.trim();
                            break; // Нашли! Останавливаемся.
                        }
                    }
                }
            }

            if (!rawLocationText) {
                return { error: "Не удалось найти блок локации (иконка не найдена)." };
            }

            // В. ОБРАБОТКА ТЕКСТА (ВЫТАСКИВАЕМ СТРАНУ)
            // Пример: "Tuszyma, Polska" -> parts = ["Tuszyma", " Polska"]
            let countryName = "";
            
            if (rawLocationText.includes(',')) {
                const parts = rawLocationText.split(',');
                countryName = parts[parts.length - 1].trim(); // Берем последнее слово
            } else {
                countryName = rawLocationText.trim(); // Если запятой нет, берем всё слово
            }

            // Г. ПРОВЕРЯЕМ ПО БАЗЕ
            const countryInfo = countryData[countryName];
            
            if (!countryInfo) {
                return { error: `Страна "${countryName}" не найдена в списке доступных.` };
            }

            return {
                price: price,
                shipping: countryInfo.price,
                flag: countryInfo.flag,
                countryName: countryName,
                img: document.querySelector('img')?.src || ""
            };

        } catch (e) {
            console.error(e);
            return { error: "Ошибка: " + e.message };
        }
    }

    // --- 3. ЗАПУСК ---
    const data = getVintedData();

    if (data.error) {
        alert("⚠️ " + data.error);
        return;
    }

    // Расчет
    const totalRUB = Math.ceil((data.price + data.shipping) * CONFIG.exchangeRate);

    // Удаляем старый
    const old = document.getElementById('vinted-calc-v3');
    if (old) old.remove();

    // Рисуем новый
    const widget = document.createElement('div');
    widget.id = 'vinted-calc-v3';
    widget.style = `
        position: fixed; top: 80px; right: 20px; width: 280px;
        background: linear-gradient(135deg, #007AFF, #0056b3);
        color: white; padding: 20px; border-radius: 16px;
        z-index: 2147483647; box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        font-family: -apple-system, sans-serif;
    `;

    widget.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span style="font-size:12px; opacity:0.8;">КАЛЬКУЛЯТОР</span>
            <span style="cursor:pointer; font-weight:bold;" onclick="this.parentElement.parentElement.remove()">✕</span>
        </div>
        
        <div style="font-size:16px; margin-bottom:5px;">
            ${data.flag} <b>${data.countryName}</b>
        </div>
        <div style="font-size:13px; opacity:0.8; margin-bottom:15px;">
            Цена: ${data.price} zł + Доставка: ${data.shipping} zł
        </div>

        <div style="font-size:32px; font-weight:800; margin-bottom:15px;">
            ${totalRUB.toLocaleString()} ₽
        </div>

        <button id="v-btn-order" style="
            width:100%; padding:14px; border:none; border-radius:10px;
            background:white; color:#007AFF; font-weight:700; font-size:16px; cursor:pointer;
        ">
            Оформить заказ
        </button>
    `;

    document.body.appendChild(widget);

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

})();
