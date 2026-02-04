/**
 * Types Blockchain / Traçabilité
 * ================================
 * 
 * Types pour l'intégration blockchain : traçabilité immuable,
 * signatures numériques, smart contracts, audit trail
 */

import type { ID, Timestamp } from './index';

// ============================================
// TRANSACTION BLOCKCHAIN
// ============================================

export interface BlockchainTransaction {
  id: ID;
  hash: string;
  blockNumber: number;
  blockHash: string;
  timestamp: Timestamp;
  from: string; // Adresse wallet
  to?: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  gasUsed?: number;
  transactionFee?: number;
  data?: Record<string, unknown>;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  status: 'success' | 'failure';
  gasUsed: number;
  effectiveGasPrice: number;
  logs: TransactionLog[];
  timestamp: Timestamp;
}

export interface TransactionLog {
  address: string;
  topics: string[];
  data: string;
  logIndex: number;
  transactionIndex: number;
  blockNumber: number;
}

// ============================================
// ENREGISTREMENT BLOCKCHAIN
// ============================================

export interface BlockchainRecord {
  id: ID;
  entityType: 'demande' | 'validation' | 'document' | 'paiement' | 'contrat';
  entityId: ID;
  action: string;
  hash: string;
  previousHash?: string;
  transactionHash: string;
  blockNumber: number;
  data: Record<string, unknown>;
  metadata: {
    userId: ID;
    userName: string;
    ipAddress?: string;
    userAgent?: string;
  };
  signatures: DigitalSignature[];
  createdAt: Timestamp;
  verifiedAt?: Timestamp;
  isValid: boolean;
}

export interface BlockchainVerification {
  recordId: ID;
  isValid: boolean;
  verifiedAt: Timestamp;
  verificationDetails: {
    hashMatch: boolean;
    signatureValid: boolean;
    chainIntegrity: boolean;
    timestampValid: boolean;
  };
  discrepancies?: string[];
}

// ============================================
// SIGNATURE NUMÉRIQUE
// ============================================

export interface DigitalSignature {
  signerId: ID;
  signerName: string;
  signerRole: string;
  algorithm: 'RSA' | 'ECDSA' | 'EdDSA';
  signature: string;
  publicKey: string;
  timestamp: Timestamp;
  isValid: boolean;
  certificate?: DigitalCertificate;
}

export interface DigitalCertificate {
  id: string;
  issuer: string;
  subject: string;
  serialNumber: string;
  validFrom: Timestamp;
  validTo: Timestamp;
  publicKey: string;
  fingerprint: string;
  status: 'valid' | 'expired' | 'revoked';
}

export interface SignatureRequest {
  documentId: ID;
  signerIds: ID[];
  message?: string;
  requireAllSignatures: boolean;
  expiresAt?: Timestamp;
}

export interface SignatureSession {
  id: ID;
  documentId: ID;
  requestedBy: ID;
  signers: SignatureParticipant[];
  status: 'pending' | 'partial' | 'completed' | 'expired' | 'cancelled';
  createdAt: Timestamp;
  completedAt?: Timestamp;
  expiresAt?: Timestamp;
}

export interface SignatureParticipant {
  userId: ID;
  userName: string;
  email: string;
  status: 'pending' | 'signed' | 'declined';
  signedAt?: Timestamp;
  signature?: DigitalSignature;
  ipAddress?: string;
}

// ============================================
// SMART CONTRACTS
// ============================================

export interface SmartContract {
  id: ID;
  address: string;
  name: string;
  type: 'validation' | 'payment' | 'milestone' | 'sla';
  abi: any[];
  bytecode?: string;
  status: 'deployed' | 'active' | 'paused' | 'terminated';
  deployedAt: Timestamp;
  deployedBy: ID;
  version: string;
  network: string;
}

export interface ContractExecution {
  id: ID;
  contractId: ID;
  method: string;
  parameters: Record<string, unknown>;
  transactionHash: string;
  status: 'pending' | 'executing' | 'success' | 'failed';
  result?: any;
  error?: string;
  gasUsed?: number;
  executedAt: Timestamp;
  executedBy: ID;
}

export interface ContractEvent {
  id: ID;
  contractId: ID;
  eventName: string;
  parameters: Record<string, unknown>;
  transactionHash: string;
  blockNumber: number;
  timestamp: Timestamp;
}

