module.exports = {
	
	dev_references: [],

	// Converts the developer URL to the corresponding JSON data URL
	dev_doc_url: function (url) {
		const queryless = url.split('?')[0].replace(/\/$/, ''); // Remove query params and trailing slash
		const parts = queryless.split("/");

		// Construct JSON URL for Apple Developer documentation
		return parts.length > 3 
			? `https://developer.apple.com/tutorials/data/${parts.slice(3).join("/")}.json`
			: null;
	},

	// Main function to parse Apple Developer doc JSON
	parse_dev_doc_json: function (json, inline_title = true, ignore_links = false) {
		let text = "";

		// Parse metadata title if available
		text += this.parse_metadata(json, inline_title);

		// Update references if present
		if (json.references) this.dev_references = json.references;

		// Process and parse sections
		text += this.process_sections(json.primaryContentSections || json.sections || [], ignore_links);

		return text;
	},

	// Parse the metadata title, if it exists
	parse_metadata: function (json, inline_title) {
		return (inline_title && json.metadata?.title) 
			? `# ${json.metadata.title}\n\n`
			: "";
	},

	// Process the document's sections, handling both content and declarations
	process_sections: function (sections, ignore_links) {
		let text = "";

		sections.forEach(section => {
			if (section.kind === 'declarations') {
				text += this.process_declarations(section);
			} else if (section.kind === 'content') {
				text += this.process_content_section(section, ignore_links);
			}

			// Process section titles
			if (section.title) {
				text += section.kind === 'hero' 
					? `# ${section.title}\n`
					: `## ${section.title}`;
			}

			// Add any additional text content in the section
			if (section.content) {
				section.content.forEach(content => {
					if (content.type === 'text') {
						text += `${content.text}\n`;
					}
				});
			}
		});
		return text;
	},

	// Process declarations within a section
	process_declarations: function (section) {
		let text = "";
		if (section.declarations) {
			section.declarations.forEach(declaration => {
				const tokens = declaration.tokens?.map(token => token.text).join('') || "";
				const languages = declaration.languages?.join(', ') || "";
				const platforms = declaration.platforms?.join(', ') || "";

				text += `${tokens} ${languages ? `\nLanguages: ${languages}` : ''} ${platforms ? `\nPlatforms: ${platforms}` : ''}\n\n`;
			});
		}
		return text;
	},

	// Process content sections and parse inline content
	process_content_section: function (section, ignore_links) {
		let text = "";

		section.content.forEach(content => {
			switch (content.type) {
				case 'paragraph':
					text += this.process_paragraph(content, ignore_links);
					break;
				case 'codeListing':
					text += this.process_code_listing(content);
					break;
				case 'unorderedList':
					text += this.process_unordered_list(content, ignore_links);
					break;
				case 'orderedList':
					text += this.process_ordered_list(content, ignore_links);
					break;
				case 'heading':
					text += `${"#".repeat(content.level)} ${content.text}\n\n`;
					break;
			}
		});

		return text;
	},

	// Process a paragraph content
	process_paragraph: function (content, ignore_links) {
		return content.inlineContent?.map(inline => this.process_inline_content(inline, ignore_links)).join('') + "\n\n";
	},

	// Process code listings
	process_code_listing: function (content) {
		return `\n\`\`\`\n${content.code.join("\n")}\n\`\`\`\n\n`;
	},

	// Process unordered lists
	process_unordered_list: function (content, ignore_links) {
		return content.items?.map(item => `* ${this.process_content_section(item, ignore_links)}`).join('') || "";
	},

	// Process ordered lists
	process_ordered_list: function (content, ignore_links) {
		return content.items?.map((item, i) => `${i + 1}. ${this.process_content_section(item, ignore_links)}`).join('') || "";
	},

	// Process inline content types
	process_inline_content: function (inline, ignore_links) {
		if (inline.type === "text") return inline.text;
		if (inline.type === "link") return ignore_links ? inline.title : `[${inline.title}](${inline.destination})`;
		if (inline.type === "reference" && this.dev_references[inline.identifier]) return this.dev_references[inline.identifier].title;
		if (inline.type === "codeVoice") return `\`${inline.code}\``;
		return "";
	}
}
