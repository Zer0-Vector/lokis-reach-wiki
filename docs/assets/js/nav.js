"use strict";
/**
 * @param {Element} element
 */
function describeElement(element) {
  if (element === null) {
    return "null";
  } else if (element === undefined) {
    return "undefined";
  }

  const classes = (e) => e.classList.length > 0 ? "." + e.classList.value.split(" ").join(".") : "";
  const parent = element.parentElement;
  const parentDescription = parent ? `${parent.tagName.toLocaleLowerCase()}${classes(parent)} >` : "";
  return `${parentDescription} ${element.tagName.toLocaleLowerCase()}${classes(element)}`;
}

(() => {
  const {site} = this;
  const selector = ".nav-item > .container:has(> a)";
  let count = 0;
  document
    .querySelectorAll(selector)
    .forEach((container) => {
      const link = container.querySelector("a");
      if (!link) {
        site.log("skipping ", container);
        return;
      }
      site.log("Configuring ", container, link);

      if (site.debug) {
        /**
         * @param {Event} e
         */
        const logger = (e) => {
          site.log("link event:", e);
          if (!Object.is(e.relatedTarget, link.parentElement)) {
            console.warn("Unexpected relatedTarget, not link parent:", describeElement(e.relatedTarget));
            return;
          }
          e.stopPropagation();
        };
        ["click"].forEach(evt => link.addEventListener(evt, logger));
      }

      const getHandler = (evt) => (e) => {
        site.log(e.target, evt, link);
        site.log("orig", e);
        const containerEvent = new MouseEvent(evt, { ...e,
          relatedTarget: container,
          cancelable: true,
        });
        link.dispatchEvent(containerEvent);
      };

      ["click"].forEach(evt => container.addEventListener(evt, getHandler(evt)));

      count++;
      site.log(`Configured mouse events for\n\t${describeElement(container)} a[href="${link.getAttribute("href")}]"]`);
    });
  site.log(`Configured link events: ${count} elements with '${selector}'`);
})();
