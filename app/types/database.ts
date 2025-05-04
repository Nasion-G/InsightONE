export type UserRole = 'admin' | 'ssr' | 'smea' | 'user';

export interface User {
  id: string;
  username: string;
  phoneNumber: string;
  role: UserRole;
  companyId?: string; // For SME admins
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  contractNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MSISDN {
  id: string;
  number: string;
  companyId: string;
  userId?: string; // Employee assigned to this MSISDN
  basePlanId: string;
  usageLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TariffPlan {
  id: string;
  name: string;
  monthlyFee: number;
  voiceMinutes: {
    national: number;
    international: number;
    roaming: number;
  };
  sms: number;
  data: {
    home: number;
    roaming: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Usage {
  id: string;
  msisdnId: string;
  month: number;
  year: number;
  voice: {
    national: number;
    international: number;
    roaming: number;
  };
  sms: number;
  data: {
    home: number;
    roaming: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  msisdnId: string;
  type: 'usage_limit' | 'monthly_fee';
  threshold: number;
  triggeredAt: Date;
  status: 'pending' | 'sent' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  companyId: string;
  type: 'plan_change' | 'package_activation' | 'limit_change';
  status: 'created' | 'pending' | 'in_progress' | 'completed' | 'failed';
  details: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
} 