function generateSiteMap(paths, baseUrl) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map((path) => {
    return `  <url>
    <loc>${baseUrl}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;
}

export default function handler(req, res) {
  // Get the base URL from the request
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  // List of paths to include in the sitemap
  const paths = [
    "/contact/",
    "/feedback/",
    "/company/",
    "/search/",
    "/query/",
    "/lookup/",
    "/filter/",
    "/send-message/",
  ];

  // Generate the XML sitemap
  const sitemap = generateSiteMap(paths, baseUrl);

  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(sitemap);
}
