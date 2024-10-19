# Use a minimal Node.js image as the base
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and install production dependencies
COPY package.json ./
RUN npm install

# Copy the necessary source code files
COPY html_table_to_markdown.js ./
COPY url_to_markdown_apple_dev_docs.js ./
COPY url_to_markdown_common_filters.js ./
COPY url_to_markdown_formatters.js ./
COPY url_to_markdown_processor.js ./
COPY url_to_markdown_readers.js ./
COPY index.js ./

# Create a directory for storing markdown outputs
RUN mkdir -p /data/markdown-outputs

# Set the environment variable for the output directory
ENV OUTPUT_DIR=/data/markdown-outputs

# Copy the test files (optional)
RUN mkdir -p /usr/src/app/tests
COPY tests/url_to_markdown_apple_dev_docs.test.js ./tests
COPY tests/url_to_markdown_common_filters.test.js ./tests
COPY tests/url_to_markdown_formatters.test.js ./tests
COPY tests/url_to_markdown_processor.test.js ./tests
COPY tests/url_to_markdown_readers.test.js ./tests

# Run the tests (optional)
RUN npm test

# Set the default command to run the application, replace URL with any test URL
# This can be overridden when running the container
CMD ["node", "index.js", "https://www.example.com"]