// ============================================
// AUDIT TRAIL BLOCKCHAIN
// ============================================

export interface BlockchainAuditTrail {
  entityType: string;
  entityId: ID;
  records: BlockchainRecord[];
  summary: {
    totalRecords: number;
    firstRecord: Timestamp;
    lastRecord: Timestamp;
    allValid: boolean;
    signatures: number;
  };
  chainIntegrity: boolean;
}

export interface AuditEvent {
  id: ID;
  entityType: string;
  entityId: ID;
  action: 'create' | 'update' | 'delete' | 'validate' | 'approve' | 'reject';
  userId: ID;
  userName: string;
  changes?: ChangeRecord[];
  blockchainHash: string;
  timestamp: Timestamp;
  isImmutable: boolean;
}

export interface ChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Timestamp;
}

// ============================================
// WALLET ET IDENTITÉ
// ============================================

export interface BlockchainWallet {
  id: ID;
  address: string;
  publicKey: string;
  type: 'hot' | 'cold' | 'hardware';
  network: string;
  balance?: number;
  userId: ID;
  label?: string;
  createdAt: Timestamp;
  isActive: boolean;
}

export interface WalletTransaction {
  id: ID;
  walletId: ID;
  type: 'send' | 'receive';
  amount: number;
  currency: string;
  toAddress: string;
  fromAddress: string;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  timestamp: Timestamp;
  fee?: number;
}

export interface DigitalIdentity {
  id: ID;
  userId: ID;
  did: string; // Decentralized Identifier
  publicKey: string;
  credentials: VerifiableCredential[];
  createdAt: Timestamp;
  lastVerified?: Timestamp;
  isActive: boolean;
}

export interface VerifiableCredential {
  id: string;
  type: string;
  issuer: string;
  issuedAt: Timestamp;
  expiresAt?: Timestamp;
  claims: Record<string, unknown>;
  proof: {
    type: string;
    created: Timestamp;
    proofPurpose: string;
    verificationMethod: string;
    signature: string;
  };
  status: 'valid' | 'expired' | 'revoked';
}

// ============================================
// TOKEN ET ASSETS
// ============================================

export interface BlockchainToken {
  id: ID;
  symbol: string;
  name: string;
  type: 'utility' | 'security' | 'nft' | 'governance';
  contractAddress: string;
  totalSupply: number;
  decimals: number;
  network: string;
  metadata?: Record<string, unknown>;
}

export interface TokenBalance {
  tokenId: ID;
  walletId: ID;
  balance: number;
  lastUpdated: Timestamp;
}

export interface NFTAsset {
  id: ID;
  tokenId: string;
  contractAddress: string;
  name: string;
  description?: string;
  imageUrl?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  owner: string;
  metadata?: Record<string, unknown>;
  mintedAt: Timestamp;
}

// ============================================
// CONSENSUS ET VALIDATION
// ============================================

export interface ConsensusRequest {
  id: ID;
  entityType: string;
  entityId: ID;
  action: string;
  requiredValidators: number;
  validators: ValidatorParticipant[];
  status: 'pending' | 'reached' | 'failed' | 'expired';
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export interface ValidatorParticipant {
  validatorId: ID;
  validatorName: string;
  vote?: 'approve' | 'reject';
  votedAt?: Timestamp;
  signature?: string;
  reason?: string;
}

// ============================================
// RÉSEAU BLOCKCHAIN
// ============================================

export interface BlockchainNetwork {
  id: string;
  name: string;
  type: 'public' | 'private' | 'consortium';
  protocol: 'ethereum' | 'hyperledger' | 'corda' | 'custom';
  rpcUrl: string;
  chainId: number;
  explorer?: string;
  isTestnet: boolean;
  status: 'active' | 'maintenance' | 'deprecated';
}

export interface NetworkStats {
  networkId: string;
  blockHeight: number;
  hashRate?: number;
  difficulty?: number;
  totalTransactions: number;
  averageBlockTime: number; // secondes
  gasPrice?: number;
  lastBlockTime: Timestamp;
}

// ============================================
// CONFIGURATION
// ============================================

export interface BlockchainConfig {
  enabled: boolean;
  network: string;
  contractAddresses: Record<string, string>;
  gasLimit: number;
  gasPrice?: number;
  confirmationsRequired: number;
  retryAttempts: number;
  timeout: number; // ms
}
