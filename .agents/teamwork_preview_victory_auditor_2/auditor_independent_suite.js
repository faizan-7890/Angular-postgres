const http = require('http');
const fs = require('fs');
const path = require('path');

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const reqOptions = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    let payload = null;
    if (body) {
      payload = typeof body === 'string' ? body : JSON.stringify(body);
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, data: parsed, text: data });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runIndependentAudit() {
  console.log('================================================================');
  console.log('   INDEPENDENT VICTORY AUDITOR FORENSIC & TEST EXECUTION SUITE   ');
  console.log('   Agent: teamwork_preview_victory_auditor_2                     ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const failures = [];

  function check(label, condition, details = '') {
    if (condition) {
      console.log([PASS] );
      passed++;
    } else {
      console.error([FAIL]  - );
      failed++;
      failures.push({ label, details });
    }
  }

  const frontendRoot = path.resolve(__dirname, '..', '..', 'frontend');
  const distBrowser = path.join(frontendRoot, 'dist', 'opstrack-frontend', 'browser');

  // --- SECTION 1: BUILD & DISTRIBUTION ASSETS FORENSICS ---
  console.log('\n--- SECTION 1: Production Artifacts & Print CSS Inspection ---');
  check('Dist browser directory exists', fs.existsSync(distBrowser));
  
  const indexHtmlPath = path.join(distBrowser, 'index.html');
  check('Compiled index.html exists', fs.existsSync(indexHtmlPath));
  if (fs.existsSync(indexHtmlPath)) {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    check('Compiled index.html mounts <app-root>', html.includes('<app-root>'));
  }

  // Locate compiled styles css
  const distFiles = fs.existsSync(distBrowser) ? fs.readdirSync(distBrowser) : [];
  const styleFile = distFiles.find(f => f.startsWith('styles-') && f.endsWith('.css'));
  check('Compiled styles bundle exists', !!styleFile);
  if (styleFile) {
    const cssContent = fs.readFileSync(path.join(distBrowser, styleFile), 'utf8');
    check('Print stylesheet contains @media print', cssContent.includes('@media print'));
    check('Print stylesheet styles #printable-badge-area', cssContent.includes('#printable-badge-area'));
    check('Print stylesheet defines 5mm margins for thermal labels', cssContent.includes('margin:5mm') || cssContent.includes('margin: 5mm'));
    check('Print stylesheet defines responsive max-width: 300px', cssContent.includes('300px'));
    check('Print stylesheet hides app-sidebar', cssContent.includes('app-sidebar'));
    check('Print stylesheet hides app-header', cssContent.includes('app-header'));
    check('Print stylesheet hides app-toast', cssContent.includes('app-toast'));
  }

  // --- SECTION 2: ARCHITECTURAL CODE INTEGRITY (R1 - R5) ---
  console.log('\n--- SECTION 2: Code Architecture & Anti-Cheating Forensics ---');

  // R1: Dashboard & Standalone Signals
  const routesPath = path.join(frontendRoot, 'src', 'app', 'app.routes.ts');
  const routesCode = fs.readFileSync(routesPath, 'utf8');
  check('Routes define /dashboard', routesCode.includes( path: dashboard ));
  check('Routes define /assets', routesCode.includes( path: assets ));
  check('Routes define /kanban', routesCode.includes( path: kanban ));
  check('Routes define /schedules', routesCode.includes( path: schedules ));
  check('Routes define /inventory', routesCode.includes( path: inventory ));

  const dashPath = path.join(frontendRoot, 'src', 'app', 'features', 'dashboard', 'dashboard.component.ts');
  const dashCode = fs.readFileSync(dashPath, 'utf8');
  check('Dashboard uses Angular Signals', dashCode.includes('signal<') || dashCode.includes('computed('));
  check('Dashboard computes totalAssets', dashCode.includes('totalAssets'));
  check('Dashboard computes activeWorkOrders', dashCode.includes('activeWorkOrders'));
  check('Dashboard computes overdueTasks', dashCode.includes('overdueTasks'));
  check('Dashboard computes lowStockAlerts', dashCode.includes('lowStockAlerts'));

  // R2: Asset Directory, Search & QR Badge
  const assetsCompPath = path.join(frontendRoot, 'src', 'app', 'features', 'assets', 'assets.component.ts');
  const assetsCode = fs.readFileSync(assetsCompPath, 'utf8');
  check('Assets component uses debounced search input', assetsCode.includes('debounceTime'));
  check('Assets component implements search query Signal', assetsCode.includes('searchQuery'));
  check('Assets component computes available categories', assetsCode.includes('availableCategories = computed'));

  const qrModalPath = path.join(frontendRoot, 'src', 'app', 'features', 'assets', 'asset-qr-modal.component.ts');
  const qrModalCode = fs.readFileSync(qrModalPath, 'utf8');
  check('QR Modal imports QRCode generator', qrModalCode.includes( qrcode) || qrModalCode.includes(qrcode));
  check('QR Modal isolates #printable-badge-area', qrModalCode.includes('id=printable-badge-area'));
  check('QR Modal has Escape key dismissal handler', qrModalCode.includes('document:keydown.escape'));
  check('QR Modal has backdrop dismissal handler', qrModalCode.includes('close.emit()'));

  // R3: Kanban Board CDK Drag-Drop & Rollback
  const kanbanCompPath = path.join(frontendRoot, 'src', 'app', 'features', 'kanban', 'kanban.component.ts');
  const kanbanCode = fs.readFileSync(kanbanCompPath, 'utf8');
  check('Kanban imports @angular/cdk/drag-drop', kanbanCode.includes('@angular/cdk/drag-drop'));
  check('Kanban has PENDING, IN_PROGRESS, COMPLETED columns', 
    kanbanCode.includes(PENDING) && kanbanCode.includes(IN_PROGRESS) && kanbanCode.includes(COMPLETED)
  );
  check('Kanban implements snapshot rollback on error', kanbanCode.includes('revertSnapshots') && kanbanCode.includes('takeSnapshot'));
  check('Kanban dispatches toast notification on error', kanbanCode.includes('toast.error'));
  check('Kanban uses resolveTargetIndex for filtered drag-and-drop', kanbanCode.includes('resolveTargetIndex'));

  // R4: Work Order Completion & Parts Consumption
  const completeModalPath = path.join(frontendRoot, 'src', 'app', 'features', 'kanban', 'complete-order-modal.component.ts');
  const completeModalCode = fs.readFileSync(completeModalPath, 'utf8');
  check('Complete Order Modal handles parts consumption', completeModalCode.includes('partsUsed') || completeModalCode.includes('parts_consumed'));
  check('Complete Order Modal validates integer quantities', completeModalCode.includes('Number.isInteger'));
  check('Complete Order Modal prevents non-positive quantities', completeModalCode.includes('<= 0'));
  check('Complete Order Modal consolidates duplicate parts', completeModalCode.includes('consolidatedMap') || completeModalCode.includes('quantity_used'));
  check('Complete Order Modal checks insufficient stock warning', completeModalCode.includes('isExceedingStock'));
  check('Complete Order Modal has Escape dismissal', completeModalCode.includes('document:keydown.escape'));

  // R5: Schedules & Inventory Low Stock
  const schedCompPath = path.join(frontendRoot, 'src', 'app', 'features', 'schedules', 'schedules.component.ts');
  const schedCode = fs.readFileSync(schedCompPath, 'utf8');
  check('Schedules component triggers due check worker', schedCode.includes('triggerDueCheck'));

  const invCompPath = path.join(frontendRoot, 'src', 'app', 'features', 'inventory', 'inventory.component.ts');
  const invCode = fs.readFileSync(invCompPath, 'utf8');
  check('Inventory highlights low stock threshold', invCode.includes('stock_quantity <=') || invCode.includes('min_threshold'));
  check('Inventory has low stock filter signal', invCode.includes('showLowStockOnly') || invCode.includes('lowStock'));

  // --- SECTION 3: LIVE BACKEND API & DATABASE INTERACTION ---
  console.log('\n--- SECTION 3: Live Backend API Execution & End-to-End Persistence ---');
  const baseUrl = 'http://localhost:3000/api';

  // 1. Assets API
  const assetsRes = await request(${baseUrl}/assets);
  check('GET /api/assets returns HTTP 200', assetsRes.status === 200);
  check('GET /api/assets returns equipment array', Array.isArray(assetsRes.data) && assetsRes.data.length > 0);

  // 2. Full-Text Search via tsvector
  const searchCompressor = await request(${baseUrl}/assets/search?q=Compressor);
  check('GET /api/assets/search?q=Compressor returns HTTP 200', searchCompressor.status === 200);
  check('Search matches Air Compressor via tsvector', 
    Array.isArray(searchCompressor.data) && searchCompressor.data.some(a => a.name.includes('Compressor'))
  );

  const searchNegative = await request(${baseUrl}/assets/search?q=NonExistentDeviceXYZ999);
  check('Search for nonexistent term returns empty array', 
    Array.isArray(searchNegative.data) && searchNegative.data.length === 0
  );

  // 3. Kanban Board API
  const kanbanRes = await request(${baseUrl}/work-orders/kanban);
  check('GET /api/work-orders/kanban returns HTTP 200', kanbanRes.status === 200);
  check('Kanban board has PENDING array', Array.isArray(kanbanRes.data?.PENDING));
  check('Kanban board has IN_PROGRESS array', Array.isArray(kanbanRes.data?.IN_PROGRESS));
  check('Kanban board has COMPLETED array', Array.isArray(kanbanRes.data?.COMPLETED));

  // 4. Create Work Order, PATCH status, Rollback validation
  const assetId = assetsRes.data[0].id;
  const newWoRes = await request(${baseUrl}/work-orders, { method: 'POST' }, {
    title: 'Auditor Verification Order ' + Date.now(),
    description: 'Autonomous audit test order',
    priority: 'HIGH',
    asset_id: assetId
  });
  check('POST /api/work-orders creates order', newWoRes.status === 201 && !!newWoRes.data?.id);
  const testOrderId = newWoRes.data?.id;

  if (testOrderId) {
    // Transition to IN_PROGRESS
    const patchProg = await request(${baseUrl}/work-orders//status, { method: 'PATCH' }, {
      status: 'IN_PROGRESS'
    });
    check('PATCH /api/work-orders/:id/status to IN_PROGRESS succeeds', patchProg.status === 200 && patchProg.data?.status === 'IN_PROGRESS');

    // Attempt invalid status transition -> must return 400 Bad Request
    const patchInvalid = await request(${baseUrl}/work-orders//status, { method: 'PATCH' }, {
      status: 'BOGUS_STATUS'
    });
    check('PATCH /api/work-orders/:id/status with invalid status returns HTTP 400', patchInvalid.status === 400);

    // 5. Parts Consumption & Atomic Inventory Decrement
    const partsRes = await request(${baseUrl}/parts);
    check('GET /api/parts returns spare parts array', Array.isArray(partsRes.data) && partsRes.data.length > 0);
    
    if (Array.isArray(partsRes.data) && partsRes.data.length > 0) {
      const targetPart = partsRes.data[0];
      const initialStock = targetPart.stock_quantity;

      // Attempt completion with excessive quantity
      const overCompleteRes = await request(${baseUrl}/work-orders//complete, { method: 'POST' }, {
        parts_consumed: [{ part_id: targetPart.id, quantity_used: 999999 }]
      });
      check('POST /complete with excessive quantity fails with HTTP 400', overCompleteRes.status === 400);
      check('Error message identifies insufficient stock', 
        JSON.stringify(overCompleteRes.data).toLowerCase().includes('insufficient stock')
      );

      // Complete with valid quantity: 1
      const validCompleteRes = await request(${baseUrl}/work-orders//complete, { method: 'POST' }, {
        parts_consumed: [{ part_id: targetPart.id, quantity_used: 1 }]
      });
      check('POST /complete with valid quantity succeeds with HTTP 201', validCompleteRes.status === 201);
      check('Completed order has status COMPLETED', validCompleteRes.data?.status === 'COMPLETED');

      // Verify stock in database was decremented atomically
      const updatedPartRes = await request(${baseUrl}/parts/);
      check('Spare part stock decremented by exactly 1', 
        updatedPartRes.status === 200 && updatedPartRes.data?.stock_quantity === (initialStock - 1),
        Initial: , Updated: 
      );

      // Verify order appears in COMPLETED kanban column
      const updatedKanban = await request(${baseUrl}/work-orders/kanban);
      check('Completed order is now present in COMPLETED kanban column', 
        updatedKanban.data?.COMPLETED?.some(o => o.id === testOrderId)
      );
    }
  }

  // 6. PM Schedules Trigger
  const triggerRes = await request(${baseUrl}/schedules/trigger-due-check, { method: 'POST' }, {});
  check('POST /api/schedules/trigger-due-check returns HTTP 201', triggerRes.status === 201);
  check('Trigger due check returns generatedCount property', typeof triggerRes.data?.generatedCount === 'number');

  // 7. Low stock filter
  const lowStockRes = await request(${baseUrl}/parts?lowStockOnly=true);
  check('GET /api/parts?lowStockOnly=true returns HTTP 200', lowStockRes.status === 200);
  check('All returned parts in low stock query satisfy stock <= threshold', 
    Array.isArray(lowStockRes.data) && lowStockRes.data.every(p => p.stock_quantity <= p.min_threshold)
  );

  console.log('\n================================================================');
  console.log( AUDIT TEST RESULTS:  PASSED,  FAILED);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error('Failure Details:');
    failures.forEach(f => console.error( - : ));
    process.exit(1);
  } else {
    console.log('ALL INDEPENDENT CHECKS PASSED PERFECTLY.');
    process.exit(0);
  }
}

runIndependentAudit().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
