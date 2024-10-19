const htmlEntities = require('html-entities');
const justify = require('justify-text');

module.exports = {
	max_width: 96,

	// Clean function to strip HTML tags and decode entities
	clean: function (str) {
		str = str.replace(/<\/?[^>]+(>|$)/g, "");  // Remove HTML tags
		str = str.replace(/(\r\n|\n|\r)/gm, "");   // Remove line breaks
		return htmlEntities.decode(str);           // Decode HTML entities
	},

	// Convert HTML table to markdown
	convert: function (table) {
		let result = "\n";

		// Handle caption if present
		const caption = table.match(/<caption[^>]*>((?:.|\n)*)<\/caption>/i);
		if (caption) {
			result += this.clean(caption[1]) + "\n\n";
		}

		const items = [];
		const rows = table.match(/(<tr[^>]*>(?:.|\n)*?<\/tr>)/gi);

		// If no rows are found, return an empty string
		if (!rows || rows.length < 2) return "";

		// Process rows and columns
		const n_rows = rows.length;
		for (let r = 0; r < n_rows; r++) {
			const item_cols = [];
			const cols = rows[r].match(/<t[h|d][^>]*>(?:.|\n)*?<\/t[h|d]>/gi) || [];
			cols.forEach(col => item_cols.push(this.clean(col)));
			items.push(item_cols);
		}

		// Determine the maximum number of columns
		const n_cols = Math.max(...items.map(row => row.length));

		// Normalise columns by padding with empty strings where necessary
		items.forEach(row => {
			while (row.length < n_cols) row.push("");
		});

		// Calculate column widths
		const column_widths = Array(n_cols).fill(3);
		items.forEach(row => {
			row.forEach((col, c) => {
				const col_length = col.length;
				if (col_length > column_widths[c]) {
					column_widths[c] = col_length;
				}
			});
		});

		// Calculate the total table width
		const total_width = column_widths.reduce((sum, width) => sum + width, 0);

		// If total width is within max_width, render as a table
		if (total_width < this.max_width) {
			// Justify and pad cells
			items.forEach(row => {
				row.forEach((col, c) => {
					row[c] = justify.ljust(col, column_widths[c], " ");
				});
			});

			// Build the table header and separator
			if (n_rows > 0 && n_cols > 0) {
				if (n_rows > 1) {
					result += "|" + items[0].join("|") + "|\n";
				}
				result += "|" + column_widths.map(width => "-".repeat(width)).join("|") + "|\n";

				// Build table rows
				for (let r = 1; r < n_rows; r++) {
					result += "|" + items[r].join("|") + "|\n";
				}
			}
		} else {
			// Render as an indented list if the table is too wide
			for (let r = 1; r < n_rows; r++) {
				if (items[0][0] || items[r][0]) {
					result += "* " + (items[0][0] ? items[0][0] + ": " : "") + items[r][0] + "\n";
				}
				for (let c = 1; c < n_cols; c++) {
					if (items[0][c] || items[r][c]) {
						result += "  * " + (items[0][c] ? items[0][c] + ": " : "") + items[r][c] + "\n";
					}
				}
			}
		}

		return result;
	}
}
