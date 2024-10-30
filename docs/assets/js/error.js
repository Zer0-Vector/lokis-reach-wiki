"use strict";

(function ({ utils }) {
  window.addEventListener("DOMContentLoaded", () => {
    const path = ((p) => p.slice(p.indexOf("/")))(window.location.pathname.slice(1));
    const pathElements = path.slice(1).split("/");
    console.log("404 for", window.location.pathname);
    if (pathElements.length > 0) {
      // const dir = pathElements.length > 1 ? pathElements[0] + ": " : "";
      const titleParts = document.title.split(" | ");
      const title = utils.titleCase(pathElements.at(-1));
      titleParts[0] += " - " + title;
      // document.title = titleParts.join(" | ");
      const h1 = document.querySelector(".page h1.title");
      h1.classList.add("error");
      h1.innerHTML = `<em>${title}</em>`;
    } else {
      console.warn("Cannot parse location.pathname:", window.location.pathname);
    }
  });
})(this.site);
