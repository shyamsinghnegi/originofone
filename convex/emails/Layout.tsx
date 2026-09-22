import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export function EmailLayout({
  previewText,
  children,
  userEmail,
  unsubscribeUrl,
  showUnsubscribe = true,
}: {
  previewText: string;
  children: React.ReactNode;
  userEmail?: string;
  unsubscribeUrl?: string;
  showUnsubscribe?: boolean;
}) {
  const finalUnsubscribeUrl =
    unsubscribeUrl ??
    (userEmail
      ? `https://originofone.com/unsubscribe?email=${encodeURIComponent(userEmail)}`
      : 'https://originofone.com/unsubscribe');
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>ORIGIN OF ONE</Text>
          </Section>
          
          <Hr style={hr} />

          <Section style={content}>
            {children}
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Origin of One
            </Text>
            <Text style={footerText}>
              Need help? Reply to this email or{' '}
              <Link href="https://originofone.com" style={footerLink}>
                visit our website
              </Link>
              .
            </Text>
            {showUnsubscribe && (
              <Text style={unsubscribeText}>
                To manage notifications or opt out,{' '}
                <Link href={finalUnsubscribeUrl} style={footerLink}>
                  unsubscribe / manage preferences
                </Link>
                .
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: 'Georgia, "Times New Roman", serif',
  padding: '40px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5e5',
  margin: '0 auto',
  padding: '40px',
  width: '600px',
  maxWidth: '100%',
};

const header = {
  paddingBottom: '20px',
  textAlign: 'center' as const,
};

const logo = {
  fontSize: '18px',
  letterSpacing: '4px',
  margin: '0',
  color: '#000000',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '0',
};

const content = {
  padding: '40px 0',
};

const footer = {
  paddingTop: '30px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '11px',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
  color: '#888888',
  margin: '4px 0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const footerLink = {
  color: '#000000',
  textDecoration: 'underline',
};

const unsubscribeText = {
  fontSize: '10px',
  letterSpacing: '0.5px',
  textTransform: 'uppercase' as const,
  color: '#999999',
  margin: '12px 0 0',
  lineHeight: '1.4',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};
