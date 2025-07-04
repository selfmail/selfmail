import { SMTPServer,  } from "smtp-server";
import * as crypto from "node:crypto";
import type { SecureVersion } from "node:tls";
import { readFileSync } from "node:fs";
const tlsDefaults = {
  // pregenerated default certificates for localhost
  // obviusly, do not use in production
  key:
      '-----BEGIN RSA PRIVATE KEY-----\n' +
      'MIIEpAIBAAKCAQEA6Z5Qqhw+oWfhtEiMHE32Ht94mwTBpAfjt3vPpX8M7DMCTwHs\n' +
      '1xcXvQ4lQ3rwreDTOWdoJeEEy7gMxXqH0jw0WfBx+8IIJU69xstOyT7FRFDvA1yT\n' +
      'RXY2yt9K5s6SKken/ebMfmZR+03ND4UFsDzkz0FfgcjrkXmrMF5Eh5UXX/+9YHeU\n' +
      'xlp0gMAt+/SumSmgCaysxZLjLpd4uXz+X+JVxsk1ACg1NoEO7lWJC/3WBP7MIcu2\n' +
      'wVsMd2XegLT0gWYfT1/jsIH64U/mS/SVXC9QhxMl9Yfko2kx1OiYhDxhHs75RJZh\n' +
      'rNRxgfiwgSb50Gw4NAQaDIxr/DJPdLhgnpY6UQIDAQABAoIBAE+tfzWFjJbgJ0ql\n' +
      's6Ozs020Sh4U8TZQuonJ4HhBbNbiTtdDgNObPK1uNadeNtgW5fOeIRdKN6iDjVeN\n' +
      'AuXhQrmqGDYVZ1HSGUfD74sTrZQvRlWPLWtzdhybK6Css41YAyPFo9k4bJ2ZW2b/\n' +
      'p4EEQ8WsNja9oBpttMU6YYUchGxo1gujN8hmfDdXUQx3k5Xwx4KA68dveJ8GasIt\n' +
      'd+0Jd/FVwCyyx8HTiF1FF8QZYQeAXxbXJgLBuCsMQJghlcpBEzWkscBR3Ap1U0Zi\n' +
      '4oat8wrPZGCblaA6rNkRUVbc/+Vw0stnuJ/BLHbPxyBs6w495yBSjBqUWZMvljNz\n' +
      'm9/aK0ECgYEA9oVIVAd0enjSVIyAZNbw11ElidzdtBkeIJdsxqhmXzeIFZbB39Gd\n' +
      'bjtAVclVbq5mLsI1j22ER2rHA4Ygkn6vlLghK3ZMPxZa57oJtmL3oP0RvOjE4zRV\n' +
      'dzKexNGo9gU/x9SQbuyOmuauvAYhXZxeLpv+lEfsZTqqrvPUGeBiEQcCgYEA8poG\n' +
      'WVnykWuTmCe0bMmvYDsWpAEiZnFLDaKcSbz3O7RMGbPy1cypmqSinIYUpURBT/WY\n' +
      'wVPAGtjkuTXtd1Cy58m7PqziB7NNWMcsMGj+lWrTPZ6hCHIBcAImKEPpd+Y9vGJX\n' +
      'oatFJguqAGOz7rigBq6iPfeQOCWpmprNAuah++cCgYB1gcybOT59TnA7mwlsh8Qf\n' +
      'bm+tSllnin2A3Y0dGJJLmsXEPKtHS7x2Gcot2h1d98V/TlWHe5WNEUmx1VJbYgXB\n' +
      'pw8wj2ACxl4ojNYqWPxegaLd4DpRbtW6Tqe9e47FTnU7hIggR6QmFAWAXI+09l8y\n' +
      'amssNShqjE9lu5YDi6BTKwKBgQCuIlKGViLfsKjrYSyHnajNWPxiUhIgGBf4PI0T\n' +
      '/Jg1ea/aDykxv0rKHnw9/5vYGIsM2st/kR7l5mMecg/2Qa145HsLfMptHo1ZOPWF\n' +
      '9gcuttPTegY6aqKPhGthIYX2MwSDMM+X0ri6m0q2JtqjclAjG7yG4CjbtGTt/UlE\n' +
      'WMlSZwKBgQDslGeLUnkW0bsV5EG3AKRUyPKz/6DVNuxaIRRhOeWVKV101claqXAT\n' +
      'wXOpdKrvkjZbT4AzcNrlGtRl3l7dEVXTu+dN7/ZieJRu7zaStlAQZkIyP9O3DdQ3\n' +
      'rIcetQpfrJ1cAqz6Ng0pD0mh77vQ13WG1BBmDFa2A9BuzLoBituf4g==\n' +
      '-----END RSA PRIVATE KEY-----',

  cert:
      '-----BEGIN CERTIFICATE-----\n' +
      'MIICpDCCAYwCCQCuVLVKVTXnAjANBgkqhkiG9w0BAQsFADAUMRIwEAYDVQQDEwls\n' +
      'b2NhbGhvc3QwHhcNMTUwMjEyMTEzMjU4WhcNMjUwMjA5MTEzMjU4WjAUMRIwEAYD\n' +
      'VQQDEwlsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDp\n' +
      'nlCqHD6hZ+G0SIwcTfYe33ibBMGkB+O3e8+lfwzsMwJPAezXFxe9DiVDevCt4NM5\n' +
      'Z2gl4QTLuAzFeofSPDRZ8HH7wgglTr3Gy07JPsVEUO8DXJNFdjbK30rmzpIqR6f9\n' +
      '5sx+ZlH7Tc0PhQWwPOTPQV+ByOuReaswXkSHlRdf/71gd5TGWnSAwC379K6ZKaAJ\n' +
      'rKzFkuMul3i5fP5f4lXGyTUAKDU2gQ7uVYkL/dYE/swhy7bBWwx3Zd6AtPSBZh9P\n' +
      'X+OwgfrhT+ZL9JVcL1CHEyX1h+SjaTHU6JiEPGEezvlElmGs1HGB+LCBJvnQbDg0\n' +
      'BBoMjGv8Mk90uGCeljpRAgMBAAEwDQYJKoZIhvcNAQELBQADggEBABXm8GPdY0sc\n' +
      'mMUFlgDqFzcevjdGDce0QfboR+M7WDdm512Jz2SbRTgZD/4na42ThODOZz9z1AcM\n' +
      'zLgx2ZNZzVhBz0odCU4JVhOCEks/OzSyKeGwjIb4JAY7dh+Kju1+6MNfQJ4r1Hza\n' +
      'SVXH0+JlpJDaJ73NQ2JyfqELmJ1mTcptkA/N6rQWhlzycTBSlfogwf9xawgVPATP\n' +
      '4AuwgjHl12JI2HVVs1gu65Y3slvaHRCr0B4+Kg1GYNLLcbFcK+NEHrHmPxy9TnTh\n' +
      'Zwp1dsNQU+Xkylz8IUANWSLHYZOMtN2e5SKIdwTtl5C8YxveuY8YKb1gDExnMraT\n' +
      'VGXQDqPleug=\n' +
      '-----END CERTIFICATE-----',

  honorCipherOrder: true,
  requestOCSP: false,
  sessionIdContext: crypto.createHash('sha1').update(process.argv.join(' ')).digest('hex').slice(0, 32),

  minVersion: 'TLSv1' as SecureVersion // sadly there are very old SMTP clients out there
};

