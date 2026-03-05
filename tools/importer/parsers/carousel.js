/**
 * Carousel Block Parser
 * Extracts carousel/slider content from NEC Wisdom pages.
 * Handles hero carousel (.wdm-mv-swiper) and special features carousel (.wdm-special-swiper).
 */

/**
 * Parse a hero carousel slide element
 * @param {HTMLElement} slide - The slide element
 * @returns {Object} Parsed slide data
 */
function parseHeroSlide(slide) {
  const img = slide.querySelector("img");
  const categoryLink = slide.querySelector(".wdm-mv-category a, .wdm-category a");
  const titleLink = slide.querySelector(".wdm-mv-title a, .wdm-title a, h3 a, h2 a");
  const metaEl = slide.querySelector(".wdm-mv-meta, .wdm-meta, .wdm-date");

  let date = "";
  let readtime = "";
  if (metaEl) {
    const metaText = metaEl.textContent.trim();
    const parts = metaText.split("｜").map((s) => s.trim());
    if (parts.length >= 1) date = parts[0];
    if (parts.length >= 2) readtime = parts[1];
  }

  return {
    image: img ? { src: img.src, alt: img.alt || "" } : null,
    category: categoryLink ? { text: categoryLink.textContent.trim(), url: categoryLink.href } : null,
    title: titleLink ? { text: titleLink.textContent.trim(), url: titleLink.href } : null,
    date,
    readtime,
  };
}

/**
 * Parse a special feature slide element
 * @param {HTMLElement} slide - The slide element
 * @returns {Object} Parsed slide data
 */
function parseSpecialSlide(slide) {
  const img = slide.querySelector("img");
  const titleLink = slide.querySelector(".wdm-special-title a, a");

  return {
    image: img ? { src: img.src, alt: img.alt || "" } : null,
    title: titleLink ? { text: titleLink.textContent.trim(), url: titleLink.href } : null,
  };
}

/**
 * Convert parsed carousel data to EDS markdown table rows
 * @param {Array} slides - Array of parsed slide objects
 * @param {string} type - "hero" or "special"
 * @returns {string} Markdown table string
 */
function toMarkdown(slides, type) {
  type = type || "hero";
  var rows = slides.map(function(s) {
    var imgMd = s.image ? "![" + s.image.alt + "](" + s.image.src + ")" : "";
    var contentMd = "";
    if (type === "hero") {
      if (s.category) contentMd += "[" + s.category.text + "](" + s.category.url + ") ";
      if (s.title) contentMd += "**[" + s.title.text + "](" + s.title.url + ")**";
      if (s.date) contentMd += " " + s.date;
      if (s.readtime) contentMd += " ｜ " + s.readtime;
    } else {
      if (s.title) contentMd += "**[" + s.title.text + "](" + s.title.url + ")**";
    }
    return "| " + imgMd + " | " + contentMd + " |";
  });
  return "| **Carousel** |  |\n|---|---|\n" + rows.join("\n");
}

export { parseHeroSlide, parseSpecialSlide, toMarkdown };
export default { parseHeroSlide, parseSpecialSlide, toMarkdown };