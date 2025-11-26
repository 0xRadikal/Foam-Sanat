const envConfig = {
  public: {
    required: ['NEXT_PUBLIC_SITE_URL'],
    recommended: [
      'NEXT_PUBLIC_CONTACT_PHONE_FA',
      'NEXT_PUBLIC_CONTACT_PHONE_EN',
      'NEXT_PUBLIC_CONTACT_EMAIL',
      'NEXT_PUBLIC_GA_ID',
      'NEXT_PUBLIC_GTM_ID',
      'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
    ],
  },
  server: {
    required: ['CONTACT_PHONE_FA', 'CONTACT_PHONE_EN', 'CONTACT_EMAIL', 'COMMENTS_ADMIN_TOKEN'],
    recommended: [
      'RESEND_API_KEY',
      'RESEND_FROM_EMAIL',
      'TURNSTILE_SECRET_KEY',
      'DATABASE_URL',
      'COMMENTS_DATABASE_URL',
      'RATE_LIMIT_REDIS_URL',
      'REDIS_URL',
      'COMMENTS_ADMIN_IDENTITIES',
      'COMMENTS_ADMIN_ID',
      'COMMENTS_ADMIN_NAME',
    ],
  },
};

module.exports = envConfig;
