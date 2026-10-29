/**
 * card-click.js
 * Підключіть на menu.html після menu-render.js
 * <script src="js/card-click.js" defer></script>
 *
 * Делегуємо клік на .bigmenu — спрацьовує на будь-яку картку,
 * навіть якщо вони ще не були в DOM на момент завантаження скрипта.
 */
 import menu from "./products.js";

document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.bigmenu');
  if (!section) return;
 
  section.addEventListener('click', (e) => {
    // Шукаємо найближчий .boxVaren від кліку
    const card = e.target.closest('.boxVaren');
    if (!card) return;
 
    // Якщо клікнули саме на іконку кошика — не переходимо на продукт
    if (e.target.classList.contains('shop')) return;
 
    // Беремо id з іконки кошика всередині картки
    const shopIcon = card.querySelector('.shop');
    const itemId = shopIcon?.dataset.id;
    if (!itemId) return;
 
    window.location.href = `product.html?id=${itemId}`;
  });
});

/**
 * product-render.js
 * Підключіть на product.html після products.js:
 *
 *   <script src="js/products.js"></script>
 *   <script src="js/product-render.js" defer></script>
 *
 * Читає ?id=xxx з URL, знаходить товар у масиві menu[]
 * і заповнює секцію .product даними.
 */

// ─── Знайти товар за id ──────────────────────────────────────────────────────
function getImagePath(path) {
  return path ? path.replace(/^\.\.\//, '') : 'img/sito.png';
}

function findItemById(id) {
  for (const category of menu) {
    const found = category.items.find(item => item.id === id);
    if (found) return { item: found, category: category.category };
  }
  return null;
}

// ─── Розбити назву: перше слово звичайне, решта — у <span class="span-h2"> ──
function formatTitle(name, category) {
  if (!name) return '';

  const cleanName = name.trim();
  const categoryTitle = (category || '').trim();
  const categoryUpper = categoryTitle.toLocaleUpperCase('uk-UA');
  const lowerName = cleanName.toLocaleLowerCase('uk-UA');
  const lowerCategory = categoryTitle.toLocaleLowerCase('uk-UA');
  const rest = lowerCategory && lowerName.startsWith(lowerCategory)
    ? cleanName.slice(categoryTitle.length).trim()
    : cleanName;

  if (!rest || rest.toLocaleLowerCase('uk-UA') === lowerCategory) {
    return categoryUpper || cleanName.toLocaleUpperCase('uk-UA');
  }

  return `${categoryUpper || cleanName.split(/\s+/)[0].toLocaleUpperCase('uk-UA')}<br><span class="span-h2">${rest.toLocaleUpperCase('uk-UA')}</span>`;
}

const CATEGORY_TARGETS = {
  'Вареники': 'varenyki',
  'Пельмені': 'pelmeni',
  'Млинці': 'mly',
  'Сирники': 'chee',
  'Зрази': 'zr',
  'Котлети': 'kot',
  'Голубці, перець': 'ho',
  'Кухня': 'kitchen',
};

function extractProductDetails(paragraph = '') {
  const text = paragraph.replace(/\s+/g, ' ').trim();
  const nutritionStart = text.search(/Поживна \(харчова\) цінність/i);
  const storageStart = text.search(/(?:Строк|Термін) придатності/i);
  const compositionEnd = nutritionStart >= 0 ? nutritionStart : storageStart >= 0 ? storageStart : text.length;
  const composition = text.slice(0, compositionEnd).replace(/^Склад:\s*/i, '').trim();
  const nutrition = nutritionStart >= 0
    ? text.slice(nutritionStart, storageStart >= 0 ? storageStart : text.length)
    : '';
  const storage = storageStart >= 0 ? text.slice(storageStart).trim() : '';
  const nutrients = [
    ['Білки', nutrition.match(/білки\s*[–—-]?\s*([\d,.]+\s*г)/i)?.[1]],
    ['Жири', nutrition.match(/жири\s*[–—-]?\s*([\d,.]+\s*г)/i)?.[1]],
    ['Вуглеводи', nutrition.match(/вуглеводи\s*[–—-]?\s*([\d,.]+\s*г)/i)?.[1]],
    ['Енергетична цінність', nutrition.match(/(\d+[\d,.]*\s*кДж\s*\([\d,.]+\s*ккал\))/i)?.[1]],
  ].filter(([, value]) => value);

  return { composition, nutrition: nutrients, storage };
}

function renderComposition(element, composition) {
  if (!element) return;
  element.replaceChildren();
  const allergenMatch = composition.match(/(Алергени\s*[–—-]?\s*[^.]+\.?)/i);
  const ingredients = composition.replace(/Алергени\s*[–—-]?\s*[^.]+\.?/i, '').trim();
  if (ingredients) element.append(document.createTextNode(ingredients));
  if (allergenMatch) {
    const allergen = document.createElement('strong');
    allergen.textContent = `${ingredients ? ' ' : ''}${allergenMatch[1]}`;
    element.append(allergen);
  }
}

function renderNutrition(rows) {
  const section = document.querySelector('#nutritionSection');
  const body = section?.querySelector('tbody');
  if (!section || !body) return;
  section.hidden = rows.length === 0;
  body.replaceChildren(...rows.map(([label, value]) => {
    const row = document.createElement('tr');
    const labelCell = document.createElement('th');
    const valueCell = document.createElement('td');
    labelCell.scope = 'row';
    labelCell.textContent = label;
    valueCell.textContent = value;
    row.append(labelCell, valueCell);
    return row;
  }));
}

function renderRelatedProducts(category, currentId) {
  const list = document.querySelector('.related-products__list');
  if (!list) return;
  const categoryItems = menu.find((entry) => entry.category === category)?.items || [];
  const related = categoryItems.filter((item) => item.id !== currentId && item.name).slice(0, 3);
  list.replaceChildren(...related.map((relatedItem) => {
    const link = document.createElement('a');
    link.className = 'related-products__card';
    link.href = `product.html?id=${encodeURIComponent(relatedItem.id)}`;
    const image = document.createElement('img');
    image.src = getImagePath(relatedItem.image);
    image.alt = relatedItem.name;
    image.onerror = () => { image.src = 'img/varenuk.jpg'; };
    const name = document.createElement('span');
    name.textContent = relatedItem.name;
    const price = document.createElement('strong');
    price.textContent = `${relatedItem.price} грн`;
    link.append(image, name, price);
    return link;
  }));
  list.closest('.related-products').hidden = related.length === 0;
}

// ─── Головний рендер ─────────────────────────────────────────────────────────
function renderProduct() {
  // 1. Читаємо id з URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showError('Товар не вказано.');
    return;
  }

  // 2. Шукаємо в масиві
  const result = findItemById(id);
  if (!result) {
    showError(`Товар з id «${id}» не знайдено.`);
    return;
  }

  const { item, category } = result;

  // 3. Заповнюємо зображення
  const img = document.querySelector('.img__varenuki');
  if (img) {
    img.src = getImagePath(item.image);
    img.alt = item.name;
    img.onerror = () => { img.src = 'img/varenuk.jpg'; };
  }

  // 4. Заголовок
  const h3 = document.querySelector('.h3-produkt');
  if (h3) h3.innerHTML = formatTitle(item.name, category);

  // 5. Короткий опис (під заголовком)
  const shortDesc = document.querySelector('.product-p');
  if (shortDesc) shortDesc.textContent = item.description || '';

  // 6. Ціна
  const price = document.querySelector('.produkt-price-Order-Now .price');
  if (price) price.textContent = `${item.price} грн`;

  // 7. Вага (якщо є місце — шукаємо .weight або додаємо поруч з ціною)
  const weightEl = document.querySelector('.weight');
  if (weightEl && item.weight) weightEl.textContent = `${item.weight} г`;

  const chipsWeight = document.querySelector('.product-chip.weight');
  if (chipsWeight) chipsWeight.textContent = `${item.weight} г`;
  const cookingTime = item.cooking?.match(/(\d+\s*[–-]\s*\d+\s*хв)/i)?.[1] || '5–7 хв';
  const cookingChip = document.querySelector('.product-chip.cooking-time');
  if (cookingChip) cookingChip.textContent = `⏱ ${cookingTime}`;

  const breadcrumbName = document.querySelector('.product__breadcrumb-name');
  if (breadcrumbName) breadcrumbName.textContent = item.name;
  const catLabel = document.querySelector('.product__category');
  if (catLabel) {
    catLabel.textContent = category;
    catLabel.href = `menu.html#${CATEGORY_TARGETS[category] || 'varenyki'}`;
  }

  // 8. Структуровані дані товару
  const descP = document.querySelector('.description-produck-p');
  const descriptionItem = descP?.closest('.product-accordion__item');
  const details = extractProductDetails(!/lorem ipsum/i.test(item.paragraph || '') ? item.paragraph : '');
  renderComposition(descP, details.composition);
  if (descriptionItem) descriptionItem.hidden = !details.composition;
  renderNutrition(details.nutrition);
  const storageSection = document.querySelector('#storageSection');
  const storageContent = document.querySelector('#productStorage');
  if (storageContent) storageContent.textContent = details.storage;
  if (storageSection) storageSection.hidden = !details.storage;

  // 9. Спосіб приготування
  const cookP = document.querySelector('.preparation-produck-p');
  if (cookP) cookP.textContent = item.cooking || '';

  // 10. Кнопка «Замовити» — передаємо дані для кошика
  const orderBtn = document.querySelector('.produkt-Order-Now');
  if (orderBtn) {
    orderBtn.dataset.id = item.id;
    orderBtn.dataset.name = item.name;
    orderBtn.dataset.price = item.price;
    orderBtn.dataset.image = getImagePath(item.image);
  }

  // 11. Оновлюємо <title> сторінки
  document.title = item.name || 'Продукт';

  renderRelatedProducts(category, item.id);
}

