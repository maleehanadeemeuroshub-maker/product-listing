/**
 * Thin client for Shopify's Storefront GraphQL API — no SDK, just fetch.
 * The storefront access token is public-safe by design (unlike the Admin API token),
 * so this runs directly in the browser.
 */

const domain = import.meta.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = import.meta.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const endpoint = domain ? `https://${domain}/api/2025-01/graphql.json` : null;

async function shopifyFetch(query, variables = {}) {
  if (!endpoint || !storefrontAccessToken) {
    throw new Error('Shopify env vars are missing (SHOPIFY_STORE_DOMAIN / SHOPIFY_STOREFRONT_ACCESS_TOKEN).');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join('\n'));
  }
  return json.data;
}

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    availableForSale
    priceRange {
      minVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
    variants(first: 20) {
      nodes {
        id
        title
        availableForSale
        quantityAvailable
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
      }
    }
  }
`;

// Storefront API has no "products by handle list" query, so we fetch each
// handle individually in parallel — simplest correct approach for a small catalog.
const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) { ...ProductFields }
  }
  ${PRODUCT_FRAGMENT}
`;

export async function getProductsByHandles(handles) {
  const results = await Promise.all(
    handles.map(async (handle) => {
      try {
        const data = await shopifyFetch(PRODUCT_BY_HANDLE_QUERY, { handle });
        return [handle, data.product];
      } catch (err) {
        console.error(`Shopify: failed to load product "${handle}"`, err);
        return [handle, null];
      }
    })
  );
  return Object.fromEntries(results);
}

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        attributes { key value }
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            product { handle title }
          }
        }
      }
    }
  }
`;

const CREATE_CART_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const ADD_TO_CART_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const UPDATE_CART_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const REMOVE_FROM_CART_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

const GET_CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) { ...CartFields }
  }
  ${CART_FRAGMENT}
`;

export async function shopifyGetCart(cartId) {
  const data = await shopifyFetch(GET_CART_QUERY, { cartId });
  return data.cart;
}

export async function shopifyCreateCart(lines = []) {
  const data = await shopifyFetch(CREATE_CART_MUTATION, { lines });
  throwOnUserErrors(data.cartCreate.userErrors);
  return data.cartCreate.cart;
}

export async function shopifyAddLine(cartId, lines) {
  const data = await shopifyFetch(ADD_TO_CART_MUTATION, { cartId, lines });
  throwOnUserErrors(data.cartLinesAdd.userErrors);
  return data.cartLinesAdd.cart;
}

export async function shopifyUpdateLine(cartId, lines) {
  const data = await shopifyFetch(UPDATE_CART_MUTATION, { cartId, lines });
  throwOnUserErrors(data.cartLinesUpdate.userErrors);
  return data.cartLinesUpdate.cart;
}

export async function shopifyRemoveLines(cartId, lineIds) {
  const data = await shopifyFetch(REMOVE_FROM_CART_MUTATION, { cartId, lineIds });
  throwOnUserErrors(data.cartLinesRemove.userErrors);
  return data.cartLinesRemove.cart;
}

function throwOnUserErrors(userErrors) {
  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors.map((e) => e.message).join('\n'));
  }
}
