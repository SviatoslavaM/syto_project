const accordions = document.querySelectorAll('.footer-accordion');

accordions.forEach(item => {
  item.addEventListener('click', () => {
    const isActive = item.classList.contains('active');

    accordions.forEach(acc => {
      acc.classList.remove('active');
    });

    if (!isActive) {
      item.classList.add('active');
    }
  });
});