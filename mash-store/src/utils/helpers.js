export const getSalePrice = (product, sale) => {
  if (!sale || !sale.active) return null;
  const now = Date.now();
  if (now >= sale.start && now <= sale.end) {
    return Math.round(product.basePrice * (1 - sale.discount / 100));
  }
  return null;
};

export const convertDriveUrl = (url) => {
  if (!url) return url;
  if (url.includes("googleusercontent.com/d/")) return url;

  const fileDRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const idQueryRegex = /[?&]id=([a-zA-Z0-9_-]+)/;
  
  let fileId = null;
  const dMatch = url.match(fileDRegex);
  if (dMatch) {
    fileId = dMatch[1];
  } else if (url.includes("drive.google.com")) {
    const queryMatch = url.match(idQueryRegex);
    if (queryMatch) {
      fileId = queryMatch[1];
    }
  }
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return url;
};

