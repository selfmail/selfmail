**Queue**

The queue works with [bullmq](https://bullmq.io/). After a new email is added to the `outbound queue`, we'll check for the Mail Server, cache the results and send an email to the mail server. If the endpoint in the mx record is failing, we'll try again with the endpoint in a lower record. If the recipients smtp server throw an error, the mail gets added to a queue and after some time tried again.

**Times**:
- 0: first try
- 10 min: second try, our mail could be block by the server for spam checks
- 2h: the server could try again to challenge us
- 8h: server is probably down
- 1 day: the server was probably down
- 3 days: another try, whether the server was down
- 5 days: last day, after that, we'll not try again to send an email