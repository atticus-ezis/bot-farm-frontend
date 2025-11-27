export const extractPageNumber = (url) => {
  if (!url) return null;
  const match = url.match(/[?&]page=(\d+)/);
  return match ? parseInt(match[1]) : null;
};
