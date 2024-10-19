// url_to_markdown_common_filters.js

module.exports = {

	list: [
		{
			domain: /.*/,
			remove: [
				/\[¶\]\(#[^\s]+\s+"[^"]+"\)/g // Remove ¶ symbols with links
			],
			replace: [
				{
					find: /\[([^\]]*)\]\(\/\/([^\)]*)\)/g,
					replacement: '[$1](https://$2)' // Convert protocol-relative URLs to absolute
				}
			]
		},
		{
			domain: /.*\.wikipedia\.org/,
			remove: [
				/\*\*\[\^\]\(#cite_ref[^\)]+\)\*\*/g, // Remove citation links
				/(?:\\\[)?\[edit\]\([^\s]+\s+"[^"]+"\)(?:\\\])?/ig, // Remove [edit] links
				/\^\s\[Jump up to[^\)]*\)/ig, // Remove "Jump up to" links
				/\[[^\]]*\]\(#cite_ref[^\)]+\)/g, // Remove inline citation links
				/\[\!\[Edit this at Wikidata\].*/g // Remove "Edit this at Wikidata" links
			],
			replace: [
				{
					find: /\(https:\/\/upload.wikimedia.org\/wikipedia\/([^\/]+)\/thumb\/([^\)]+\..{3,4})\/[^\)]+\)/ig,
					replacement: '(https://upload.wikimedia.org/wikipedia/$1/$2)' // Fix Wikipedia image thumbnails
				},
				{
					find: /\n(.+)\n\-{32,}\n/ig,
					replacement: (match, title) => `\n${title}\n${'-'.repeat(title.length)}\n` // Adjust title formatting
				}
			]
		},
		{
			domain: /(?:.*\.)?medium\.com/,
			replace: [
				{
					find: '(https://miro.medium.com/max/60/',
					replacement: '(https://miro.medium.com/max/600/' // Replace small images with larger ones
				},
				{
					find: /\s*\[\s*!\[([^\]]+)\]\(([^\)]+)\)\s*\]\(([^\?\)]*)\?[^\)]*\)\s*/g,
					replacement: '\n![$1]($2)\n[$1]($3)\n\n' // Format linked images correctly
				}
			]
		},
		{
			domain: /(?:.*\.)?stackoverflow\.com/,
			remove: [
				/\* +Links(.|\r|\n)*Three +\|/g // Remove unnecessary "Links" sections
			]
		}
	],

	// Function to apply the appropriate filters based on the URL's domain
	filter: function (url, data, ignore_links = false) {
		let domain = '';
		let base_address = '';
		if (url) {
			const parsed_url = new URL(url);
			base_address = `${parsed_url.protocol}//${parsed_url.hostname}`;
			domain = parsed_url.hostname;
		}

		// Apply matching filters for the domain
		this.list.forEach(filterConfig => {
			if (domain.match(filterConfig.domain)) {
				// Apply removals
				filterConfig.remove?.forEach(pattern => {
					data = data.replaceAll(pattern, "");
				});

				// Apply replacements
				filterConfig.replace?.forEach(replacement => {
					data = data.replaceAll(replacement.find, replacement.replacement);
				});
			}
		});

		// Make relative URLs absolute
		data = data.replaceAll(/\[([^\]]*)\]\(\/([^\/][^\)]*)\)/g, (match, title, address) => {
			return `[${title}](${base_address}/${address})`;
		});

		// Optionally remove inline links and references
		if (ignore_links) {
			data = data.replaceAll(/\[\[?([^\]]+\]?)\]\([^\)]+\)/g, '$1');
			data = data.replaceAll(/[\\\[]+([0-9]+)[\\\]]+/g, '[$1]');
		}

		return data;
	}
}
