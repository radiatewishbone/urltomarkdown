# Convert a Webpage to Markdown

This service downloads a requested web page and outputs a markdown version.

## Example GET Request with URL:

```bash
GET http://localhost:5006/?url=https%3A%2F%2Fwww.mozilla.org%2Fen-GB%2Ffirefox%2F
Response:
markdown
Copy code
Meet our family of products
---------------------------

*   [![](https://www.mozilla.org/media/protocol/img/logos/firefox/browser/logo.eb1324e44442.svg)  

	...

[Join Firefox](https://accounts.firefox.com/signup?entrypoint=mozilla.org-firefox_home&form_type=button&utm_source=mozilla.org-firefox_home&utm_medium=referral&utm_campaign=firefox-home&utm_content=secondary-join-firefox) [Learn more about joining Firefox](https://www.mozilla.org/en-GB/firefox/accounts/)
Optionally Request Inline Title:
bash
Copy code
GET http://localhost:5006/?url=https%3A%2F%2Fwww.mozilla.org%2Fen-GB%2Ffirefox%2F&title=true
Response:
markdown
Copy code
# Firefox - Protect your life online with privacy-first products — Mozilla (UK)
Meet our family of products
---------------------------
	...
The title is also returned in the HTTP header:

perl
Copy code
X-Title: Firefox%20-%20Protect%20your%20life%20online%20with%20privacy-first%20products%20%E2%80%94%20Mozilla%20(UK)
Optionally Suppress Links:
bash
Copy code
GET http://localhost:5006/?url=https%3A%2F%2Fwww.mozilla.org%2Fen-GB%2Ffirefox%2F&links=false
POST Request with URL and HTML in POST Body:
bash
Copy code
POST http://localhost:5006/?title=true&links=false
POST Body:

perl
Copy code
url=https%3A%2F%2Fwww.mozilla.org%2Fen-GB%2Ffirefox%2F
html=%3C!doctype%20html%3E%3Chtml%20...
See the API Documentation
Inspired by Heck Yeah Markdown

Also of Interest:
Bookmarklet
A bookmarklet for SimpleNote on iOS/iPadOS (based on simpleclip):

javascript
Copy code
javascript:(
	function()
	{
		var request=new XMLHttpRequest();
		var url="http://localhost:5006/?url="+encodeURIComponent(location.href);
		request.onreadystatechange=function() {
			if(request.readyState==4&&request.status==200) {
				let text = '# ' + decodeURIComponent(request.getResponseHeader('X-Title')) +  '\n' + request.responseText;
				location.href="simplenote://new?content="+encodeURIComponent(text);
			}
		};
		request.open("GET",url, true);
		request.send();
	}
)();
Safari Snippets
Using Safari Snippets to inject the following code solves the issue that some sites prevent JavaScript bookmarklets from accessing resources on a different domain:

javascript
Copy code
var request=new XMLHttpRequest();
var localurl="http://localhost:5006/";

request.onreadystatechange=function() {
	if(request.readyState==4&&request.status==200) {
		let text = '# ' + decodeURIComponent(request.getResponseHeader('X-Title')) +  '\n' + request.responseText;
		location.href="simplenote://new?content="+encodeURIComponent(text);
	}
};

request.open("POST", localurl, true);
request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
html=document.documentElement.innerHTML;
request.send("html="+encodeURIComponent(html)+"&url="+encodeURIComponent(window.location.href));
