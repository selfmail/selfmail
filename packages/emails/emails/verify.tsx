import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text
} from '@react-email/components';
import * as React from 'react';

interface VerifyEmailProps {
    unsubscribe: string;
    token: string;
}

export const WelcomeEmail = ({ unsubscribe, token }: VerifyEmailProps) => (
    <Html>
        <Head>
            <title>Welcome to selfmail</title>
        </Head>
        <Preview>Verify your email for sign in to the Newsletter!</Preview>
        <Body style={main}>
            <Container style={container} className="container">
                <Section style={mainContentSection} className="content">
                    <Heading as="h2" style={h2}>
                        Verify your email for sign in to the Newsletter!
                    </Heading>
                    <Text style={text}>
                        We are happy you made it so far. The last step is to verify your email address. Please click the button below to verify your email.
                    </Text>
                    <Container style={{}} className="container">
                        <Button style={button} href="https://selfmail.app/api/verify">
                            Verify Email
                        </Button>
                    </Container>
                </Section>
                <Section style={contentSection} className="content">
                    <Heading as="h2" style={h2}>
                        Contact us
                    </Heading>
                    <Text style={text}>
                        If you have any questions or need help, don't hesitate to contact our support team. You can reach us at support@selfmail.app.
                    </Text>
                    <Text style={text}>
                        Best regards,<br />
                        the selfmail team
                    </Text>
                </Section>
                <Section style={footer}>
                    <Text style={footerText}>© 2024 selfmail. All rights reserved.</Text>
                    <Link style={linkStyle} href="https://selfmail.app/api/unsubscribe">unsubscribe</Link>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default WelcomeEmail;

const button = {
    backgroundColor: "#296dff",
    borderRadius: "4px",
    color: "#ffffff",
    padding: "7px 14px",
    marginTop: "16px",
}

const main = {
    backgroundColor: '#ffffff',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};


const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '100%',
    maxWidth: '580px',
};


const h2 = {
    color: '#333',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 16px',
};

const contentSection = {
    border: '1px solid #eaeaea',
    borderRadius: '5px',
    margin: '16px 0',
    padding: '24px',
};
const mainContentSection = {
    border: '1px solid #296dff',
    borderRadius: '5px',
    margin: '16px 0',
    padding: '24px',
};

const text = {
    color: '#333',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    fontSize: '16px',
    lineHeight: '26px',
};

const linkStyle = {
    color: '#296dff',
    textDecoration: 'none',
};

const footer = {
    marginTop: '32px',
    textAlign: 'center' as const,
};

const footerText = {
    color: '#666',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    fontSize: '12px',
    lineHeight: '24px',
};