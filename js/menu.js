const categoryToggle = document.querySelector(".menu__category-toggle");
const categoryList = document.querySelector(".menu__category-list");

categoryToggle?.addEventListener("click", () => {
  const isOpen = categoryToggle.getAttribute("aria-expanded") === "true";
  categoryToggle.setAttribute("aria-expanded", String(!isOpen));
  categoryList?.classList.toggle("is-open", !isOpen);
});

categoryList?.addEventListener("click", (event) => {
  if (!event.target.closest(".menu__btn") || !categoryToggle) return;
  categoryToggle.setAttribute("aria-expanded", "false");
  categoryList.classList.remove("is-open");
});
