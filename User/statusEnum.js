// statusEnum.js
const PolicyApplicationStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    RENEWED: 'renewed'
};

// Add other status enums here
const PolicyStatus = {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled'
};

const UserStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended'
};

const PolicyType = {
    HEALTH: 'health',
    LIFE: 'life',
    VEHICLE: 'vehicle',
    HOME: 'home'
};

const UserRole = {
    ADMIN: 'admin',
    USER: 'user',
    AGENT: 'agent'
};


module.exports = {
    PolicyApplicationStatus,
    PolicyStatus,
    UserStatus,
    PolicyType,
    UserRole
};