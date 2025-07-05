(async () => {
  const fileInput   = document.getElementById('fileInput');
  const refreshBtn  = document.getElementById('refreshBtn');
  const progressDiv = document.getElementById('progress');
  const lastUpdated = document.getElementById('lastUpdated');
  const tbody       = document.querySelector('#results tbody');

  let auxText = '';
  let history = {}, post = {};
  let dataMetrics = [];

  fileInput.addEventListener('change', async e => {
    auxText = await e.target.files[0].text();
    console.info('Aux file loaded, size:', auxText.length);
    refreshBtn.disabled = false;
    ({ history, post } = parseAux(auxText));
  });

  refreshBtn.addEventListener('click', loadData);

  async function loadData() {
    console.group('Data Load');
    console.log('Starting data load...');
    const ids = Object.keys(post);
    const realm = 'nordanaar';
    const concurrency = 5;
    const delayMs = 200;
    const results = [];

    for (let i = 0; i < ids.length; i += concurrency) {
      const batch = ids.slice(i, i + concurrency);
      console.log(`Batch ${i/concurrency+1}: Fetching ${batch.length} items`);
      progressDiv.textContent = `Fetching ${Math.min(i+concurrency, ids.length)}/${ids.length}...`;
      const batchResults = await Promise.all(
        batch.map(id => fetchMetrics(id, history, post, realm))
      );
      results.push(...batchResults);
      await new Promise(r => setTimeout(r, delayMs));
    }

    console.log('All batches complete');
    console.groupEnd();
    dataMetrics = results;
    renderTable();
    lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
    progressDiv.textContent = '';
    console.info('Table updated.');
  }

  async function fetchMetrics(rawId, history, post, realm) {
    const id = rawId.split(':')[0];
    const histArr = history[rawId] || [];
    const current = post[rawId];
    const localMin = histArr.length ? Math.min(...histArr, current) : current;
    const localMax = histArr.length ? Math.max(...histArr, current) : current;
    const roiLocal = ((localMax - current) / current) * 100;

    let external, metadata;
    try {
      const resp = await fetch(`/api/ah/item/${rawId}?realm=${realm}`);
      if (!resp.ok) throw new Error(resp.status);
      ({ external, metadata } = await resp.json());
    } catch (err) {
      console.error(`Fetch error for ${rawId}:`, err.message);
      external = { avgPrice:0, volume:0, globalMin:null, globalMax:null };
      metadata = { name: rawId, quality:0, icon: null, craftCost: null };
    }

    const roiGlobal = external.globalMax ? ((external.globalMax - current) / current) * 100 : 0;
    const craftMargin = metadata.craftCost ? current - metadata.craftCost : null;

    return {
      id: rawId,
      name: metadata.name,
      localCurrent: current,
      localMin,
      localMax,
      globalAvg: external.avgPrice,
      globalVol: external.volume,
      roiLocal,
      roiGlobal,
      craftMargin
    };
  }

  function renderTable() {
    const roiTh = parseFloat(document.getElementById('roiThreshold').value);
    const minVol = parseInt(document.getElementById('minVolume').value, 10);
    tbody.innerHTML = '';

    dataMetrics
      .filter(d => d.roiGlobal - d.roiLocal >= roiTh && d.globalVol >= minVol)
      .forEach(d => {
        const tr = document.createElement('tr');
        [d.name, d.localCurrent, d.localMin, d.localMax, d.globalAvg, d.globalVol, d.roiLocal.toFixed(2), d.roiGlobal.toFixed(2), d.craftMargin!=null ? d.craftMargin.toFixed(2) : '-']
          .forEach(val => { const td = document.createElement('td'); td.textContent = val; tr.appendChild(td); });
        tbody.appendChild(tr);
      });
  }

  function parseAux(text) {
    console.group('Parsing Aux');
    const history = {}, post = {};
    const histMatch = /"history"\s*=\s*{([\s\S]*?)\n\s*},/m.exec(text);
    if (histMatch) {
      histMatch[1].split(/[\r\n,]+/).forEach(line => {
        const m = line.match(/"(\d+:\d+)"\s*=\s*"[^0-9]*(\d+)(?:#|$)/);
        if (m) {
          history[m[1]] = history[m[1]] || [];
          history[m[1]].push(Number(m[2]));
        }
      });
      console.log(`Found history block (${Object.keys(history).length} items)`);
    } else console.warn('No ["history"] block found');
    const postMatch = /"post"\s*=\s*{([\s\S]*?)\n\s*},/m.exec(text);
    if (postMatch) {
      postMatch[1].split(/[\r\n,]+/).forEach(line => {
        const m = line.match(/"(\d+:\d+)"\s*=\s*"[^0-9]*(?:\d+)#(\d+)/);
        if (m) post[m[1]] = Number(m[2]);
      });
      console.log(`Found post block (${Object.keys(post).length} items)`);
    } else console.warn('No ["post"] block found');
    console.groupEnd();
    return { history, post };
  }
})();
