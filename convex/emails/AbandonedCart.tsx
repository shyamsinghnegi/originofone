import * as React from 'react';
import { Text, Section } from '@react-email/components';
import { EmailLayout } from './Layout';

interface AbandonedCartProps {
  userName: string;
  itemCount: number;
  cartUrl: string;
  userEmail?: string;
}

export function AbandonedCartEmail({
  userName = "Alex Morgan",
  itemCount = 2,
  cartUrl = "https://originofone.com/cart",
  userEmail = "alex.morgan@example.com",
}: Partial<AbandonedCartProps> = {}) {
  return (
    <EmailLayout previewText="You left something behind" userEmail={userEmail}>
      <Text style={h1}>Still Thinking About It?</Text>
      <Text style={paragraph}>Hi {userName},</Text>
      <Text style={paragraph}>
        You left {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart. Your selection is still waiting for you.
      </Text>

      <Section style={{ marginTop: '30px' }}>
        <a href={cartUrl} style={button}>Return to Cart</a>
      </Section>
    </EmailLayout>
  );
}

const h1 = {
  fontSize: '24px',
  fontWeight: 'normal',
  margin: '0 0 20px',
  color: '#000',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.5',
  color: '#444',
  margin: '0 0 16px',
};

const button = {
  backgroundColor: '#000',
  color: '#fff',
  padding: '14px 24px',
  textDecoration: 'none',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
  display: 'inline-block',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

export default AbandonedCartEmail;
