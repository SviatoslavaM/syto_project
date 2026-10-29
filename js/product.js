const productsSwiper = document.querySelector(".productsSwiper");

if (productsSwiper) new Swiper(productsSwiper, {
    slidesPerView: 1,
    spaceBetween: 20,

    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },

    breakpoints: {
        744: {
            slidesPerView: 2,
        },

        1280: {
            slidesPerView: 3,
        }
    }
});
