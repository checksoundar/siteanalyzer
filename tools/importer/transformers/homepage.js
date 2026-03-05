/**
 * NEC Wisdom Homepage Page Transformer
 * Transforms source HTML from wisdom.nec.com into EDS-compliant markdown.
 * This transformer handles the specific structure of the NEC Wisdom homepage.
 */

import { parseHeroSlide, parseSpecialSlide, toMarkdown as carouselToMd } from "../parsers/carousel.js";
import { parseArticleCard, parseSeriesCard, parseSimpleCard, toMarkdown as cardsToMd } from "../parsers/cards.js";
import { parseColumns, toMarkdown as columnsToMd } from "../parsers/columns.js";

/**
 * Extract keywords list from the page
 * @param {Document} doc - The parsed document
 * @returns {string} Markdown list of keyword links
 */
function extractKeywords(doc) {
  var keywordLinks = doc.querySelectorAll(".wdm-top-keyword-list a, .wdm-keyword a");
  if (!keywordLinks.length) return "";
  var items = Array.from(keywordLinks).map(function(a) {
    return "- [" + a.textContent.trim() + "](" + a.href + ")";
  });
  return items.join("\n");
}

/**
 * Extract page metadata
 * @param {Document} doc - The parsed document
 * @returns {Object} Metadata key-value pairs
 */
function extractMetadata(doc) {
  var title = "";
  var titleEl = doc.querySelector("title");
  if (titleEl) title = titleEl.textContent.trim();

  var description = "";
  var descEl = doc.querySelector("meta[name=description]");
  if (descEl) description = descEl.getAttribute("content") || "";

  var ogImage = "";
  var ogEl = doc.querySelector("meta[property=\"og:image\"]");
  if (ogEl) ogImage = ogEl.getAttribute("content") || "";

  var lang = doc.documentElement.lang || "ja";

  return { title: title, description: description, "og:image": ogImage, lang: lang };
}

/**
 * Generate section metadata markdown
 * @param {string} style - Section style (e.g., "gray", "dark")
 * @returns {string} Section metadata markdown table
 */
function sectionMetadata(style) {
  return "| **Section Metadata** |  |\n|---|---|\n| style | " + style + " |";
}

/**
 * Generate page metadata markdown
 * @param {Object} meta - Metadata key-value pairs
 * @returns {string} Metadata markdown table
 */
function pageMetadata(meta) {
  var rows = Object.keys(meta).map(function(key) {
    return "| " + key + " | " + meta[key] + " |";
  });
  return "| **Metadata** |  |\n|---|---|\n" + rows.join("\n");
}

/**
 * Main transform function
 * @param {Document} doc - The parsed source document
 * @returns {string} Complete EDS-compliant markdown
 */
function transform(doc) {
  var sections = [];

  // Section 1: Hero Carousel
  var heroSlides = doc.querySelectorAll(".wdm-mv-swiper .swiper-slide");
  if (heroSlides.length) {
    var parsed = Array.from(heroSlides).map(parseHeroSlide);
    sections.push(carouselToMd(parsed, "hero"));
  }

  sections.push("---");

  // Section 2: New Articles + Keywords
  sections.push("## NEW ARTICLE 最新記事\n");
  var articleCards = doc.querySelectorAll(".wdm-top-newarticle-list .wdm-top-newarticle-item");
  if (articleCards.length) {
    var parsed2 = Array.from(articleCards).map(parseArticleCard);
    sections.push(cardsToMd(parsed2, "article"));
  }
  sections.push("\n## KEYWORDS キーワードから探す\n");
  sections.push(extractKeywords(doc));

  sections.push("\n---");

  // Section 3: Special Features (gray)
  sections.push("## SPECIAL 特集\n");
  var specialSlides = doc.querySelectorAll(".wdm-special-swiper .swiper-slide");
  if (specialSlides.length) {
    var parsed3 = Array.from(specialSlides).map(parseSpecialSlide);
    sections.push(carouselToMd(parsed3, "special"));
  }
  sections.push("\n" + sectionMetadata("gray"));

  sections.push("\n---");

  // Section 4: Series + Events + Glossary
  sections.push("## SERIES 連載\n");
  var seriesCards = doc.querySelectorAll(".wdm-top-series-list .wdm-top-series-item");
  if (seriesCards.length) {
    var parsed4 = Array.from(seriesCards).map(parseSeriesCard);
    sections.push(cardsToMd(parsed4, "series"));
  }
  sections.push("\n## EVENT イベント\n");
  var eventCards = doc.querySelectorAll(".wdm-top-event-list .wdm-top-event-item");
  if (eventCards.length) {
    var parsed5 = Array.from(eventCards).map(parseSimpleCard);
    sections.push(cardsToMd(parsed5, "simple"));
  }
  sections.push("\n## Glossary キーワード解説\n");
  var glossaryCards = doc.querySelectorAll(".wdm-top-glossary-list .wdm-top-glossary-item");
  if (glossaryCards.length) {
    var parsed6 = Array.from(glossaryCards).map(parseSimpleCard);
    sections.push(cardsToMd(parsed6, "simple"));
  }

  sections.push("\n---");

  // Section 5: About (dark)
  sections.push("## あなたのビジネス思考に、ひらめきを。\n");
  var aboutSection = doc.querySelector(".wdm-top-about");
  if (aboutSection) {
    var aboutData = parseColumns(aboutSection);
    sections.push(columnsToMd(aboutData));
  }
  sections.push("\n" + sectionMetadata("dark"));

  sections.push("\n---");

  // Section 6: Member Registration
  sections.push("## MEMBER 会員登録\n");
  sections.push("### wisdomの情報をもっと受け取る\n");
  var memberSection = doc.querySelector(".wdm-top-member");
  if (memberSection) {
    var memberData = parseColumns(memberSection);
    if (memberData.description) sections.push(memberData.description + "\n");
    sections.push(columnsToMd(memberData));
  }

  sections.push("\n---\n");

  // Page Metadata
  var meta = extractMetadata(doc);
  sections.push(pageMetadata(meta));

  return sections.join("\n");
}

export { transform, extractKeywords, extractMetadata, sectionMetadata, pageMetadata };
export default transform;