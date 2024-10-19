// url_to_markdown_formatters.js

const table_to_markdown = require('./html_table_to_markdown.js');
const htmlEntities = require('html-entities');

module.exports = {

	// Converts HTML tables into Markdown and replaces them in the document
	format_tables: function (html, replacements) {
		const start = replacements.length;
		const tables = html.match(/(<table[^>]*>(?:.|\n)*?<\/table>)/gi);

		if (tables) {
			tables.forEach((table, t) => {
				const markdown = table_to_markdown.convert(table); // Convert table to markdown
				const placeholder = `urltomarkdowntableplaceholder${t}${Math.random()}`;
				replacements[start + t] = { placeholder, replacement: markdown }; // Store the placeholder and replacement
				html = html.replace(table, `<p>${placeholder}</p>`); // Replace the table in HTML with a placeholder
			});
		}

		return html;
	},

	// Converts HTML code blocks into Markdown code blocks and replaces them in the document
	format_codeblocks: function (html, replacements) {
		const start = replacements.length;
		const codeblocks = html.match(/(<pre[^>]*>(?:.|\n)*?<\/pre>)/gi);

		if (codeblocks) {
			codeblocks.forEach((codeblock, c) => {
				let filtered = codeblock.replace(/<br[^>]*>/g, "\n") // Replace <br> tags with newlines
					.replace(/<p>/g, "\n") // Replace <p> tags with newlines
					.replace(/<\/?[^>]+(>|$)/g, ""); // Remove all HTML tags

				filtered = htmlEntities.decode(filtered); // Decode HTML entities
				const markdown = `\`\`\`\n${filtered}\n\`\`\`\n`; // Format as a Markdown code block
				const placeholder = `urltomarkdowncodeblockplaceholder${c}${Math.random()}`;
				replacements[start + c] = { placeholder, replacement: markdown }; // Store the placeholder and replacement
				html = html.replace(codeblock, `<p>${placeholder}</p>`); // Replace the code block in HTML with a placeholder
			});
		}

		return html;
	}
}
