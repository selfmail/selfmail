**SMTP Server**

Our SMTP Server is written in typescript, with the library [smtp-server.js](https://www.npmjs.com/package/smtp-server). Our SMTP receives new connections, handles them and checking them for basic spam patterns. After that, we'll check the recipients mail, as well as the senders mail and eventually push the entire mail to our smtp-queue for further processing and to save the email in the database.

<sub>A drawing to show our SMTP Server is coming coon.</sub>