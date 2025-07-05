const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });

async function fetchItemInfo(itemId) {
  const key = `item:${itemId}`;
  if (cache.has(key)) return cache.get(key);
  const url = `https://database.turtle-wow.org/?api=model&table=item&id=${itemId}`;
  console.log(`Fetching TurtleDB: ${url}`);
  const { data } = await axios.get(url);
  const item = data.model || {};
  const metadata = { name: item.name, quality: item.quality, icon: item.icon, craftCost: null };
  cache.set(key, metadata);
  return metadata;
}

module.exports = { fetchItemInfo };
