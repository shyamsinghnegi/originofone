import * as React from 'react';
import { Text, Section } from '@react-email/components';
import { EmailLayout } from './Layout';

interface PendingPaymentProps {
  orderNumber: string;
  userName: string;
  total: number;
  resumeLink: string;
  userEmail?: string;
}

export function PendingPaymentEmail({
  orderNumber = "OO-84920",
  userName = "Alex Morgan",
  total = 745.8,
  resumeLink = "https://originofone.com/checkout/resume/OO-84920",
  userEmail = "alex.morgan@example.com",
}: Partial<PendingPaymentProps> = {}) {
  return (
    <EmailLayout previewText="Complete your payment to secure your order" userEmail={userEmail}>
      <Text style={h1}>Action Required</Text>
      <Text style={paragraph}>Hi {userName},</Text>
      <Text style={paragraph}>
        Your order #{orderNumber} (total ${total.toFixed(2)} CAD) has been reserved, but the payment wasn't completed.
      </Text>
      <Text style={paragraph}>
        Due to limited inventory, reservations are only held for a short period of time. Please complete your payment to secure your items.
      </Text>

      <Section style={{ marginTop: '30px' }}>
        <a href={resumeLink} style={button}>Complete Payment</a>
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

export default PendingPaymentEmail;
