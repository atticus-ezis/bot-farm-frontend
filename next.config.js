// Extract URL strings from the array (handles both objects and strings)
const getUrlStrings = (urls) => {
  return urls.map((item) => (typeof item === "string" ? item : item.url));
};

// Generate redirects for all honeypot URLs
const generateRedirects = (HONEYPOT_URLS) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  if (!apiUrl) {
    console.warn("NEXT_PUBLIC_API_URL is not set, redirects will not work");
    return [];
  }

  const urlStrings = getUrlStrings(HONEYPOT_URLS);
  const redirects = [];

  urlStrings.forEach((url) => {
    // Remove trailing slash for consistent handling
    const cleanUrl = url.replace(/\/$/, "");

    // Create redirects for both with and without trailing slash
    // Source: /contact and /contact/ both redirect
    const sources = [`/${cleanUrl}`, `/${cleanUrl}/`];

    sources.forEach((source) => {
      // Destination includes the full backend URL with the original URL format
      const destination = `${apiUrl}/${url}`;

      redirects.push({
        source,
        destination,
        permanent: false, // Use 307 temporary redirect
      });
    });
  });

  return redirects;
};

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async redirects() {
    try {
      const { HONEYPOT_URLS } = await import("./config/honeypot_urls.js");
      const redirects = generateRedirects(HONEYPOT_URLS);
      console.log(`Generated ${redirects.length} redirects for honeypot URLs`);
      return redirects;
    } catch (error) {
      console.error("Error loading HONEYPOT_URLS:", error);
      return [];
    }
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
    ];
  },
};

module.exports = nextConfig;
