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
                
                if (res) {
                    res.send(markdown);
                } else {
                    // Command-line output
                    console.log(markdown);
                }
            })
            .catch(() => {
                if (res) {
                    res.status(400).send(failure_message);
                } else {
                    // Command-line output for failure
                    console.error(failure_message);
                }
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

                    if (res) {
                        res.send(markdown);
                    } else {
                        console.log(markdown);
                    }
                } catch (error) {
                    if (res) {
                        res.status(400).send(failure_message);
                    } else {
                        console.error(failure_message);
                    }
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
                
                if (res) {
                    if (markdown_a.startsWith('Your Answer')) {
                        res.send(markdown_q);
                    } else {
                        res.send(`${markdown_q}\n\n## Answer\n${markdown_a}`);
                    }
                } else {
                    // Command-line output
                    if (markdown_a.startsWith('Your Answer')) {
                        console.log(markdown_q);
                    } else {
                        console.log(`${markdown_q}\n\n## Answer\n${markdown_a}`);
                    }
                }
            })
            .catch(() => {
                if (res) {
                    res.status(400).send(failure_message);
                } else {
                    console.error(failure_message);
                }
            });
    }
}

module.exports = {
    html_reader: HTMLReader,
    stack_reader: StackReader,
    apple_reader: AppleReader,
    reader_for_url: function (url) {
        if (url.startsWith("https://developer.apple.com")) {
            return new AppleReader();
        } else if (url.startsWith("https://stackoverflow.com")) {
            return new StackReader();
        } else {
            return new HTMLReader();
        }
    }
};
