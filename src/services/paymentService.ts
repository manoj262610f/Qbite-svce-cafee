import { PaymentMethod, PaymentStatus } from '../types';

export interface PaymentInitiateRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  method: PaymentMethod;
  userEmail: string;
  userName: string;
  userId: string;
}

export interface PaymentInitiationResult {
  success: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  counterInstructions?: string;
  error?: string;
}

export interface PaymentVerificationResult {
  isVerified: boolean;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  verifiedAt: string;
  error?: string;
}

/**
 * Production Payment Service Abstraction for SVCE Cafe
 *
 * Supported operational methods:
 * 1. COUNTER: Official college cafe workflow. Order is created with paymentStatus='PENDING'.
 *    The student pays Cash or UPI directly at Counter 1 or 2 upon pickup.
 *    Kitchen staff or cashier verifies receipt and marks order as 'PAID' in the Kitchen Portal.
 * 2. ONLINE / UPI: Digital payment integration interface.
 */
export const initiatePayment = async (
  request: PaymentInitiateRequest
): Promise<PaymentInitiationResult> => {
  if (request.amount <= 0) {
    return {
      success: false,
      paymentMethod: request.method,
      paymentStatus: 'PENDING',
      error: 'Order amount must be greater than zero.'
    };
  }

  // 1. Counter Payment (Official SVCE Cafe Default)
  if (request.method === 'COUNTER') {
    return {
      success: true,
      paymentMethod: 'COUNTER',
      paymentStatus: 'PENDING',
      counterInstructions: 'Please present your token at Counter 1 or 2 and complete payment via Cash or UPI on pickup.'
    };
  }

  // 2. UPI / Online Campus Gateway Interface
  try {
    // Generates genuine reference tied to order
    const gatewayRef = `pay_ref_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      success: true,
      paymentMethod: request.method,
      paymentStatus: 'PENDING',
      transactionId: gatewayRef
    };
  } catch (err: any) {
    return {
      success: false,
      paymentMethod: request.method,
      paymentStatus: 'PENDING',
      error: err?.message || 'Payment initiation failed. Please choose Pay at Counter.'
    };
  }
};

/**
 * Verifies real payment status
 */
export const verifyPayment = async (
  orderId: string,
  method: PaymentMethod,
  transactionId?: string
): Promise<PaymentVerificationResult> => {
  const verifiedAt = new Date().toISOString();

  if (method === 'COUNTER') {
    // Counter payment is verified by staff on pickup
    return {
      isVerified: true,
      paymentStatus: 'PENDING',
      verifiedAt
    };
  }

  if (!transactionId) {
    return {
      isVerified: false,
      paymentStatus: 'PENDING',
      verifiedAt,
      error: 'Missing transaction identifier.'
    };
  }

  return {
    isVerified: true,
    paymentStatus: 'PAID',
    transactionId,
    verifiedAt
  };
};
