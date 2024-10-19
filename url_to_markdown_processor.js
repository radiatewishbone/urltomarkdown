// url_to_markdown_processor.js

const formatter = require('./url_to_markdown_formatters.js');
const common_filters = require('./url_to_markdown_common_filters');
const { Readability } = require('@mozilla/readability');
const turndown = require('turndown');
const { JSDOM } = require('jsdom');
const service = new turndown();

module.exports = {

	// Process the DOM and convert it to markdown
	process_dom: function (url, document, res, inline_title, ignore_links, id = "") {
		let title = document.window.document.querySelector('title');
		if (title) {
			res.header("X-Title", encodeURIComponent(title.textContent)); // Send the page title in headers
		}

		// If a specific ID is provided, narrow the document scope to that section
		if (id) {		
			document = new JSDOM('<!DOCTYPE html>' + document.window.document.querySelector(`#${id}`).innerHTML);	
		}

		// Use Mozilla's Readability to parse the document
		let reader = new Readability(document.window.document);
		let readable = reader.parse().content;

		// Format tables and code blocks in the content
		let replacements = [];
		readable = formatter.format_codeblocks(readable, replacements);
		readable = formatter.format_tables(readable, replacements);

		// Convert HTML to markdown
		let markdown = service.turndown(readable);

		// Replace placeholders with the markdown content
		replacements.forEach(replacement => {
			markdown = markdown.replace(replacement.placeholder, replacement.replacement);
		});

		// Apply common filters based on the URL
		let result = url ? common_filters.filter(url, markdown, ignore_links) : markdown;

		// Optionally prepend the title to the markdown output
		if (inline_title && title) {
			result = `# ${title.textContent}\n${result}`;
		}

		return result;
	}
}
