class SiteUtils {
  /**
   * @param {string} words
   * @returns {string}
   */
  capitalize(words) {
    return `${words.charAt(0).toLocaleUpperCase()}${words.slice(1)}`;
  }

  // prettier-ignore
  static MINOR_WORDS = ["and", "as", "but", "for", "if", "nor", "or", "so", "yet", "a", "an", "the", "as", "at", "by", "for", "in", "of", "off", "on", "per", "to", "up", "via"];

  /**
   * @param {string} words
   * @param {string="-"} separator
   * @returns {string}
   */
  titleCase(words, separator = "-") {
    return words.split(separator).map((word, index) => {
      if (SiteUtils.MINOR_WORDS.includes(word) && index > 0) {
        return word;
      } else {
        return this.capitalize(word);
      }
    }).join(" ");
  }
}

// eslint-disable-next-line no-unused-vars
class Site {
  constructor(params) {
    const { project, redirects, wrapper_id } = params;
    this.debug = new URLSearchParams(window.location.search).has("debug");
    this.project = project || null;
    this.redirects = redirects || {};
    this.wrapper_id = wrapper_id;
    this.utils = new SiteUtils();
    if (this.debug) {
      this.log = (message, ...args) => console.debug(message, ...args);
    } else {
      // eslint-disable-next-line no-unused-vars
      this.log = (_message, ..._args) => {};
    }
  }

  get redirect() {
    const uri = this.redirects[window.location.pathname];
    if (uri) {
      return new URL(uri, document.baseURI);
    }
    return null;
  }

  #propagateDebugMode() {
    const myOrigin = new URL(document.baseURI).origin;
    let count = 0;
    const debugParam = "debug";
    document.querySelectorAll("body a").forEach((link) => {
      const href = link.getAttribute("href");
      const url = new URL(href, document.baseURI);
      if (url.origin !== myOrigin || url.searchParams.has(debugParam)) {
        return;
      }
      // console.debug(`a[href='${href}']`);
      const params = url.searchParams.size > 0 ? url.searchParams.values + "&" : "";
      link.setAttribute("href", `${href}?${params}${debugParam}`);
      console.debug(`Configured link for debug mode:\n\t${link.getAttribute("href")}`);
      count++;
    });
    console.info(`Configured debug propagation for ${count} links.`);
  }

  #outlineGrids() {
    const debugClass = "debug";
    const selector = "#" + this.wrapper_id;
    console.info(`adding .${debugClass} to ${selector}...`)
    document.querySelector(selector).classList.add(debugClass);
  }

  configureDebugMode() {
    if (!this.debug) {
      return;
    }
    console.log("Configuring debug mode...");
    this.#propagateDebugMode();
    this.#outlineGrids();
    console.warn("Debug mode configured.");
  }
}
