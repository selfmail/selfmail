# Templates

You can create your own html based templates. These will be send, when a request goes wrong.

Folder structure:

`templates/`
    - `error.html` - a server error
    - `email-recipient-not-found.html` - the recipient of the email is not found
    - `rate-limited.html` - the request is rate limited (You can configure rate limiting in the config)