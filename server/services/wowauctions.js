const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

async function fetchItem(realm, itemId) {
  const key = `ah:${realm}:${itemId}`;
  if (cache.has(key)) return cache.get(key);
  const url = `https://www.wowauctions.net/auctionHouse/turtle-wow/${realm}/mergedAh/${itemId}`;
  console.log(`Scraping: ${url}`);
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);
  const avgPrice = parseFloat($('.average-price').text().replace(/\D/g, '')) || 0;
  const listings = $('.listing-row .price')
    .map((i, el) => parseFloat($(el).text().replace(/\D/g, '')))
    .get();
  const volume = listings.length;
  const globalMin = volume ? Math.min(...listings) : null;
  const globalMax = volume ? Math.max(...listings) : null;
  const result = { avgPrice, volume, globalMin, globalMax };
  cache.set(key, result);
  return result;
}

module.exports = { fetchItem };
