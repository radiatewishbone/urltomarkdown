// url_to_markdown_readers.js

const apple_dev_parser = require('./url_to_markdown_apple_dev_docs.js');
const processor = require('./url_to_markdown_processor.js');
const { JSDOM } = require('jsdom');
const https = require('https');

const failure_message = "Sorry, could not fetch and convert that URL";

const apple_dev_prefix = "https://developer.apple.com";
const stackoverflow_prefix = "https://stackoverflow.com/questions";

class HTMLReader {
	read_url(url, res, inline_title, ignore_links) {
		JSDOM.fromURL(url)
			.then(document => {
				const markdown = processor.process_dom(url, document, res, inline_title, ignore_links);
				res.send(markdown);
			})
			.catch(() => {
				res.status(400).send(failure_message);
			});
	}
}

class AppleReader {
	read_url(url, res, inline_title, ignore_links) {
		const json_url = apple_dev_parser.dev_doc_url(url);
		https.get(json_url, apple_res => {
			let body = "";
			apple_res.on("data", chunk => {
				body += chunk;
			});
			apple_res.on("end", () => {
				try {
					const json = JSON.parse(body);
					const markdown = apple_dev_parser.parse_dev_doc_json(json, inline_title, ignore_links);
					res.send(markdown);
				} catch (error) {
					res.status(400).send(failure_message);
				}
			});
		});
	}
}

class StackReader {
	read_url(url, res, inline_title, ignore_links) {
		JSDOM.fromURL(url)
			.then(document => {
				const markdown_q = processor.process_dom(url, document, res, inline_title, ignore_links, 'question');
				const markdown_a = processor.process_dom(url, document, res, false, ignore_links, 'answers');
				
				// Only send the question if the answer section is not present or incomplete
				if (markdown_a.startsWith('Your Answer')) {
					res.send(markdown_q);
				} else {
					res.send(`${markdown_q}\n\n## Answer\n${markdown_a}`);
				}
			})
			.catch(() => {
				res.status(400).send(failure_message);
			});
	}
}

module.exports = {
	HTMLReader,
	AppleReader,
	StackReader,
	reader_for_url: function (url) {
		if (url.startsWith(apple_dev_prefix)) {
			return new AppleReader();
		} else if (url.startsWith(stackoverflow_prefix)) {
			return new StackReader();
		} else {
			return new HTMLReader();
		}
	},
	ignore_post: function (url) {
		return url && url.startsWith(stackoverflow_prefix);
	}
}
