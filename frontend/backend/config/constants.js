module.exports = {
  PORT: 8080,
  API_PREFIX: '-34475338',
  ROLES: {
    ADMIN: 'admin',
    CHEF: 'chef',
    MANAGER: 'manager',
    USER: 'user'
  },
  ID_PREFIXES: {
    USER: 'U-',
    RECIPE: 'R-',
    INVENTORY: 'I-'
  },
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/,
  PHONE_PATTERN: /^(\+61|0)[2-9]\d{8}$/,
  FULLNAME_PATTERN: /^[A-Za-z\s\-'']+$/,
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar']
};
