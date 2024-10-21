(function() {
  console.log("Add listeners to .navitem elements")
  document.querySelectorAll(".navitem:has(a[href])").forEach(li => li.addEventListener('click', e => {
    console.log("Clicked link: ", e);
    li.querySelector("a").click();
  }));
})();
