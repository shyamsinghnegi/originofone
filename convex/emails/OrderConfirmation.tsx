import * as React from 'react';
import { Text, Section, Row, Column } from '@react-email/components';
import { EmailLayout } from './Layout';

interface OrderConfirmationProps {
  orderNumber: string;
  userName: string;
  status: string;
  items: {
    name: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: {
    line1: string;
    city: string;
    province: string;
  };
  trackingUrl?: string;
  userEmail?: string;
}

export function OrderConfirmationEmail({
  orderNumber = "OO-84920",
  userName = "Alex Morgan",
  status = "Confirmed",
  items = [
    {
      name: "Minimalist Trench Coat",
      color: "Charcoal",
      size: "M",
      quantity: 1,
      price: 420,
    },
    {
      name: "Structured Wool Trouser",
      color: "Bone",
      size: "32",
      quantity: 1,
      price: 240,
    },
  ],
  subtotal = 660,
  shippingCost = 0,
  tax = 85.8,
  total = 745.8,
  shippingAddress = {
    line1: "124 Queen Street W, Suite 300",
    city: "Toronto",
    province: "ON",
  },
  trackingUrl = "https://originofone.com/orders/OO-84920",
  userEmail = "alex.morgan@example.com",
}: Partial<OrderConfirmationProps> = {}) {
  return (
    <EmailLayout previewText={`Order Confirmed — #${orderNumber}`} userEmail={userEmail}>
      <Text style={h1}>Order Confirmed</Text>
      <Text style={paragraph}>Hi {userName},</Text>
      <Text style={paragraph}>
        Thanks for your order! Here's a summary of your purchase.
      </Text>

      <Section style={detailsBox}>
        <Row>
          <Column>
            <Text style={label}>Order No.</Text>
            <Text style={value}>#{orderNumber}</Text>
          </Column>
          <Column>
            <Text style={label}>Status</Text>
            <Text style={value}>{status}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={itemsTable}>
        {items.map((item, i) => (
          <Row key={i} style={itemRow}>
            <Column>
              <Text style={itemName}>{item.name}</Text>
              <Text style={itemMeta}>
                {item.color} / {item.size} × {item.quantity}
              </Text>
            </Column>
            <Column align="right">
              <Text style={itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Section style={totalsBox}>
        <Row style={totalRow}>
          <Column><Text style={totalLabel}>Subtotal</Text></Column>
          <Column align="right"><Text style={totalValue}>${subtotal.toFixed(2)}</Text></Column>
        </Row>
        <Row style={totalRow}>
          <Column><Text style={totalLabel}>Shipping</Text></Column>
          <Column align="right"><Text style={totalValue}>${shippingCost.toFixed(2)}</Text></Column>
        </Row>
        <Row style={totalRow}>
          <Column><Text style={totalLabel}>Tax</Text></Column>
          <Column align="right"><Text style={totalValue}>${tax.toFixed(2)}</Text></Column>
        </Row>
        <Row style={{ ...totalRow, borderTop: '1px solid #e5e5e5', paddingTop: '10px' }}>
          <Column><Text style={totalLabelFinal}>Total (CAD)</Text></Column>
          <Column align="right"><Text style={totalValueFinal}>${total.toFixed(2)}</Text></Column>
        </Row>
      </Section>

      <Section style={shippingBox}>
        <Text style={label}>Shipping To</Text>
        <Text style={address}>
          {shippingAddress.line1}<br />
          {shippingAddress.city}, {shippingAddress.province}
        </Text>
      </Section>

      {trackingUrl ? (
        <Section style={{ marginTop: '30px' }}>
          <a href={trackingUrl} style={button}>Track Order</a>
        </Section>
      ) : (
        <Text style={paragraph}>
          We'll send another email with tracking once your order ships.
        </Text>
      )}
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

const itemsTable = {
  margin: '0 0 30px',
};

const itemRow = {
  borderBottom: '1px solid #eee',
  paddingBottom: '15px',
  paddingTop: '15px',
};

const itemName = {
  fontSize: '15px',
  color: '#000',
  margin: '0 0 4px',
};

const itemMeta = {
  fontSize: '12px',
  color: '#666',
  margin: '0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const itemPrice = {
  fontSize: '15px',
  color: '#000',
  margin: '0',
};

const totalsBox = {
  margin: '0 0 30px',
  width: '100%',
};

const totalRow = {
  paddingBottom: '10px',
};

const totalLabel = {
  fontSize: '14px',
  color: '#666',
  margin: '0',
};

const totalValue = {
  fontSize: '14px',
  color: '#000',
  margin: '0',
};

const totalLabelFinal = {
  fontSize: '16px',
  color: '#000',
  margin: '0',
};

const totalValueFinal = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#000',
  margin: '0',
};

const shippingBox = {
  margin: '0 0 30px',
};

const address = {
  fontSize: '15px',
  lineHeight: '1.5',
  color: '#444',
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

export default OrderConfirmationEmail;
