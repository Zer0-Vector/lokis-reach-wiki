(function() {
  document.querySelectorAll(".side li:has(a[href]").forEach(li => li.addEventListener('click', e => {
    li.querySelector("a").click();
  }));
})();
