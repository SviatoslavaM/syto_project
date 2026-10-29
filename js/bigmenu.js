import menu from "./products.js";
const CATEGORY_CONFIG = [
  { name: 'Вареники', target: 'varenyki' },
  { name: 'Пельмені', target: 'pelmeni' },
  { name: 'Млинці', target: 'mly' },
  { name: 'Сирники', target: 'chee' },
  { name: 'Зрази', target: 'zr' },
  { name: 'Котлети', target: 'kot' },
  { name: 'Голубці, перець', target: 'ho' },
  { name: 'Кухня', target: 'kitchen' },
];
 
const normalizeText = (value) => value.toLocaleLowerCase('uk-UA').trim();

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatProductName(name) {
  const cleanedName = (name || '').trim();
  const upperName = cleanedName.toLocaleUpperCase('uk-UA');

  if (!cleanedName || cleanedName !== upperName) return cleanedName;

  const lowerName = cleanedName.toLocaleLowerCase('uk-UA');
  return `${lowerName.charAt(0).toLocaleUpperCase('uk-UA')}${lowerName.slice(1)}`;
}

function getImagePath(path) {
  return path ? path.replace(/^\.\.\//, '') : 'img/sito.png';
}

function getCategoryArticles() {
  return Array.from(document.querySelectorAll('.bigmenu article'));
}

/**
 * Повертає розмітку однієї картки товару.
 */
function createCard(item, categoryName) {
  if (!item.name) return '';
  const productName = formatProductName(item.name);
  const safeName = escapeHtml(productName);
  const safeDescription = escapeHtml(item.description || '');
  const safeCategory = escapeHtml(categoryName);

  return `
    <div class="kosyk" data-product-name="${safeName}" data-category="${safeCategory}">
      <div class="boxVaren">
        <img class="varen" src="${getImagePath(item.image)}" alt="${safeName}" loading="lazy"
             onerror="this.src='img/varenuk.jpg'">
        <div class="texty">
          <p>${safeName}</p>
          <p class="productPreview">${safeDescription}${item.weight ? ` · ${item.weight} г` : ''}</p>
          <div class="tev">
            <p class="grn">${item.price} грн</p>
            <a class="productDetails" href="product.html?id=${encodeURIComponent(item.id)}">Детальніше</a>
            <img class="shop"
                 src="img/shopping.png"
                 alt="Додати до кошика"
                 data-id="${item.id}"
                 data-name="${safeName}"
                 data-price="${item.price}"
                 data-image="${getImagePath(item.image)}">
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Головна функція — заповнює кожен <article> у .bigmenu картками товарів.
 */
function renderMenu() {
  const section = document.querySelector('.bigmenu');
  if (!section) {
    console.warn('menu-render.js: не знайдено .bigmenu');
    return;
  }

  menu.forEach((categoryObj) => {
    const target = CATEGORY_CONFIG.find((category) => category.name === categoryObj.category)?.target;
    const article = target ? document.getElementById(target) : null;
    if (!article) return;

    article.dataset.category = categoryObj.category;

    let grid = article.querySelector('.menuGrid');
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'menuGrid';
      article.appendChild(grid);
    }

    grid.innerHTML = categoryObj.items
      .map(item => createCard(item, categoryObj.category))
      .join('');
  });
}

function setupMenuSearch() {
  const input = document.querySelector('#menuSearch');
  const empty = document.querySelector('.menu__empty');
  const buttons = document.querySelectorAll('.menu__btn');
  const articles = getCategoryArticles();
  if (!input || !articles.length) return;

  const setActiveButton = (categoryName) => {
    buttons.forEach((button) => {
      const isActive = button.textContent.trim() === categoryName;
      button.classList.toggle('orMenu', isActive);
      button.classList.toggle('menuBtn', !isActive);
    });
  };

  const filterProducts = () => {
    const query = normalizeText(input.value);
    let visibleCount = 0;

    articles.forEach((article) => {
      let articleHasVisibleProducts = false;
      const cards = article.querySelectorAll('.kosyk');

      cards.forEach((card) => {
        const productName = normalizeText(card.dataset.productName || '');
        const categoryName = normalizeText(card.dataset.category || '');
        const isVisible = !query || productName.includes(query) || categoryName.startsWith(query);

        card.hidden = !isVisible;
        if (isVisible) {
          visibleCount += 1;
          articleHasVisibleProducts = true;
        }
      });

      article.hidden = !articleHasVisibleProducts;
    });

    if (empty) empty.hidden = visibleCount !== 0;
  };

  buttons.forEach((button) => {
    button.type = 'button';
    button.addEventListener('click', () => {
      input.value = '';
      filterProducts();
      setActiveButton(button.textContent.trim());
      const target = document.getElementById(button.dataset.target);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  input.addEventListener('input', () => {
    buttons.forEach((button) => {
      button.classList.remove('orMenu');
      button.classList.add('menuBtn');
    });
    filterProducts();
  });

  filterProducts();
}

function setupCartButtons() {
  const section = document.querySelector('.bigmenu');
  if (!section) return;

  section.addEventListener('click', (event) => {
    const shopButton = event.target.closest('.shop');
    if (!shopButton) return;

    event.preventDefault();
    event.stopPropagation();

    window.setCartItem?.({
      id: shopButton.dataset.id,
      name: shopButton.dataset.name,
      price: shopButton.dataset.price,
      image: shopButton.dataset.image,
      count: 1,
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    setupMenuSearch();
    setupCartButtons();
  });
} else {
  renderMenu();
  setupMenuSearch();
  setupCartButtons();
}

/**
 * menu-scroll.js
 * Підключіть на сторінці menu.html (після menu-render.js).
 * <script src="js/menu-scroll.js" defer></script>
 *
 * Також оновлює підсвічування активної кнопки навігації,
 * якщо вона є на menu.html.
 */

// Відповідність якоря → індекс категорії в масиві menu[]
const ANCHOR_TO_INDEX = {
  varenyki: 'varenyki',
  pelmeni: 'pelmeni',
  mly: 'mly',
  chee: 'chee',
  zr: 'zr',
  kot: 'kot',
  ho: 'ho',
  kitchen: 'kitchen',
};

function scrollToCategory() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;

  const targetId = ANCHOR_TO_INDEX[hash];
  if (!targetId) return;

  const target = document.getElementById(targetId);
  if (!target) return;

  // Невелика затримка — даємо час рендеру карток (menu-render.js)
  setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}

// Якщо є кнопки-фільтри на самій menu.html — підсвічуємо активну
function highlightActiveBtn() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;

  const buttons = document.querySelectorAll('.menu__btn');
  buttons.forEach(btn => {
    btn.classList.remove('orMenu');
    btn.classList.add('menuBtn');
  });

  // Знаходимо кнопку за відповідним якорем
  const activeText = CATEGORY_CONFIG.find((category) => category.target === hash)?.name;
  if (!activeText) return;

  buttons.forEach(btn => {
    if (btn.textContent.trim() === activeText) {
      btn.classList.remove('menuBtn', 'menuBtn2');
      btn.classList.add('orMenu');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  scrollToCategory();
  highlightActiveBtn();
});

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#menuContainer')) return;

  const buttons = document.querySelectorAll('.menu__btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const anchor = btn.dataset.target;

      if (anchor) {
        window.location.href = `menu.html#${anchor}`;
      } else {
        window.location.href = 'menu.html';
      }
    });
  });
});