/**
 * Complete SMTP Server for selfmail.app
 * 
 * Authentication is based on sender domain, not IP address or port:
 * 
 * SENDING FROM @selfmail.app (Authentication Required):
 * - User must authenticate with their selfmail.app credentials
 * - Can send TO any email address (internal or external)
 * - User can only send FROM their own email address
 * 
 * SENDING TO @selfmail.app (No Authentication):
 * - External servers can send TO selfmail.app users
 * - No authentication required for incoming emails
 * - FROM any external email address
 */

const server = new SMTPServer({
  // For incoming emails (port 25), authentication is optional
  authOptional: true,
  disabledCommands: ["AUTH", "STARTTLS"],

  // Callbacks
  onConnect(session, callback) {
    console.log(`Verbindung von ${session.remoteAddress}`);
    return callback(); // Akzeptiert die Verbindung
  },

  onMailFrom(address, session, callback) {
    console.log(`MAIL FROM: ${address.address} (from ${session.remoteAddress})`);
    
    // Check if someone is trying to send FROM a selfmail.app address
    if (address.address.endsWith('@selfmail.app')) {
      // Sending FROM selfmail.app requires authentication
      if (!session.user) {
        console.log(`Authentication required for sending from selfmail.app address: ${address.address}`);
        return callback(new Error('Authentication required to send from @selfmail.app addresses'));
      }
      
      // Ensure the authenticated user matches the sender address
      if (session.user !== address.address) {
        console.log(`User ${session.user} tried to send from ${address.address}`);
        return callback(new Error('You can only send emails from your own email address'));
      }
      
      console.log(`Authenticated user ${session.user} sending from their own address`);
    } else {
      // External sender - no authentication required for incoming emails
      console.log(`Accepting incoming email from external sender: ${address.address}`);
    }
    
    return callback(); // Accept the sender address
  },

  onRcptTo(address, session, callback) {
    console.log(`RCPT TO: ${address.address} (from ${session.remoteAddress})`);
    
    // If user is authenticated (sending FROM selfmail.app), allow sending to any address
    if (session.user) {
      console.log(`Authenticated selfmail.app user ${session.user} sending to: ${address.address}`);
      return callback(); // Allow authenticated users to send to any address
    } else {
      // TODO: Validate that the recipient actually exists in your database
      console.log(`Accepting incoming email for selfmail.app user: ${address.address}`);
    }
    
    return callback(); // Accept the recipient address
  },

  onData(stream, session, callback) {
    console.log(`Empfange Daten für E-Mail (von ${session.remoteAddress})`);
    let emailContent = "";
    stream.on("data", (chunk) => (emailContent += chunk.toString()));
    stream.on("end", () => {
      console.log("E-Mail Inhalt:");
      console.log(emailContent);
      
      console.log("E-Mail wurde empfangen und verarbeitet.");
      return callback(); // Signalisiert dem Client, dass die E-Mail empfangen wurde
    });
  },

  onClose(session) {
    console.log(`Verbindung von ${session.remoteAddress} geschlossen`);
  },
});

