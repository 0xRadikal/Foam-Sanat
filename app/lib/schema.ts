export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Foam Sanat Industrial Group",
  "alternateName": "گروه صنعتی فوم صنعت",
  "url": "https://foamsanat.com",
  "logo": "https://foamsanat.com/logo.png",
  "description": "Leading manufacturer of PU foam injection machinery",
  "foundingDate": "2010",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+98-21-12345678",
    "contactType": "customer service",
    "email": "info@foamsanat.com",
    "areaServed": ["IR", "TR", "AE", "EU"],
    "availableLanguage": ["fa", "en", "ar", "tr"]
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Tehran",
    "addressCountry": "IR"
  }
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What's the difference between High-Pressure and Low-Pressure machines?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "High-Pressure machines operate at 150+ bar for mass production. Low-Pressure machines use mechanical mixing for flexible foam production."
      }
    }
  ]
};