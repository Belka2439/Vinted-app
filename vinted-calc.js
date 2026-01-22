function getVintedData() {
        try {
            // 1. Ищем цену
            const priceEl = document.querySelector('[data-testid$="item-price"]');
            if (!priceEl) return { error: "Цена не найдена" };
            const rawPrice = parseFloat(priceEl.innerText.replace(/[^0-9,.]/g, '').replace(',', '.'));

            // 2. Улучшенный поиск местоположения
            let locationText = "";
            
            // Пробуем разные варианты поиска (Vinted часто меняет их)
            const selectors = [
                '[data-testid$="item-location"]', 
                '.details-list__item-value--location',
                '.u-flex-align-items-center span',
                '.details-list__item--location div'
            ];

            for (let selector of selectors) {
                const el = document.querySelector(selector);
                if (el && el.innerText.includes(',')) {
                    locationText = el.innerText;
                    break;
                }
            }

            // Если селекторы не сработали, ищем по иконке локации (самый надежный способ)
            if (!locationText) {
                const allSpans = document.querySelectorAll('span');
                for (let span of allSpans) {
                    if (span.innerText.includes(',') && (span.innerText.includes('Polska') || span.innerText.includes('Czech'))) {
                        locationText = span.innerText;
                        break;
                    }
                }
            }

            if (!locationText) return { error: "Местоположение не найдено. Попробуйте обновить страницу." };
            
            // Берем название страны (последнее слово после запятой)
            const parts = locationText.split(',');
            const countryName = parts[parts.length - 1].trim();

            const countryInfo = countryData[countryName];
            
            if (!countryInfo) {
                return { error: "Заказ из этой страны пока не поддерживается: " + countryName };
            }

            return {
                price: rawPrice,
                shipping: countryInfo.price,
                flag: countryInfo.flag,
                country: countryName,
                img: document.querySelector('[data-testid$="item-photo"] img')?.src || ""
            };
        } catch (e) {
            return { error: "Произошла ошибка при чтении данных" };
        }
    }
