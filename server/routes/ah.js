const express = require('express');
const router = express.Router();
const useMock = process.env.USE_MOCK === 'true';
const wowauctions = useMock
  ? require('../services/mockData')
  : require('../services/wowauctions');
const turtleDB = useMock
  ? require('../services/mockData')
  : require('../services/turtleDB');

router.get('/', (req, res) => {
  console.log('Health check ping /api/ah/');
  res.json({ message: 'AH API up' });
});

router.get('/item/:itemId', async (req, res) => {
  const rawId = req.params.itemId;
  const itemId = rawId.split(':')[0];
  const realm  = req.query.realm || 'nordanaar';
  console.log(`→ Request rawId=${rawId}, baseId=${itemId}, realm=${realm}`);
  try {
    const external = await wowauctions.fetchItem(realm, itemId);
    const metadata = await turtleDB.fetchItemInfo(itemId);
    res.json({ external, metadata });
  } catch (err) {
    console.error(`Error fetching ${itemId}:`, err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
