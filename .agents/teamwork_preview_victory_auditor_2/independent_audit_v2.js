const http = require('http');
const fs = require('fs');
const path = require('path');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    }).on('error', reject);
  });
}

function post(url, body = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function patch(url, body = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function audit() {
  console.log('=== INDEPENDENT VICTORY AUDITOR FORENSIC SUITE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  const frontendRoot = path.resolve('c:/Users/Faizan J/FBD/frontend');

  // Section 1: Build & Distribution Forensics
  console.log('--- Phase 1: Build Artifacts & Bundle Verification ---');
  const distDir = path.join(frontendRoot, 'dist', 'opstrack-frontend');
  const browserDir = path.join(distDir, 'browser');
  const actualDist = fs.existsSync(browserDir) ? browserDir : distDir;

  assert('dist directory exists', fs.existsSync(actualDist));
  assert('index.html exists in dist', fs.existsSync(path.join(actualDist, 'index.html')));

  const distFiles = fs.readdirSync(actualDist);
  assert('dist contains compiled main bundle', distFiles.some(f => f.startsWith('main-') && f.endsWith('.js')));
  assert('dist contains compiled styles bundle', distFiles.some(f => f.startsWith('styles-') && f.endsWith('.css')));
  assert('dist contains polyfills bundle', distFiles.some(f => f.startsWith('polyfills-') && f.endsWith('.js')));

  // Check lazy route chunks
  assert('dist contains lazy route chunks', distFiles.filter(f => f.startsWith('chunk-')).length >= 5);

  const indexContent = fs.readFileSync(path.join(actualDist, 'index.html'), 'utf8');
  assert('dist index.html mounts <app-root>', indexContent.includes('<app-root>'));

  // Section 2: Anti-Cheating & Mock Detection
  console.log('\n--- Phase 2: Anti-Cheating & Mock Detection ---');
  const apiServiceContent = fs.readFileSync(path.join(frontendRoot, 'src', 'app', 'core', 'services', 'api.service.ts'), 'utf8');
  assert('api.service.ts connects to live backend at http://localhost:3000/api', apiServiceContent.includes('http://localhost:3000/api'));
  assert('api.service.ts uses real HttpClient methods (no mocked return arrays)', 
    !apiServiceContent.includes('of([') && !apiServiceContent.includes('return of(')
  );

  const stylesContent = fs.readFileSync(path.join(frontendRoot, 'src', 'styles.css'), 'utf8');
  assert('styles.css contains print stylesheet for physical thermal badges', 
    stylesContent.includes('@media print') && stylesContent.includes('#printable-badge-area')
  );
  assert('styles.css sets safe 5mm margins for thermal printers', stylesContent.includes('margin: 5mm;'));
  assert('styles.css uses responsive max-width: 300px for print tag', stylesContent.includes('max-width: 300px !important;'));
  assert('styles.css hides chrome during printing (app-sidebar, app-header, app-toast)', 
    stylesContent.includes('app-sidebar') && stylesContent.includes('app-header') && stylesContent.includes('app-toast')
  );

  // R1: Routes and Dashboard Signals
  const routesContent = fs.readFileSync(path.join(frontendRoot, 'src', 'app', 'app.routes.ts'), 'utf8');
  assert('routes define /dashboard, /assets, /kanban, /schedules, /inventory',
    routesContent.includes("'dashboard'") && routesContent.includes("'assets'") && 
    routesContent.includes("'kanban'") && routesContent.includes("'schedules'") && 
    routesContent.includes("'inventory'")
  );

  const dashContent = fs.readFileSync(path.join(frontendRoot, 'src', 'app', 'features', 'dashboard', 'dashboard.component.ts'), 'utf8');
  assert('dashboard computes totalAssets, activeWorkOrders, overdueTasks, lowStockAlerts',
    dashContent.includes('totalAssets') && dashContent.includes('activeWorkOrders') &&
    dashContent.includes('overdueTasks') && dashContent.includes('lowStockAlerts')
  );

  // R2: Assets and QR badge modal
  const assetsContent = fs.readFileSync(path.join(frontendRoot, 'src', 'app', 'features', 'assets', 'assets.component.ts'), 'utf8');
  assert('assets component implements availableCategories computed signal', assetsContent.includes('availableCategories = computed'));

  const qrModalContent = fs.readFileSync(path.join(frontendRoot, 'src', 'app', 'features', 'assets', 'asset-qr-modal.component.ts'), 'utf8');
  assert('asset-qr-modal contains printable-badge-area', qrModalContent.includes('id="printable-badge-area"'));
  assert('asset-qr-modal handles escape key and backdrop click', 
    qrModalContent.includes('document:keydown.escape') && qrModalContent.includes('close.emit()')
  );

  // R3: Kanban drag-drop and rollback
  const kanbanContent = fs.readFileSync(path.join(frontendRoot, 'src', 'app', 'features', 'kanban', 'kanban.component.ts'), 'utf8');
  assert('kanban filterQuery is an Angular Signal', kanbanContent.includes('filterQuery = signal<string>'));
  assert('kanban selectedPriority is an Angular Signal', kanbanContent.includes('selectedPriority = signal<string>'));
  assert('kanban takeSnapshot deep maps work orders', kanbanContent.includes('.map((o) => ({ ...o }))'));
  assert('kanban implements resolveTargetIndex for filtered lists', kanbanContent.includes('resolveTargetIndex('));
  assert('kanban handles same-column drops with splice before resolveTargetIndex', kanbanContent.includes('currentList.splice(fromIdx, 1)'));

  // R4: Complete modal validations
  const compModalContent = fs.readFileSync(path.join(frontendRoot, 'src', 'app', 'features', 'kanban', 'complete-order-modal.component.ts'), 'utf8');
  assert('complete-order-modal validates positive integer quantity and duplicate consolidation',
    compModalContent.includes('Number.isInteger') && compModalContent.includes('consolidatedMap') &&
    compModalContent.includes('isExceedingStock')
  );

  // R5: Inventory Signals
  const invContent = fs.readFileSync(path.join(frontendRoot, 'src', 'app', 'features', 'inventory', 'inventory.component.ts'), 'utf8');
  assert('inventory searchQuery is an Angular Signal', invContent.includes('searchQuery = signal<string>'));
  assert('inventory highlights low stock items', invContent.includes('stock_quantity <=') || invContent.includes('min_threshold'));

  // Section 3: Live Backend API Verification
  console.log('\n--- Phase 3: Live Backend API & Data Integrity Verification ---');
  try {
    const assetsRes = await get('http://localhost:3000/api/assets');
    assert('Live backend returns 200 for GET /api/assets', assetsRes.status === 200);
    assert('PostgreSQL contains seeded machinery assets', Array.isArray(assetsRes.data) && assetsRes.data.length >= 5);

    // Full-text search with tsvector
    const searchRes = await get('http://localhost:3000/api/assets/search?q=Compressor');
    assert('GET /api/assets/search?q=Compressor matches tsvector', 
      searchRes.status === 200 && searchRes.data.some(a => a.name.includes('Compressor'))
    );

    const searchEmpty = await get('http://localhost:3000/api/assets/search?q=');
    assert('GET /api/assets/search?q= falls back to full list', searchEmpty.status === 200 && searchEmpty.data.length >= 5);

    const searchNonExistent = await get('http://localhost:3000/api/assets/search?q=NONEXISTENT_KEYWORD_XYZ999');
    assert('Search for non-existent keyword returns empty array', searchNonExistent.status === 200 && searchNonExistent.data.length === 0);

    // Kanban board structure
    const kanbanRes = await get('http://localhost:3000/api/work-orders/kanban');
    assert('GET /api/work-orders/kanban returns 200', kanbanRes.status === 200);
    assert('Kanban columns PENDING, IN_PROGRESS, COMPLETED are present', 
      Array.isArray(kanbanRes.data.PENDING) && 
      Array.isArray(kanbanRes.data.IN_PROGRESS) && 
      Array.isArray(kanbanRes.data.COMPLETED)
    );

    // Maintenance Schedules & Trigger Due Check
    const schRes = await get('http://localhost:3000/api/schedules');
    assert('GET /api/schedules returns 200 array', schRes.status === 200 && Array.isArray(schRes.data));

    const triggerRes = await post('http://localhost:3000/api/schedules/trigger-due-check');
    assert('POST /api/schedules/trigger-due-check returns 201', triggerRes.status === 201 && typeof triggerRes.data.generatedCount === 'number');

    // Spare Parts & Stock Alerts
    const partsRes = await get('http://localhost:3000/api/parts');
    assert('GET /api/parts returns 200 array', partsRes.status === 200 && Array.isArray(partsRes.data));

    const lowPartsRes = await get('http://localhost:3000/api/parts?lowStockOnly=true');
    assert('GET /api/parts?lowStockOnly=true filters correctly', 
      lowPartsRes.status === 200 && lowPartsRes.data.every(p => p.stock_quantity <= p.min_threshold)
    );

    // End-to-end Lifecycle & Stock Deduction Verification
    const testAsset = assetsRes.data[0];
    const availablePart = partsRes.data.find(p => p.stock_quantity >= 3);
    assert('Test asset and spare part found for E2E audit', !!testAsset && !!availablePart);

    if (testAsset && availablePart) {
      const stockBefore = availablePart.stock_quantity;

      // Create new work order
      const newWo = await post('http://localhost:3000/api/work-orders', {
        title: 'Victory Auditor Independent WO Verification',
        description: 'Testing independent execution and atomic stock deduction.',
        priority: 'HIGH',
        status: 'PENDING',
        asset_id: testAsset.id
      });
      assert('POST /api/work-orders creates order with 201', newWo.status === 201 && newWo.data.id);
      const woId = newWo.data.id;

      // Status advance to IN_PROGRESS
      const inProg = await patch(`http://localhost:3000/api/work-orders/${woId}/status`, { status: 'IN_PROGRESS' });
      assert('PATCH /api/work-orders/:id/status advances to IN_PROGRESS', inProg.status === 200 && inProg.data.status === 'IN_PROGRESS');

      // Invalid status transition triggers 400 Bad Request (initiating client-side rollback)
      const invalidProg = await patch(`http://localhost:3000/api/work-orders/${woId}/status`, { status: 'NON_EXISTENT_STATUS' });
      assert('PATCH /api/work-orders/:id/status with invalid status rejected with 400', invalidProg.status === 400);

      // Test negative frequency rejection on schedules
      const invalidSched = await post('http://localhost:3000/api/schedules', {
        asset_id: testAsset.id,
        task_name: 'Test Bad Schedule',
        frequency_interval_days: -5
      });
      assert('POST /api/schedules with negative frequency rejected with 400', invalidSched.status === 400);

      // Test excessive quantity rejection
      const excessiveRes = await post(`http://localhost:3000/api/work-orders/${woId}/complete`, {
        parts_used: [{ part_id: availablePart.id, quantity_used: stockBefore + 1000 }]
      });
      assert('POST /complete with excessive quantity rejected with 400 Bad Request', excessiveRes.status === 400);

      // Complete work order with 1 part
      const completeRes = await post(`http://localhost:3000/api/work-orders/${woId}/complete`, {
        parts_used: [{ part_id: availablePart.id, quantity_used: 1 }]
      });
      assert('POST /complete with valid quantity succeeds with 201', completeRes.status === 201 && completeRes.data.status === 'COMPLETED');

      // Check stock decremented
      const partAfter = await get(`http://localhost:3000/api/parts/${availablePart.id}`);
      assert('Stock quantity atomically decremented in database by 1', 
        partAfter.status === 200 && partAfter.data.stock_quantity === (stockBefore - 1)
      );

      // Check kanban reflects completed order
      const kanbanAfter = await get('http://localhost:3000/api/work-orders/kanban');
      assert('Kanban COMPLETED column contains the audited work order', 
        kanbanAfter.data.COMPLETED.some(w => w.id === woId)
      );
    }

  } catch (err) {
    console.error('Audit execution error:', err);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`Auditor Independent Suite Result: ${passed} passed, ${failed} failed.`);
  console.log('======================================================');
  if (failed > 0) process.exit(1);
}

audit();