// ─── Помилка ─────────────────────────────────────────────────────────────────
function showError(msg) {
  const section = document.querySelector('.product');
  if (section) {
    section.innerHTML = `
      <div style="padding: 60px 40px; text-align: center;">
        <p style="font-size: 1.2rem; color: #888;">${msg}</p>
        <a href="menu.html" style="margin-top:20px; display:inline-block;
           color:#D4A373; font-weight:600; text-decoration:underline;">
          ← Повернутись до меню
        </a>
      </div>`;
  }
}

// ─── Лічильник кількості ─────────────────────────────────────────────────────
function initCounter() {
  const valueEl = document.querySelector('.mx-counter-value');
  const minusBtn = document.querySelector('.mx-counter-minus');
  const plusBtn  = document.querySelector('.mx-counter-plus');

  if (!valueEl || !minusBtn || !plusBtn) return;

  let count = 1;

  minusBtn.addEventListener('click', () => {
    if (count > 1) {
      count--;
      valueEl.textContent = count;
    }
  });

  plusBtn.addEventListener('click', () => {
    count++;
    valueEl.textContent = count;
  });
}

function initProductOrder() {
  const orderBtn = document.querySelector('.produkt-Order-Now');
  const valueEl = document.querySelector('.mx-counter-value');
  const cart = document.getElementById('cart');

  if (!orderBtn) return;

  orderBtn.addEventListener('click', () => {
    const quantity = Number(valueEl?.textContent || 1);
    const price = Number(orderBtn.dataset.price || 0);
    if (window.setCartItem) {
      window.setCartItem({
        id: orderBtn.dataset.id,
        name: orderBtn.dataset.name,
        price,
        image: orderBtn.dataset.image || 'img/sito.png',
        count: quantity,
      });
    }

    cart?.classList.add('active');
  });
}

function initProductAccordion() {
  const triggers = document.querySelectorAll('.product-accordion__trigger');

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.product-accordion__item');
      const contentId = trigger.getAttribute('aria-controls');
      const content = contentId ? document.getElementById(contentId) : null;
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      trigger.setAttribute('aria-expanded', String(!isOpen));
      item?.classList.toggle('is-open', !isOpen);
      if (content) content.hidden = isOpen;
    });
  });
}

// ─── Запуск ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderProduct();
  initCounter();
  initProductOrder();
  initProductAccordion();
});
