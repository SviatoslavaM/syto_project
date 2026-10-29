import menu from "./products.js";

const burger = document.querySelector(".burger");
const close = document.querySelector(".close");
const nav = document.querySelector(".nav");
const header = document.querySelector(".header");
const headerContainer = document.querySelector(".header__container");

burger?.addEventListener("click", () => {
  if (!nav || !close || !header || !headerContainer) return;
  nav.style.display = "block";
  burger.style.display = "none";
  close.style.display = "block";
  header.style.height = "100dvh";
  headerContainer.style.alignItems = "start";
});

close?.addEventListener("click", () => {
  if (!nav || !burger || !header || !headerContainer) return;
  nav.style.display = "none";
  burger.style.display = "block";
  close.style.display = "none";
  header.style.height = "auto";
  headerContainer.style.alignItems = "center";
});

const CART_KEY = "syto-cart";
const FALLBACK_IMAGE = "img/varenuk.jpg";
const cart = document.getElementById("cart");
const cartBtn = document.querySelector(".header__cart");
const closeCart = document.getElementById("closeCart");
const totalBox = document.querySelector(".cart-total span:last-child");
const checkoutBtn = document.querySelector(".checkout");
const continueBtn = document.querySelector(".continue");
const cartList = document.createElement("div");
const emptyMessage = document.createElement("p");
const cartBackdrop = document.createElement("div");
const orderForm = document.createElement("form");

cart?.setAttribute("role", "dialog");
cart?.setAttribute("aria-modal", "true");
cart?.setAttribute("aria-label", "Кошик");
cartList.className = "cart-list";
emptyMessage.className = "cart-empty";
emptyMessage.textContent = "Кошик порожній";
cartBackdrop.className = "cart-backdrop";
cartBackdrop.setAttribute("aria-hidden", "true");
orderForm.className = "order-form";
orderForm.hidden = true;
orderForm.noValidate = true;
orderForm.innerHTML = `
  <h2>Оформлення замовлення</h2>
  <div class="order-form__fields">
    <label>Ваше ім'я
      <input name="name" type="text" autocomplete="name" required>
    </label>
    <label>Номер телефону
      <input name="phone" type="tel" inputmode="tel" autocomplete="tel" value="+380" pattern="\\+380\\s\\d{2}\\s\\d{3}\\s\\d{2}\\s\\d{2}" title="Введіть номер у форматі +380 XX XXX XX XX" required>
    </label>
  </div>
  <fieldset class="order-form__options">
    <legend>Спосіб отримання</legend>
    <label><input type="radio" name="fulfillment" value="delivery" checked> Доставка</label>
    <label><input type="radio" name="fulfillment" value="pickup"> Самовивіз</label>
  </fieldset>
  <label class="order-form__delivery-field">Адреса доставки
    <input name="address" type="text" autocomplete="street-address" placeholder="Вулиця, будинок" required>
  </label>
  <label class="order-form__pickup-field" hidden>Адреса самовивозу
    <select name="pickup">
      <option value="Калуш, вул. Богдана Хмельницького, 62">Калуш, вул. Богдана Хмельницького, 62</option>
      <option value="Калуш, проспект Лесі Українки, 27">Калуш, проспект Лесі Українки, 27</option>
    </select>
  </label>
  <fieldset class="order-form__options">
    <legend>Оплата</legend>
    <label><input type="radio" name="payment" value="cash" checked> Готівка</label>
    <label><input type="radio" name="payment" value="card"> Картка</label>
  </fieldset>
  <label>Коментар до замовлення
    <textarea name="comment" rows="3" placeholder="За потреби залиште побажання до замовлення"></textarea>
  </label>
  <button class="order-form__submit" type="submit">Підтвердити замовлення</button>
  <p class="order-form__status" role="status" hidden></p>
`;

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((item) => item && item.id && item.name && Number(item.price) > 0) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // TODO: show a non-blocking notice when browser storage is unavailable.
  }
}

function formatPrice(value) {
  return `${Number(value) || 0} грн`;
}

function setCartOpen(isOpen) {
  cart?.classList.toggle("active", isOpen);
  cartBackdrop.classList.toggle("active", isOpen);
  document.body.classList.toggle("cart-is-open", isOpen);
}

function formatPhone(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("380")) digits = digits.slice(3);
  digits = digits.slice(0, 9);

  const groups = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ].filter(Boolean);

  return `+380${groups.length ? ` ${groups.join(" ")}` : ""}`;
}

function updateFulfillmentFields() {
  const isDelivery = orderForm.elements.fulfillment.value === "delivery";
  const deliveryField = orderForm.querySelector(".order-form__delivery-field");
  const pickupField = orderForm.querySelector(".order-form__pickup-field");
  const address = orderForm.elements.address;
  const pickup = orderForm.elements.pickup;

  deliveryField.hidden = !isDelivery;
  pickupField.hidden = isDelivery;
  address.required = isDelivery;
  pickup.required = !isDelivery;
}

