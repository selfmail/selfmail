import { simpleParser } from 'mailparser';
import { SMTPServer } from 'smtp-server';

const server = new SMTPServer({
    onMailFrom(address, session, callback) {
        console.log(`Mail von: ${address.address}`);
        console.log(`Session ID: ${session.id}`);
        callback();
    },
    onRcptTo(address, session, callback) {
        console.log(`Empfänger: ${address.address}`);
        console.log(`Session ID: ${session.id}`);
        callback();
    },
    onAuth(auth, session, callback) {
        console.log(`Authentifizierungsversuch - Benutzername: ${auth.username}`);
        if (auth.password === "hello" && auth.username === "hello") {
            console.log('Authentifizierung erfolgreich.');
            callback(null, {
                user: "hello"
            });
        } else {
            console.log('Authentifizierung fehlgeschlagen.');
            callback(new Error('Unbekannter Benutzer oder falsches Passwort'));
        }
    },
    onData(stream, session, callback) {
        console.log(`Daten empfangen. Session ID: ${session.id}`);
        // Stelle sicher, dass der Stream lesbar ist
        if (stream.readable) {
            // Parse den Stream mit simpleParser
            simpleParser(stream, (err, parsed) => {
                if (err) {
                    console.error('Fehler beim Parsen:', err);
                } else {
                    console.log('Betreff:', parsed.subject);
                    console.log('Textinhalt:', parsed.text);
                    console.log('Von:', parsed.from?.text);
                    console.log('Datum:', parsed.date);
                }
            });
        } else {
            console.error('Stream ist nicht lesbar.');
        }
        callback();
    }
});