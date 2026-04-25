//! On-chain certificate verification system with real-time status checks.
//!
//! This module provides:
//! - Public verification endpoints
//! - Verification result structures
//! - Real-time certificate status queries
//! - Audit events for all verification actions

use crate::revocation::{CertificateStatus, RevocationRecord};
use soroban_sdk::{contracttype, Address, String};

/// Metadata associated with a certificate for presentation in verification results.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CertificateMetadata {
    /// Student who earned the certificate.
    pub student: Address,
    /// Course symbol or identifier.
    pub course_symbol: String,
    /// Human-readable course name.
    pub course_name: String,
    /// Date the certificate was issued (ledger timestamp).
    pub issue_date: u64,
    /// Optional W3C-compliant Decentralized Identifier (DID).
    pub did: Option<String>,
}

/// Complete verification result returned by public verification endpoint.
///
/// Provides all necessary information for employers, verifiers, or automated systems
/// to validate a certificate's authenticity and current status on-chain.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VerificationResult {
    /// True if certificate is currently valid and verifiable.
    pub is_valid: bool,
    /// Current status of the certificate in its lifecycle.
    pub status: CertificateStatus,
    /// Address of the certificate holder.
    pub owner: Address,
    /// Certificate metadata (course info, issue date, etc.)
    pub metadata: CertificateMetadata,
    /// If revoked, contains full revocation details for context.
    pub revocation_info: Option<RevocationRecord>,
    /// Ledger timestamp when this verification was performed.
    pub verification_timestamp: u64,
}

impl VerificationResult {
    /// Create an active (valid) verification result.
    pub fn active(
        owner: Address,
        metadata: CertificateMetadata,
        verification_timestamp: u64,
    ) -> Self {
        Self {
            is_valid: true,
            status: CertificateStatus::Active,
            owner,
            metadata,
            revocation_info: None,
            verification_timestamp,
        }
    }

    /// Create a revoked verification result with revocation details.
    pub fn revoked(
        owner: Address,
        metadata: CertificateMetadata,
        revocation_info: RevocationRecord,
        verification_timestamp: u64,
    ) -> Self {
        Self {
            is_valid: false,
            status: CertificateStatus::Revoked,
            owner,
            metadata,
            revocation_info: Some(revocation_info),
            verification_timestamp,
        }
    }

    /// Create a superseded verification result.
    pub fn superseded(
        owner: Address,
        metadata: CertificateMetadata,
        superseded_by: u128,
        verification_timestamp: u64,
    ) -> Self {
        Self {
            is_valid: false,
            status: CertificateStatus::Superseded,
            owner,
            metadata,
            revocation_info: None,
            verification_timestamp,
        }
    }

    /// Create a reissued verification result.
    pub fn reissued(
        owner: Address,
        metadata: CertificateMetadata,
        new_token_id: u128,
        verification_timestamp: u64,
    ) -> Self {
        Self {
            is_valid: false,
            status: CertificateStatus::Reissued,
            owner,
            metadata,
            revocation_info: None,
            verification_timestamp,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verification_result_active() {
        let owner = Address::random(&soroban_sdk::Env::default());
        let metadata = CertificateMetadata {
            student: owner.clone(),
            course_symbol: String::from_str(&soroban_sdk::Env::default(), "RUST101"),
            course_name: String::from_str(&soroban_sdk::Env::default(), "Introduction to Rust"),
            issue_date: 1000,
            did: None,
        };

        let result = VerificationResult::active(owner.clone(), metadata, 2000);

        assert!(result.is_valid);
        assert_eq!(result.status, CertificateStatus::Active);
        assert_eq!(result.owner, owner);
        assert!(result.revocation_info.is_none());
        assert_eq!(result.verification_timestamp, 2000);
    }
}