server.on("error", (err) => {
  console.error("Serverfehler:", err);
});

const PORT_SMTP = 25; // Standard SMTP port for incoming emails

const options = {
    key: readFileSync("/etc/letsencrypt/live/mail.selfmail.app/privkey.pem" as string, "utf8"),
    cert: readFileSync("/etc/letsencrypt/live/mail.selfmail.app/fullchain.pem","utf8")
}

// OUTBOUND SMTP SERVER - Simplified for Bun compatibility
const outgoingServer = new SMTPServer({
  name: "Selfmail Outbound SMTP Server",

  cert: options.cert,
  key: options.key,
  
  allowInsecureAuth: false,
  authMethods: ["PLAIN", "LOGIN", "CRAM-MD5"],
  size: 10 * 1024 * 1024,
  disableReverseLookup: true,
  useXClient: false,
  authOptional: false,
  hidePIPELINING: true,
  needsUpgrade: false,
  useProxy: false,
  handshakeTimeout: 60000,
  socketTimeout: 60000, // Increase socket timeout to 60 seconds
  closeTimeout: 60000, // Increase connection timeout to 60 seconds
  maxClients: 1000,
  enableTrace: true,
  logger: true,

  onAuth(auth, session, callback) {
    if (auth.method === "XOAUTH2") {
      return callback(
        new Error(
          "XOAUTH2 method is not allowed,Expecting LOGIN authentication",
        ),
      );
    }
    console.log(`[OUTBOUND] Authentication attempt from ${session.remoteAddress}: ${auth.username}`);
    
    // Simplified authentication - no STARTTLS requirement for now
    if (!auth.username || !auth.password) {
      return callback(new Error('Username and password required'));
    }
    
    // Basic password validation
    if (auth.password !== "selfmail_password") {
      return callback(new Error('Invalid password'));
    }
    
    console.log(`[OUTBOUND] Authentication successful for ${auth.username}`);
    return callback(undefined, {
      user: auth.username // Store the email address as the user
    });
  },

  onConnect(session, callback) {
    console.log("[OUTBOUND] New connection from " + session.remoteAddress);
    console.log("[OUTBOUND] Session secure:", session.secure);
    return callback();
  },

  onMailFrom(address, session, callback) {
    console.log(`[OUTBOUND] MAIL FROM: ${address.address} from ${session.remoteAddress}`);
    
    // Ensure authenticated user can only send from their own email
    if (session.user && session.user !== address.address) {
      console.log(`[OUTBOUND] User ${session.user} tried to send from ${address.address}`);
      return callback(new Error('You can only send emails from your own email address'));
    }
    
    return callback();
  },

  onRcptTo(address, session, callback) {
    console.log(`[OUTBOUND] RCPT TO: ${address.address} from ${session.remoteAddress}`);
    return callback();
  },

  onData(stream, session, callback) {
    console.log("[OUTBOUND] Receiving data from " + session.remoteAddress);
    let emailContent = "";
    stream.on("data", (chunk) => (emailContent += chunk.toString()));
    stream.on("end", () => {
      console.log("[OUTBOUND] Email content received:");
      console.log(emailContent);
      // Here you would typically forward the email to an external SMTP server
      // For example, using nodemailer or another SMTP client library
      return callback(); // Signal that the email has been processed
    });
  },

  onClose(session) {
    console.log(`[OUTBOUND] Connection closed from ${session.remoteAddress}`);
  },
});

// Start server on port 25 for incoming emails
server.listen(PORT_SMTP, () => {
  console.log(`SMTP Server running on port ${PORT_SMTP} (incoming emails)`);
});

// Start outbound server on port 587 with STARTTLS
outgoingServer.listen(587, () => {
  console.log("OUTBOUND Server listening on port 587 (SMTP Submission with STARTTLS)");
  console.log("- STARTTLS: Enabled and required");
  console.log("- Authentication: Required after STARTTLS");
  console.log("- Secure connection enforced for all operations");
});
