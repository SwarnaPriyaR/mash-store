import { getAllProducts } from '@/lib/db';
import { convertDriveUrl } from '@/src/utils/helpers';
import App from '@/src/App';

// This is a Server Component - runs on the server
export default async function StorePage() {
  // No HTTP call needed! Direct database access!
  let products = [];
  let error = null;

  try {
    const data = await getAllProducts();
    products = data.map(p => ({
      ...p,
      price: p.basePrice,
      image: convertDriveUrl(p.image),
      reviews: p.reviews || []
    }));
  } catch (err) {
    console.error("Failed to load products:", err);
    error = err.message;
  }

  // Pass data to the client App component
  return <App initialProducts={products} initialError={error} />;
}
