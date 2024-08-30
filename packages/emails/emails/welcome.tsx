import {
    Body,
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

export const WelcomeEmail = () => (
    <Html>
        <Head>
            <title>Welcome to selfmail</title>
        </Head>
        <Preview>Welcome to selfmail - Your personal email assistant</Preview>
        <Body style={main}>
            <Container style={container} className="container">
                <Section style={mainContentSection} className="content">
                    <Heading as="h2" style={h2}>
                        Welcome to selfmail!
                    </Heading>
                    <Text style={text}>
                        We are excited to have you on board. You'll receive our latest news about updates and the future, as well as tips and tricks for using selfmail. We hope you enjoy using selfmail and we look forward to hearing from you.
                    </Text>
                </Section>
                <Section style={contentSection} className="content">
                    <Heading as="h2" style={h2}>
                        Next steps:
                    </Heading>
                    <Text style={text}>
                        Here are some things you can do now:
                    </Text>
                    <ul style={list}>
                        <li style={listItem}>Customize your profile</li>
                        <li style={listItem}>Explore our intelligent email features</li>
                        <li style={listItem}>Download the selfmail app</li>
                    </ul>
                </Section>
                <Section style={contentSection} className="single-column content">
                    <Heading as="h2" style={h2}>
                        Tips & Tricks
                    </Heading>
                    <Text style={text}>
                        Discover our best tips and tricks to get the most out of selfmail. From time-saving tricks to improving your email efficiency.
                    </Text>
                    <Link style={linkStyle} href="https://docs.selfmail.app/">lean more</Link>
                </Section>
                <Section style={contentSection} className="single-column content">
                    <Heading as="h2" style={h2}>
                        Community
                    </Heading>
                    <Text style={text}>
                        You can help develop selfmail by joining our community, asking questions, and sharing your experiences.
                    </Text>
                    <Link style={linkStyle} href="https://github.com/selfmail">Our community on GitHub</Link>
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

const list = {
    marginBottom: '24px',
    paddingLeft: '24px',
};

const listItem = {
    color: '#333',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    fontSize: '16px',
    lineHeight: '26px',
    marginBottom: '8px',
};

const twoColumnRow = {
    display: 'flex',
    justifyContent: 'space-between',
};

const column = {
    width: '48%', // Slightly less than 50% to account for spacing
    display: 'inline-block',
    verticalAlign: 'top',
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