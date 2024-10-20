const apple_dev_parser = require('./url_to_markdown_apple_dev_docs.js');
const processor = require('./url_to_markdown_processor.js');
const { JSDOM } = require('jsdom');
const https = require('https');

class HTMLReader {
    read_url(url, res, inline_title, ignore_links) {
        JSDOM.fromURL(url)
            .then(document => {
                const markdown = processor.process_dom(url, document, res, inline_title, ignore_links);
                res.send(markdown);
            })
            .catch(() => {
                res.status(400).send("Sorry, could not fetch and convert that URL");
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
                    res.status(400).send("Sorry, could not fetch and convert that URL");
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
                
                if (markdown_a.startsWith('Your Answer')) {
                    res.send(markdown_q);
                } else {
                    res.send(`${markdown_q}\n\n## Answer\n${markdown_a}`);
                }
            })
            .catch(() => {
                res.status(400).send("Sorry, could not fetch and convert that URL");
            });
    }
}

// Function to determine the correct reader based on the URL
function reader_for_url(url) {
    if (url.startsWith("https://developer.apple.com")) {
        return new AppleReader();
    } else if (url.startsWith("https://stackoverflow.com")) {
        return new StackReader();
    } else {
        return new HTMLReader();
    }
}

module.exports = {
    HTMLReader,
    StackReader,
    AppleReader,
    reader_for_url
};
