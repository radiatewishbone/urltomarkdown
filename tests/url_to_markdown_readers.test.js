const readers = require('../url_to_markdown_readers');

test('get html reader', () => {
    const reader = readers.reader_for_url("https://en.wikipedia.org");
    expect(reader).toBeInstanceOf(readers.HTMLReader);
});

test('get stack overflow reader', () => {
    const reader = readers.reader_for_url("https://stackoverflow.com/questions/0");
    expect(reader).toBeInstanceOf(readers.StackReader);
});

test('get apple dev docs reader', () => {
    const reader = readers.reader_for_url("https://developer.apple.com/documentation/swift/array");
    expect(reader).toBeInstanceOf(readers.AppleReader);
});
