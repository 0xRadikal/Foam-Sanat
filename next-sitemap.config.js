/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://foamsanat.com',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/404', '/500'],
  transform: async (config, path) => ({
    loc: path,
    changefreq: config.changefreq,
    priority: path === '/' ? 1.0 : 0.7,
    lastmod: new Date().toISOString()
  })
};
