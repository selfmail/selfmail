**SMTP Queue**

A BullMQ based Queue to process Emails for the SMTP Sever. This Queue is for saving emails, checking them for spam with AI and filtering through attachments for possible hacking attacks. Due to the fact that BullMQ is based on Redis, we need to have a Redis database up running, for connecting to.

We are separating the source code into 3 Services, each one with an own helper class, and it's own queue filter system. This means, we'll have a cleaner code with less large files.

File structure:

`/src`:

- `/attachments`: Filter through the attachments for possible hacking attacks or spam
- `/save`: Save emails
- `/spam`: Filter through the email with AI and other techniques to filter for spam (we have basic checks already done in the SMTP Server)