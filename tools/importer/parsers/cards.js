/**
 * Cards Block Parser
 * Extracts card-based content from NEC Wisdom pages.
 * Handles article cards, series cards, event cards, and glossary cards.
 */

/**
 * Parse an article card element (new articles section)
 * @param {HTMLElement} card - The card element
 * @returns {Object} Parsed card data
 */
function parseArticleCard(card) {
  const img = card.querySelector("img");
  const categoryLink = card.querySelector(".wdm-category a, .wdm-tag a");
  const titleLink = card.querySelector(".wdm-title a, h3 a, h2 a");
  const metaEl = card.querySelector(".wdm-meta, .wdm-date");

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
 * Parse a series card element
 * @param {HTMLElement} card - The card element
 * @returns {Object} Parsed card data with author info
 */
function parseSeriesCard(card) {
  const img = card.querySelector("img");
  const titleLink = card.querySelector(".wdm-title a, h3 a, a");
  const descEl = card.querySelector(".wdm-desc, .wdm-text, p");
  const dateEl = card.querySelector(".wdm-date, .wdm-update");

  return {
    image: img ? { src: img.src, alt: img.alt || "" } : null,
    title: titleLink ? { text: titleLink.textContent.trim(), url: titleLink.href } : null,
    description: descEl ? descEl.textContent.trim() : "",
    updateDate: dateEl ? dateEl.textContent.trim() : "",
  };
}

/**
 * Parse a simple card element (events, glossary)
 * @param {HTMLElement} card - The card element
 * @returns {Object} Parsed card data with image and title
 */
function parseSimpleCard(card) {
  const img = card.querySelector("img");
  const titleLink = card.querySelector("a");

  return {
    image: img ? { src: img.src, alt: img.alt || "" } : null,
    title: titleLink ? { text: titleLink.textContent.trim(), url: titleLink.href } : null,
  };
}

/**
 * Convert parsed cards data to EDS markdown table
 * @param {Array} cards - Array of parsed card objects
 * @param {string} type - "article", "series", or "simple"
 * @returns {string} Markdown table string
 */
function toMarkdown(cards, type) {
  type = type || "article";
  var rows = cards.map(function(c) {
    var imgMd = c.image ? "![" + c.image.alt + "](" + c.image.src + ")" : "";
    var contentMd = "";
    if (type === "article") {
      if (c.category) contentMd += "[" + c.category.text + "](" + c.category.url + ") ";
      if (c.title) contentMd += "**[" + c.title.text + "](" + c.title.url + ")**";
      if (c.date) contentMd += " " + c.date;
      if (c.readtime) contentMd += " ｜ " + c.readtime;
    } else if (type === "series") {
      if (c.title) contentMd += "**[" + c.title.text + "](" + c.title.url + ")**";
      if (c.description) contentMd += " " + c.description;
      if (c.updateDate) contentMd += " " + c.updateDate;
    } else {
      if (c.title) contentMd += "**[" + c.title.text + "](" + c.title.url + ")**";
    }
    return "| " + imgMd + " | " + contentMd + " |";
  });
  return "| **Cards** |  |\n|---|---|\n" + rows.join("\n");
}

export { parseArticleCard, parseSeriesCard, parseSimpleCard, toMarkdown };
export default { parseArticleCard, parseSeriesCard, parseSimpleCard, toMarkdown };