// One-off generator for the Shopify bulk product import CSV, sourced directly
// from src/types/products.js so the Shopify catalog and the 3D showcase data
// never drift apart on title/price/handle. Run: node scripts/generate-shopify-csv.mjs
import { PRODUCTS, CATEGORIES } from '../src/types/products.js';
import { writeFileSync } from 'fs';

const categoryNames = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]));

const columns = [
  'Handle',
  'Title',
  'Body (HTML)',
  'Vendor',
  'Type',
  'Tags',
  'Published',
  'Option1 Name',
  'Option1 Value',
  'Variant SKU',
  'Variant Inventory Tracker',
  'Variant Inventory Qty',
  'Variant Inventory Policy',
  'Variant Fulfillment Service',
  'Variant Price',
  'Variant Compare At Price',
  'Variant Requires Shipping',
  'Variant Taxable',
  'Status',
];

function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const rows = [columns];

for (const p of PRODUCTS) {
  const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : ['Default'];
  sizes.forEach((size, i) => {
    rows.push([
      p.id, // Handle — matches the product id used throughout the app's local data
      i === 0 ? p.name : '',
      i === 0 ? p.description : '',
      i === 0 ? p.brandName : '',
      i === 0 ? categoryNames[p.category] || p.category : '',
      i === 0 ? `${p.category},${p.brand}` : '',
      i === 0 ? 'TRUE' : '',
      'Edition',
      size,
      `${p.id}-${size.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      'shopify',
      p.stockCount ?? 10,
      'deny',
      'manual',
      p.price,
      p.originalPrice || '',
      'TRUE',
      'TRUE',
      i === 0 ? 'active' : '',
    ]);
  });
}

const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
writeFileSync(new URL('../shopify-products-import.csv', import.meta.url), csv);
console.log(`Wrote shopify-products-import.csv with ${PRODUCTS.length} products / ${rows.length - 1} variant rows.`);
