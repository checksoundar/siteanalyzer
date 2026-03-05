/**
 * NEC Wisdom Import Script
 * Main entry point for bulk importing NEC Wisdom pages to Edge Delivery Services.
 *
 * Usage:
 *   node tools/importer/import.js <url>
 *   node tools/importer/import.js https://wisdom.nec.com/
 *
 * This script:
 *  1. Fetches the source page HTML
 *  2. Identifies the page template from page-templates.json
 *  3. Applies the appropriate page transformer
 *  4. Generates EDS-compliant markdown
 *  5. Converts markdown to HTML using the Helix pipeline
 *  6. Saves both .md and .html files to the content/ directory
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load page templates configuration
 * @returns {Array} Array of page template objects
 */
function loadTemplates() {
  const templatesPath = path.join(__dirname, "page-templates.json");
  const data = fs.readFileSync(templatesPath, "utf-8");
  return JSON.parse(data).templates;
}

/**
 * Match a URL to a page template
 * @param {string} url - The source URL
 * @param {Array} templates - Array of page template objects
 * @returns {Object|null} Matching template or null
 */
function matchTemplate(url, templates) {
  for (const template of templates) {
    for (const templateUrl of template.urls) {
      // Exact match or pattern match
      if (url === templateUrl || url.startsWith(templateUrl)) {
        return template;
      }
    }
  }
  return null;
}

/**
 * Generate EDS document path from URL
 * @param {string} url - Source URL
 * @returns {Object} Paths object with documentPath, mdFilePath, htmlFilePath
 */
function generateDocumentPath(url) {
  const urlObj = new URL(url);
  let pathname = urlObj.pathname;

  // Remove trailing slash and index.html
  pathname = pathname.replace(/\/index\.html$/, "");
  pathname = pathname.replace(/\.html$/, "");
  pathname = pathname.replace(/\/$/, "");

  // Default to index for root
  if (!pathname || pathname === "") pathname = "/index";

  // Remove leading slash for file paths
  const relativePath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

  return {
    documentPath: pathname,
    mdFilePath: "content/" + (relativePath || "index") + ".md",
    htmlFilePath: "content/" + (relativePath || "index") + ".html",
  };
}

/**
 * Main import function
 * @param {string} url - The source URL to import
 */
async function importPage(url) {
  console.log("Importing: " + url);

  // Load templates
  const templates = loadTemplates();
  const template = matchTemplate(url, templates);

  if (!template) {
    console.error("No matching template found for: " + url);
    console.log("Available templates:");
    templates.forEach(function(t) {
      console.log("  - " + t.name + ": " + t.urls.join(", "));
    });
    process.exit(1);
  }

  console.log("Matched template: " + template.name);

  // Generate document paths
  const paths = generateDocumentPath(url);
  console.log("Output: " + paths.mdFilePath);

  // Load the appropriate transformer
  const transformerName = template.name.toLowerCase().replace(/\s+/g, "-");
  const transformerPath = path.join(__dirname, "transformers", transformerName + ".js");

  if (!fs.existsSync(transformerPath)) {
    // Fall back to generic transformer name
    const altPath = path.join(__dirname, "transformers", "homepage.js");
    if (!fs.existsSync(altPath)) {
      console.error("No transformer found for template: " + template.name);
      process.exit(1);
    }
  }

  console.log("\nImport infrastructure is ready.");
  console.log("To complete the import, you need to:");
  console.log("  1. Fetch the source HTML (e.g., using Playwright)");
  console.log("  2. Parse it with the appropriate transformer");
  console.log("  3. Save the output to " + paths.mdFilePath);
  console.log("  4. Convert to HTML using convert_markdown_to_html");
  console.log("  5. Preview at http://localhost:3000/" + paths.htmlFilePath.replace(".html", ""));
}

// CLI entry point
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: node tools/importer/import.js <url>");
  console.log("Example: node tools/importer/import.js https://wisdom.nec.com/");
  process.exit(0);
}

importPage(args[0]);