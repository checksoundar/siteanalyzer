/**
 * Columns Block Parser
 * Extracts two-column layout content from NEC Wisdom pages.
 * Handles About section and Member Registration CTA.
 */

/**
 * Parse a columns section element
 * @param {HTMLElement} section - The section container element
 * @returns {Object} Parsed columns data
 */
function parseColumns(section) {
  const links = Array.from(section.querySelectorAll("a")).map(function(a) {
    return { text: a.textContent.trim(), url: a.href };
  });
  const img = section.querySelector("img");
  const heading = section.querySelector("h2, h3");
  const desc = section.querySelector("p");

  return {
    heading: heading ? heading.textContent.trim() : "",
    description: desc ? desc.textContent.trim() : "",
    links: links,
    image: img ? { src: img.src, alt: img.alt || "" } : null,
  };
}

/**
 * Convert parsed columns data to EDS markdown table
 * @param {Object} data - Parsed columns data
 * @returns {string} Markdown table string
 */
function toMarkdown(data) {
  var linksMd = data.links.map(function(l) {
    return "[" + l.text + "](" + l.url + ")";
  }).join(" ");
  var imgMd = data.image ? "![" + data.image.alt + "](" + data.image.src + ")" : "";
  return "| **Columns** |  |\n|---|---|\n| " + linksMd + " | " + imgMd + " |";
}

export { parseColumns, toMarkdown };
export default { parseColumns, toMarkdown };