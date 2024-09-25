import { SMTPServer } from "smtp-server";

const server = new SMTPServer({
    onData(stream, session, callback) {
        let emailContent = '';

        stream.on('data', (chunk) => {
            emailContent += chunk.toString();
        });

        stream.on('end', () => {
            console.log('Received email:', emailContent);
            callback(null); // Erfolg
        });
    },
    onAuth(auth, session, callback) {
        // Optionale Authentifizierung, falls nötig
        callback(null, { user: 'user' });
    },
});

server.listen(25, () => {
    console.log('SMTP Server läuft auf Port 25');
});