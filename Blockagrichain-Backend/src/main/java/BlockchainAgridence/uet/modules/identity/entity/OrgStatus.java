package BlockchainAgridence.uet.modules.identity.entity;

public enum OrgStatus {
    PENDING, // Added back for backward compatibility with existing DB records
    REGISTERED,
    PENDING_APPROVAL,
    VERIFIED,
    REJECTED,
    BANNED
}