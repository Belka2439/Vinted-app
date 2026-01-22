(function() {
  const CONFIG = {
    exchangeRate: 25,
    botUsername: "YOUR_BOT_NAME",
    countryData: {
      "Polska": 11.75,
      "Poland": 11.75,
      "Czechy": 15.87,
      "Czech Republic": 15.87,
      "Česko": 15.87,
      "Lietuva": 14.29,
      "Lithuania": 14.29,
      "Litwa": 14.29,
      "Rumunia": 17.91,
      "Romania": 17.91,
      "România": 17.91,
      "Slovensko": 15.14,
      "Slovakia": 15.14,
      "Magyarország": 16.65,
      "Hungary": 16.65
    },
    countryFlags: {
      "Polska": "pl",
      "Poland": "pl",
      "Czechy": "cz",
      "Czech Republic": "cz",
      "Česko": "cz",
      "Lietuva": "lt",
      "Lithuania": "lt",
      "Litwa": "lt",
      "Rumunia": "ro",
      "Romania": "ro",
      "România": "ro",
      "Slovensko": "sk",
      "Slovakia": "sk",
      "Magyarország": "hu",
      "Hungary": "hu"
    }
  };

  // Если window.vintedPrice и window.vintedCountry установлены (из bookmarklet), используем их; иначе извлекаем из DOM
  let price, country;
  if (window.vintedPrice && window.vintedCountry) {
    price = parseFloat(window.vintedPrice.split(' ')[0]);
    country = window.vintedCountry;
  } else {
    let pEl = document.querySelector('.web_ui__Text__title.web_ui__Text__clickable') || document.querySelector('.web_ui__Text__title');
    price = pEl ? parseFloat(pEl.innerText.replace(/[^0-9,.]/g, '').replace(',', '.')) : 0;
    country = "Polska";
    const iconPath = "M8 0a6.5 6.5 0 0 0-6.5 6.5";
    let allPaths = document.querySelectorAll('path');
    for (let p of allPaths) {
      if (p.getAttribute('d') && p.getAttribute('d').startsWith(iconPath)) {
        let container = p.closest('.u-flexbox');
        if (container) {
          let rawText = container.innerText.trim();
          if (rawText.includes(',')) {
            country = rawText.split(',').pop().trim();
          } else {
            country = rawText;
            break;
          }
        }
      }
    }
  }

  let shipping = CONFIG.countryData[country] || 15;
  let totalRUB = Math.ceil((price + shipping) * CONFIG.exchangeRate);

  const old = document.getElementById('vinted-fast-ui');
  if (old) old.remove();

  const ui = document.createElement('div');
  ui.id = 'vinted-fast-ui';
  ui.style = "position:fixed;top:20px;right:20px;width:260px;background:#09b6bc;color:white;padding:20px;border-radius:12px;z-index:9999999;font-family:sans-serif;box-shadow:0 8px 25px rgba(0,0,0,0.3);";

  const flagCode = CONFIG.countryFlags[country] || 'pl'; // Default to PL
  const flagUrl = `https://flagcdn.com/32x24/${flagCode}.png`;

  ui.innerHTML = `
    <div style="font-size:12px;opacity:0.8;margin-bottom:5px;">
      ЛОКАЦИЯ: <img src="${flagUrl}" alt="${country} flag" style="vertical-align:middle; margin-right:5px; width:24px; height:18px;"> ${country}
    </div>
    <div style="font-size:32px;font-weight:bold;margin-bottom:10px;">${totalRUB.toLocaleString()} ₽</div>
    <div style="font-size:11px;opacity:0.8;margin-bottom:15px;">Товар: ${price} + Доставка: ${shipping} (zł)</div>
    <button id="v-order" style="width:100%;padding:10px;border:none;border-radius:6px;background:white;color:#09b6bc;font-weight:bold;cursor:pointer;">ЗАКАЗАТЬ</button>
    <div style="text-align:center;margin-top:10px;cursor:pointer;font-size:10px;" onclick="this.parentElement.remove()">закрыть</div>
  `;

  document.body.appendChild(ui);

  document.getElementById('v-order').onclick = function() {
    const info = btoa(`URL: ${window.location.href} | Total: ${totalRUB} RUB`);
    window.open(`https://t.me/${CONFIG.botUsername}?start=${info}`);
  };
})();
