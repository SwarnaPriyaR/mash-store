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

export const sendEmailNotification = async (key, msgText, toastFn) => {
  if (!key) return;
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        access_key: key,
        subject: "🚨 MASH Store Inventory Alert Report",
        from_name: "MASH Store Inventory System",
        message: `Dear Admin,

Here is the latest inventory stock alert report from MASH Store:

${msgText}

Best regards,
MASH Inventory Bot`
      })
    });
    const data = await res.json();
    if (data.success) {
      toastFn("📧 Real stock alert email dispatched successfully!");
    } else {
      toastFn("⚠️ Web3Forms failed to deliver email: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Email delivery failed", err);
    toastFn("❌ Network error: Could not send stock alert email");
  }
};
