(() => {
  /** @type {Site} */
  const { site } = this;


  window.addEventListener("load", () => {
    site.log("window loaded");
    site.configureDebugMode();
  });

  window.addEventListener("unload", () => {
    site.log("window unloaded");
    document.getElementById(site.wrapper_id).style.visibility = "hidden";
  });

  document.addEventListener("DOMContentLoaded", () => {
    site.log("Rendered ", window.location.pathname);
    const siteWrapper = document.getElementById(site.wrapper_id);
    siteWrapper.style.visibility = "visible";
    if (site.redirect) {
      // TODO: add message with link in case the redirect didn't work
      console.info("Redirecting to ", site.redirect.toString());
      window.location.replace(site.redirect);
    }
  });
})();
