import * as React from 'react';
import { Text, Section, Row, Column } from '@react-email/components';
import { EmailLayout } from './Layout';

interface ReturnNotificationProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  adminUrl: string;
}

export function ReturnNotificationEmail({
  orderNumber = "OO-84920",
  customerName = "Alex Morgan",
  customerEmail = "alex.morgan@example.com",
  reason = "Size too large, requesting exchange for size S.",
  adminUrl = "https://originofone.com/admin/returns/OO-84920",
}: Partial<ReturnNotificationProps> = {}) {
  return (
    <EmailLayout previewText={`Return requested — #${orderNumber}`}>
      <Text style={h1}>Return Request</Text>
      <Text style={paragraph}>
        A new return has been requested for Order #{orderNumber}.
      </Text>

      <Section style={detailsBox}>
        <Row style={{ marginBottom: '15px' }}>
          <Column>
            <Text style={label}>Customer</Text>
            <Text style={value}>{customerName}</Text>
          </Column>
          <Column>
            <Text style={label}>Email</Text>
            <Text style={value}>{customerEmail}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={label}>Reason</Text>
            <Text style={value}>{reason}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={{ marginTop: '30px' }}>
        <a href={adminUrl} style={button}>Review in Admin Panel</a>
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

const detailsBox = {
  backgroundColor: '#fafafa',
  padding: '20px',
  margin: '30px 0',
};

const label = {
  fontSize: '10px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  color: '#888',
  margin: '0 0 4px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const value = {
  fontSize: '14px',
  color: '#000',
  margin: '0',
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

export default ReturnNotificationEmail;
