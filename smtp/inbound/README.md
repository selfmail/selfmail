**Inbound SMTP Server**

The inbound SMTP Server is responsible for handling incoming emails. Client are connecting to our smtp server, via the port 25 and starting to communicate with the SMTP Protocol. We are using the libary [smtp-server](https://npmjs.com/smtp-server) for creating and managing our smtp server. We have different event handlers, for specific events:

**Events**
- `Connection`: A new connection from a client, we are checking, whether the client is on a spam list and if the client has configured his dns entries right.
- `mail-from`: A simple check if the client is allowed to use this address and if the client is blocked in our system
- `rcpt-to`: We are now checking, if the recipient exists, and if the client is blocked by the recipient.
- `data`: We are performing checks if the data is right, has any spam or viruses. If not, the email is going to be safed by the `inbound-queue`