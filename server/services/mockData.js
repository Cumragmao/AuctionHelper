const mockItems = {
  111: {
    name: 'Sample Item 111',
    quality: 1,
    icon: null,
    craftCost: null
  },
  222: {
    name: 'Sample Item 222',
    quality: 2,
    icon: null,
    craftCost: null
  }
};

const mockAuctions = {
  111: { avgPrice: 10, volume: 5, globalMin: 8, globalMax: 12 },
  222: { avgPrice: 50, volume: 2, globalMin: 48, globalMax: 55 }
};

function fetchItem(realm, id) {
  return Promise.resolve(mockAuctions[id] || { avgPrice: 0, volume: 0, globalMin: null, globalMax: null });
}

function fetchItemInfo(id) {
  return Promise.resolve(mockItems[id] || { name: `Item ${id}`, quality: 0, icon: null, craftCost: null });
}

module.exports = { fetchItem, fetchItemInfo };
