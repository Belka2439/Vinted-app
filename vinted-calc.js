function getVintedData() {
        try {
            // 1. Ищем цену (стандартный селектор)
            const priceEl = document.querySelector('[data-testid$="item-price"]');
            if (!priceEl) return { error: "Цена не найдена" };
            const rawPrice = parseFloat(priceEl.innerText.replace(/[^0-9,.]/g, '').replace(',', '.'));

            // 2. Ищем блок с локацией через SVG (иконку метки)
            let locationText = "";
            
            // Находим все SVG на странице
            const allSvgs = document.querySelectorAll('svg');
            for (let svg of allSvgs) {
                // Проверяем, что это иконка локации (в ней специфический путь d="M8 0a6.5...")
                if (svg.innerHTML.includes('M8 0a6.5')) {
                    // Находим родительский контейнер (u-flexbox) и берем последний div в нем
                    const container = svg.closest('.u-flexbox');
                    if (container) {
                        // Ищем div, в котором нет вложенных элементов (чистый текст локации)
                        const textDiv = container.querySelector('div:last-child');
                        if (textDiv && textDiv.innerText.includes(',')) {
                            locationText = textDiv.innerText;
                            break;
                        }
                    }
                }
            }

            // Запасной вариант, если через SVG не вышло
            if (!locationText) {
                const els = document.querySelectorAll('div, span');
                for (let el of els) {
                    if (el.children.length === 0 && el.innerText.includes(',') && 
                       (el.innerText.includes('Polska') || el.innerText.includes('Republic') || el.innerText.includes('România'))) {
                        locationText = el.innerText;
                        break;
                    }
                }
            }

            if (!locationText) return { error: "Местоположение не найдено" };
            
            // Вырезаем страну (все что после последней запятой)
            const parts = locationText.split(',');
            const countryName = parts[parts.length - 1].trim();

            const countryInfo = countryData[countryName];
            
            if (!countryInfo) {
                return { error: "Страна пока не поддерживается: " + countryName };
            }

            return {
                price: rawPrice,
                shipping: countryInfo.price,
                flag: countryInfo.flag,
                country: countryName,
                img: document.querySelector('[data-testid$="item-photo"] img')?.src || ""
            };
        } catch (e) {
            console.error(e);
            return { error: "Ошибка при чтении данных" };
        }
    }
