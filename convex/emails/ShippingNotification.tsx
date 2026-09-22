import * as React from 'react';
import { Text, Section, Row, Column } from '@react-email/components';
import { EmailLayout } from './Layout';

interface ShippingNotificationProps {
  orderNumber: string;
  userName: string;
  status: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  userEmail?: string;
}

export function ShippingNotificationEmail({
  orderNumber = "OO-84920",
  userName = "Alex Morgan",
  status = "Shipped",
  carrier = "DHL Express",
  trackingNumber = "DHL-984210948",
  trackingUrl = "https://www.dhl.com/track?num=DHL-984210948",
  userEmail = "alex.morgan@example.com",
}: Partial<ShippingNotificationProps> = {}) {
  return (
    <EmailLayout previewText={`Your order has shipped — #${orderNumber}`} userEmail={userEmail}>
      <Text style={h1}>Your Order Has Shipped</Text>
      <Text style={paragraph}>Hi {userName},</Text>
      <Text style={paragraph}>
        Great news! Order #{orderNumber} is on its way.
      </Text>

      <Section style={detailsBox}>
        <Row style={{ marginBottom: '15px' }}>
          <Column>
            <Text style={label}>Order No.</Text>
            <Text style={value}>#{orderNumber}</Text>
          </Column>
          <Column>
            <Text style={label}>Status</Text>
            <Text style={value}>{status}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={label}>Carrier</Text>
            <Text style={value}>{carrier}</Text>
          </Column>
          <Column>
            <Text style={label}>Tracking Number</Text>
            <Text style={value}>{trackingNumber}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={{ marginTop: '30px' }}>
        <a href={trackingUrl} style={button}>Track Your Order</a>
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

export default ShippingNotificationEmail;
