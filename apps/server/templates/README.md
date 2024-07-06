# Templates

You can create your own html based templates. These will be send, when a request goes wrong. Emails are not supporting every html or css feature. Please be carefully, when you plan to implement new features into your mails. A guide, which features you can use, can you find [here](https://caniemail.com).

Folder structure:
`templates/`<br> - `error.html` - a server error<br> - `email-recipient-not-found.html` - the recipient of the email is not found<br> - `rate-limited.html` - the request is rate limited (You can configure rate limiting in the config)<br>