function createCartItem(item) {
  const row = document.createElement("div");
  row.className = "cart-item";
  row.dataset.id = item.id;

  const image = document.createElement("img");
  image.src = item.image || FALLBACK_IMAGE;
  image.alt = item.name;
  image.onerror = () => { image.src = FALLBACK_IMAGE; };

  const info = document.createElement("div");
  info.className = "cart-info";
  const name = document.createElement("p");
  name.className = "varen";
  name.textContent = item.name;
  const quantity = document.createElement("div");
  quantity.className = "quantity";
  quantity.innerHTML = `<span>Кількість</span><button type="button" data-action="decrease" aria-label="Зменшити кількість">−</button><span>${item.count}</span><button type="button" data-action="increase" aria-label="Збільшити кількість">+</button>`;
  info.append(name, quantity);

  const price = document.createElement("div");
  price.className = "price";
  price.textContent = formatPrice(item.price * item.count);

  const remove = document.createElement("button");
  remove.className = "delete";
  remove.type = "button";
  remove.dataset.action = "remove";
  remove.setAttribute("aria-label", `Видалити ${item.name}`);
  remove.textContent = "Видалити";
  row.append(image, info, price, remove);
  return row;
}

function renderCart() {
  const items = readCart();
  cartList.replaceChildren(...items.map(createCartItem));
  emptyMessage.hidden = items.length > 0;
  const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.count), 0);
  if (totalBox) totalBox.textContent = formatPrice(total);
  checkoutBtn?.toggleAttribute("disabled", items.length === 0);
  if (!items.length) {
    orderForm.hidden = true;
    cart?.classList.remove("cart--checkout");
    if (checkoutBtn) checkoutBtn.hidden = false;
  }
}

function updateQuantity(id, change) {
  const items = readCart()
    .map((item) => item.id === id ? { ...item, count: Math.max(0, Number(item.count) + change) } : item)
    .filter((item) => item.count > 0);
  saveCart(items);
  renderCart();
}

function mountCart() {
  const template = cart?.querySelector(".cart-item");
  if (!template) return;
  template.replaceWith(cartList);
  cartList.after(emptyMessage);
  cart?.querySelector(".cart-total")?.before(orderForm);
  document.body.append(cartBackdrop);
  renderCart();
}

window.setCartItem = function setCartItem({ id, name, price, image, count = 1 }) {
  const productId = String(id || name || "").trim();
  const productPrice = Number(price);
  const productCount = Math.max(1, Number(count) || 1);
  if (!productId || !name || !productPrice) return;

  const items = readCart();
  const existing = items.find((item) => item.id === productId);
  if (existing) existing.count += productCount;
  else items.push({ id: productId, name, price: productPrice, image: image || FALLBACK_IMAGE, count: productCount });
  saveCart(items);
  renderCart();
  setCartOpen(true);
};

cartList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  const item = event.target.closest(".cart-item");
  if (!button || !item?.dataset.id) return;
  if (button.dataset.action === "increase") updateQuantity(item.dataset.id, 1);
  if (button.dataset.action === "decrease") updateQuantity(item.dataset.id, -1);
  if (button.dataset.action === "remove") {
    saveCart(readCart().filter((cartItem) => cartItem.id !== item.dataset.id));
    renderCart();
  }
});

cartBtn?.addEventListener("click", () => setCartOpen(true));
closeCart?.addEventListener("click", () => setCartOpen(false));
cartBackdrop.addEventListener("click", () => setCartOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cart?.classList.contains("active")) setCartOpen(false);
});
continueBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  setCartOpen(false);
});
checkoutBtn?.addEventListener("click", () => {
  if (!readCart().length) return;
  orderForm.hidden = false;
  cart?.classList.add("cart--checkout");
  checkoutBtn.hidden = true;
  orderForm.querySelector("input[name='name']")?.focus();
});

orderForm.elements.phone.addEventListener("input", (event) => {
  event.target.value = formatPhone(event.target.value);
});
orderForm.addEventListener("change", (event) => {
  if (event.target.name === "fulfillment") updateFulfillmentFields();
});
orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  updateFulfillmentFields();
  if (!orderForm.checkValidity()) {
    orderForm.reportValidity();
    return;
  }

  const status = orderForm.querySelector(".order-form__status");
  const name = orderForm.elements.name.value.trim();
  status.textContent = `Дякуємо, ${name}. Замовлення сформовано, ми зв'яжемося з вами за вказаним номером.`;
  status.hidden = false;
});

mountCart();

const productsById = new Map(menu.flatMap((category) => category.items).map((item) => [item.id, item]));

document.querySelectorAll(".Order-Now[data-product-id], .cart-btn[data-product-id]").forEach((button) => {
  button.addEventListener("click", () => {
    const item = productsById.get(button.dataset.productId);
    if (!item) return;

    window.setCartItem?.({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image?.replace(/^\.\.\//, "") || FALLBACK_IMAGE,
      count: 1,
    });
  });
});
