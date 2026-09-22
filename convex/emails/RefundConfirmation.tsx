import * as React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './Layout';

interface RefundConfirmationProps {
  orderNumber: string;
  userName: string;
  total: number;
  userEmail?: string;
}

export function RefundConfirmationEmail({
  orderNumber = "OO-84920",
  userName = "Alex Morgan",
  total = 745.8,
  userEmail = "alex.morgan@example.com",
}: Partial<RefundConfirmationProps> = {}) {
  return (
    <EmailLayout previewText={`Order Cancelled & Refunded — #${orderNumber}`} userEmail={userEmail}>
      <Text style={h1}>Order Refunded</Text>
      <Text style={paragraph}>Hi {userName},</Text>
      <Text style={paragraph}>
        Your order #{orderNumber} has been cancelled and a full refund of ${total.toFixed(2)} CAD has been issued to your original payment method.
      </Text>
      <Text style={paragraph}>
        Refunds typically take 5–10 business days to appear on your statement.
      </Text>
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

export default RefundConfirmationEmail;
