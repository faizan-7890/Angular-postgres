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

async function run() {
  console.log('=== OpsTrack Comprehensive Frontend Verification Suite ===\n');

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

  // 1. Verify build artifacts and print CSS
  console.log('--- 1. Checking Build Artifacts & Print CSS ---');
  const distDir = path.join(__dirname, 'dist', 'opstrack-frontend');
  const browserDir = path.join(distDir, 'browser');
  const targetDir = fs.existsSync(browserDir) ? browserDir : distDir;
  
  const indexHtml = path.join(targetDir, 'index.html');
  assert('dist index.html exists', fs.existsSync(indexHtml));
  if (fs.existsSync(indexHtml)) {
    const content = fs.readFileSync(indexHtml, 'utf8');
    assert('index.html contains app-root tag', content.includes('<app-root>'));
  }

  const stylesPath = path.join(__dirname, 'src', 'styles.css');
  if (fs.existsSync(stylesPath)) {
    const stylesContent = fs.readFileSync(stylesPath, 'utf8');
    assert('styles.css contains @media print rule', stylesContent.includes('@media print'));
    assert('styles.css makes #printable-badge-area visible in print', stylesContent.includes('#printable-badge-area'));
    assert('styles.css sets safe 5mm page margin for thermal printers', stylesContent.includes('margin: 5mm;'));
    assert('styles.css uses responsive max-width: 300px for print tag', stylesContent.includes('max-width: 300px !important;'));
    assert('styles.css centers badge with margin: 0 auto', stylesContent.includes('margin: 0 auto !important;'));
    assert('styles.css hides app-sidebar, app-header, app-toast in print', 
      stylesContent.includes('app-sidebar') && stylesContent.includes('app-header') && stylesContent.includes('app-toast')
    );
  }

  // 2. Check source components for architectural integrity and bug fixes
  console.log('\n--- 2. Checking Component Logic & Defensive Handling ---');
  const qrModalPath = path.join(__dirname, 'src', 'app', 'features', 'assets', 'asset-qr-modal.component.ts');
  if (fs.existsSync(qrModalPath)) {
    const qrModalContent = fs.readFileSync(qrModalPath, 'utf8');
    assert('asset-qr-modal does NOT hide modal container with no-print', !qrModalContent.includes('relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 no-print'));
    assert('asset-qr-modal contains printable-badge-area', qrModalContent.includes('id="printable-badge-area"'));
    assert('asset-qr-modal marks header as no-print', qrModalContent.includes('flex items-center justify-between pb-4 border-b border-slate-800 no-print'));
    assert('asset-qr-modal has Escape key listener', qrModalContent.includes('@HostListener(\'document:keydown.escape\')'));
    assert('asset-qr-modal has backdrop click handler', qrModalContent.includes('(click)="close.emit()"'));
    assert('asset-qr-modal uses reactive effect for QR regeneration', qrModalContent.includes('effect('));
    assert('asset-qr-modal uses print:static to prevent layout displacement', qrModalContent.includes('print:static'));
  }

  const kanbanPath = path.join(__dirname, 'src', 'app', 'features', 'kanban', 'kanban.component.ts');
  if (fs.existsSync(kanbanPath)) {
    const kanbanContent = fs.readFileSync(kanbanPath, 'utf8');
    assert('kanban onDrop uses item.id lookup for true source index', kanbanContent.includes('findIndex((item) => item.id === order.id)'));
    assert('kanban takeSnapshot deep maps work orders', kanbanContent.includes('.map((o) => ({ ...o }))'));
    assert('kanban implements resolveTargetIndex for filtered lists', kanbanContent.includes('resolveTargetIndex('));
    assert('kanban onDrop calls resolveTargetIndex for target placement', kanbanContent.includes('this.resolveTargetIndex('));
    assert('kanban onCompletionCancelled reverts snapshots', kanbanContent.includes('this.revertSnapshots()'));
    assert('kanban binds complete modal close to onCompletionCancelled', kanbanContent.includes('(close)="onCompletionCancelled()"'));
    assert('kanban filterQuery is an Angular Signal', kanbanContent.includes('filterQuery = signal<string>'));
    assert('kanban selectedPriority is an Angular Signal', kanbanContent.includes('selectedPriority = signal<string>'));
    assert('kanban same-column drop removes item before resolveTargetIndex', kanbanContent.includes('currentList.splice(fromIdx, 1)'));
  }

  // Unit-test resolveTargetIndex logic simulation
  const simulateResolveTargetIndex = (containerData, filteredList, currentIndex, draggedItem) => {
    const visibleWithoutDragged = filteredList.filter((item) => item.id !== draggedItem.id);
    if (visibleWithoutDragged.length === 0) return containerData.length;
    if (currentIndex <= 0) {
      const firstVisible = visibleWithoutDragged[0];
      const targetIdx = containerData.findIndex((item) => item.id === firstVisible.id);
      return targetIdx !== -1 ? targetIdx : 0;
    }
    if (currentIndex >= visibleWithoutDragged.length) {
      const lastVisible = visibleWithoutDragged[visibleWithoutDragged.length - 1];
      const targetIdx = containerData.findIndex((item) => item.id === lastVisible.id);
      return targetIdx !== -1 ? Math.min(targetIdx + 1, containerData.length) : containerData.length;
    }
    const nextVisible = visibleWithoutDragged[currentIndex];
    const targetIdx = containerData.findIndex((item) => item.id === nextVisible.id);
    return targetIdx !== -1 ? targetIdx : Math.min(currentIndex, containerData.length);
  };

  const mockContainer = [{ id: '1', p: 'LOW' }, { id: '2', p: 'HIGH' }, { id: '3', p: 'LOW' }, { id: '4', p: 'HIGH' }];
  const mockFiltered = [{ id: '2', p: 'HIGH' }, { id: '4', p: 'HIGH' }];
  const dragged = { id: '99', p: 'HIGH' };

  assert('resolveTargetIndex correctly resolves drop between filtered items', 
    simulateResolveTargetIndex(mockContainer, mockFiltered, 1, dragged) === 3
  );
  assert('resolveTargetIndex correctly resolves drop at top of filtered items', 
    simulateResolveTargetIndex(mockContainer, mockFiltered, 0, dragged) === 1
  );

  // Unit-test same-column re-ordering simulation under active filter
  const simulateSameColumnReorder = (fullList, filteredSlice, draggedItem, targetVisualIndex) => {
    const listCopy = [...fullList];
    const fromIdx = listCopy.findIndex(item => item.id === draggedItem.id);
    if (fromIdx !== -1) listCopy.splice(fromIdx, 1);
    const targetIdx = simulateResolveTargetIndex(listCopy, filteredSlice, targetVisualIndex, draggedItem);
    listCopy.splice(targetIdx, 0, draggedItem);
    return listCopy;
  };

  const testFull = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }, { id: 'E' }, { id: 'F' }];
  const testFilter = [{ id: 'B' }, { id: 'D' }, { id: 'F' }];
  const reorderForward = simulateSameColumnReorder(testFull, testFilter, { id: 'B' }, 1);
  const reorderForwardIds = reorderForward.map(x => x.id);
  assert('Same-column forward drag under active filter places B between D and F',
    reorderForwardIds.indexOf('D') < reorderForwardIds.indexOf('B') && 
    reorderForwardIds.indexOf('B') < reorderForwardIds.indexOf('F')
  );

  const reorderBackward = simulateSameColumnReorder(testFull, testFilter, { id: 'F' }, 0);
  const reorderBackwardIds = reorderBackward.map(x => x.id);
  assert('Same-column backward drag under active filter places F before B',
    reorderBackwardIds.indexOf('F') < reorderBackwardIds.indexOf('B')
  );

  const completeModalPath = path.join(__dirname, 'src', 'app', 'features', 'kanban', 'complete-order-modal.component.ts');
  if (fs.existsSync(completeModalPath)) {
    const compContent = fs.readFileSync(completeModalPath, 'utf8');
    assert('complete-order-modal validates consumed part quantity > 0', compContent.includes('Number(r.quantity_used) <= 0'));
    assert('complete-order-modal enforces integer quantities', compContent.includes('Number.isInteger'));
    assert('complete-order-modal consolidates duplicate part rows', compContent.includes('consolidatedMap'));
    assert('complete-order-modal has getTotalQuantityForPart cumulative helper', compContent.includes('getTotalQuantityForPart'));
    assert('complete-order-modal provides isExceedingStock warning helper', compContent.includes('isExceedingStock'));
    assert('complete-order-modal has Escape key listener', compContent.includes('@HostListener(\'document:keydown.escape\')'));
    assert('complete-order-modal has backdrop click handler', compContent.includes('(click)="handleCancel()"'));
  }

  const assetsPath = path.join(__dirname, 'src', 'app', 'features', 'assets', 'assets.component.ts');
  if (fs.existsSync(assetsPath)) {
    const assetsContent = fs.readFileSync(assetsPath, 'utf8');
    assert('assets.component implements availableCategories computed signal', assetsContent.includes('availableCategories = computed'));
    assert('assets.component renders dynamic category options', assetsContent.includes('@for (cat of availableCategories()'));
  }

  const invPath = path.join(__dirname, 'src', 'app', 'features', 'inventory', 'inventory.component.ts');
  if (fs.existsSync(invPath)) {
    const invContent = fs.readFileSync(invPath, 'utf8');
    assert('inventory searchQuery is an Angular Signal', invContent.includes('searchQuery = signal<string>'));
  }

  const partModalPath = path.join(__dirname, 'src', 'app', 'features', 'inventory', 'part-create-modal.component.ts');
  if (fs.existsSync(partModalPath)) {
    const partContent = fs.readFileSync(partModalPath, 'utf8');
    assert('part-create-modal validates integer stock', partContent.includes('Number.isInteger(Number(this.stockQuantity))'));
    assert('part-create-modal validates positive integer minThreshold', partContent.includes('Number.isInteger(Number(this.minThreshold))'));
  }

  const schModalPath = path.join(__dirname, 'src', 'app', 'features', 'schedules', 'schedule-create-modal.component.ts');
  if (fs.existsSync(schModalPath)) {
    const schContent = fs.readFileSync(schModalPath, 'utf8');
    assert('schedule-create-modal validates integer frequencyDays', schContent.includes('Number.isInteger(Number(this.frequencyDays))'));
  }

  const assetCreateModalPath = path.join(__dirname, 'src', 'app', 'features', 'assets', 'asset-create-modal.component.ts');
  if (fs.existsSync(assetCreateModalPath)) {
    const assetCreateContent = fs.readFileSync(assetCreateModalPath, 'utf8');
    assert('asset-create-modal validates warranty not earlier than purchase', assetCreateContent.includes('new Date(this.purchaseDate) > new Date(this.warrantyDate)'));
  }

  // Check escape key handlers on all modals
  const modalFiles = [
    'src/app/features/assets/asset-detail-modal.component.ts',
    'src/app/features/assets/asset-create-modal.component.ts',
    'src/app/features/kanban/work-order-modal.component.ts',
    'src/app/features/inventory/part-create-modal.component.ts',
    'src/app/features/schedules/schedule-create-modal.component.ts',
  ];
  for (const mf of modalFiles) {
    const fullPath = path.join(__dirname, mf);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const name = path.basename(mf, '.ts');
      assert(`${name} has Escape key listener`, content.includes('@HostListener(\'document:keydown.escape\')'));
      assert(`${name} has backdrop click handler`, content.includes('(click)="close.emit()"'));
    }
  }

  // 3. Verify Backend Live Integration
  console.log('\n--- 3. Checking Backend Live Endpoints & Operations ---');
  try {
    // 3.1 Assets
    const assetsRes = await get('http://localhost:3000/api/assets');
    assert('GET /api/assets returns 200 OK', assetsRes.status === 200);
    assert('GET /api/assets returns an array of assets', Array.isArray(assetsRes.data));
    console.log(`      Found ${assetsRes.data.length} equipment items.`);

    // 3.2 Full-text search
    const searchRes = await get('http://localhost:3000/api/assets/search?q=Compressor');
    assert('GET /api/assets/search?q=Compressor returns 200 OK', searchRes.status === 200);
    assert('Search returns matched assets via tsvector', Array.isArray(searchRes.data) && searchRes.data.length > 0);

    const searchCnc = await get('http://localhost:3000/api/assets/search?q=Milling');
    assert('GET /api/assets/search?q=Milling returns 200 OK', searchCnc.status === 200);
    assert('Search matches CNC Milling Machine', Array.isArray(searchCnc.data) && searchCnc.data.some(a => a.name.includes('Milling')));

    const searchEmpty = await get('http://localhost:3000/api/assets/search?q=');
    assert('GET /api/assets/search?q= returns all assets as fallback', searchEmpty.status === 200 && Array.isArray(searchEmpty.data) && searchEmpty.data.length >= 5);

    const searchNone = await get('http://localhost:3000/api/assets/search?q=XYZNONEXISTENT999');
    assert('Search for non-matching keyword returns empty array', searchNone.status === 200 && Array.isArray(searchNone.data) && searchNone.data.length === 0);

    // 3.3 Kanban Work Orders
    const kanbanRes = await get('http://localhost:3000/api/work-orders/kanban');
    assert('GET /api/work-orders/kanban returns 200 OK', kanbanRes.status === 200);
    assert('Kanban response contains PENDING, IN_PROGRESS, COMPLETED columns', 
      kanbanRes.data.PENDING !== undefined && 
      kanbanRes.data.IN_PROGRESS !== undefined && 
      kanbanRes.data.COMPLETED !== undefined
    );

    // 3.4 Schedules & Due-check trigger
    const schedulesRes = await get('http://localhost:3000/api/schedules');
    assert('GET /api/schedules returns 200 OK', schedulesRes.status === 200);
    assert('GET /api/schedules returns array', Array.isArray(schedulesRes.data));

    const dueSoonRes = await get('http://localhost:3000/api/schedules?dueSoonOnly=true');
    assert('GET /api/schedules?dueSoonOnly=true returns 200 OK', dueSoonRes.status === 200);

    const triggerRes = await post('http://localhost:3000/api/schedules/trigger-due-check');
    assert('POST /api/schedules/trigger-due-check returns 201 Created', triggerRes.status === 201);
    assert('trigger-due-check returns generatedCount number', typeof triggerRes.data.generatedCount === 'number');
    console.log(`      PM worker evaluated: ${triggerRes.data.generatedCount} work order(s) generated.`);

    // 3.5 Spare parts & Low-stock filter
    const partsRes = await get('http://localhost:3000/api/parts');
    assert('GET /api/parts returns 200 OK', partsRes.status === 200);
    assert('GET /api/parts returns array', Array.isArray(partsRes.data));

    const lowStockRes = await get('http://localhost:3000/api/parts?lowStockOnly=true');
    assert('GET /api/parts?lowStockOnly=true returns 200 OK', lowStockRes.status === 200);
    assert('Low stock filter returns items below threshold', Array.isArray(lowStockRes.data) && lowStockRes.data.every(p => p.stock_quantity <= p.min_threshold));

    // 4. End-to-End Work Order Lifecycle, Kanban Transitions, & Atomic Stock Deduction
    console.log('\n--- 4. Testing End-to-End Work Order Lifecycle & Atomic Consumption ---');
    const firstAsset = assetsRes.data[0];
    const availablePart = partsRes.data.find(p => p.stock_quantity >= 5);

    if (firstAsset && availablePart) {
      const initialStock = availablePart.stock_quantity;

      // 4.1 Create a new test work order in PENDING
      const createWoRes = await post('http://localhost:3000/api/work-orders', {
        title: 'E2E Lifecycle Verification Work Order',
        description: 'Automated verification test of status transition and parts consumption.',
        priority: 'MEDIUM',
        status: 'PENDING',
        asset_id: firstAsset.id,
      });

      assert('POST /api/work-orders creates new order in PENDING', createWoRes.status === 201 && createWoRes.data.status === 'PENDING');
      const testWoId = createWoRes.data?.id;

      if (testWoId) {
        // 4.2 Test Kanban Status PATCH (drag to IN_PROGRESS)
        const moveInProgRes = await patch(`http://localhost:3000/api/work-orders/${testWoId}/status`, { status: 'IN_PROGRESS' });
        assert('PATCH status to IN_PROGRESS succeeds', moveInProgRes.status === 200 && moveInProgRes.data.status === 'IN_PROGRESS');

        // 4.3 Test Excessive Quantity Rejection
        const excessiveQty = initialStock + 99999;
        const rejectRes = await post(`http://localhost:3000/api/work-orders/${testWoId}/complete`, {
          parts_used: [{ part_id: availablePart.id, quantity_used: excessiveQty }]
        });
        assert('POST /complete with excessive quantity fails with 400 Bad Request', rejectRes.status === 400);
        const errMsg = rejectRes.data?.message || rejectRes.text || '';
        assert('400 Bad Request contains Insufficient stock message', errMsg.includes('Insufficient stock'));

        // 4.4 Test Successful Atomic Completion with Stock Deduction
        const consumeQty = 1;
        const completeRes = await post(`http://localhost:3000/api/work-orders/${testWoId}/complete`, {
          parts_used: [{ part_id: availablePart.id, quantity_used: consumeQty }]
        });
        assert('POST /complete with valid quantity succeeds with 201 Created', completeRes.status === 201 && completeRes.data.status === 'COMPLETED');

        // 4.5 Verify Stock Quantity Decremented Atomically
        const updatedPartRes = await get(`http://localhost:3000/api/parts/${availablePart.id}`);
        assert('GET /api/parts/:id shows stock decremented by consumed quantity', 
          updatedPartRes.status === 200 && updatedPartRes.data.stock_quantity === (initialStock - consumeQty)
        );
        console.log(`      Stock for "${availablePart.name}": ${initialStock} -> ${updatedPartRes.data.stock_quantity} (decremented by ${consumeQty})`);

        // 4.6 Verify Kanban Board Reflects COMPLETED Status
        const updatedKanban = await get('http://localhost:3000/api/work-orders/kanban');
        const isCompletedInKanban = updatedKanban.data.COMPLETED.some(wo => wo.id === testWoId);
        assert('Kanban COMPLETED column contains the completed work order', isCompletedInKanban);

        // 4.7 Verify Status PATCH Rejection with Invalid Status (triggers optimistic rollback)
        const invalidPatchRes = await patch(`http://localhost:3000/api/work-orders/${testWoId}/status`, { status: 'INVALID_STATUS' });
        assert('PATCH status with invalid status fails with 400 Bad Request (triggers rollback)', invalidPatchRes.status === 400);

        // 4.8 Verify Server-Side Part Validation (rejects non-integer stock)
        const invalidPartRes = await post('http://localhost:3000/api/parts', {
          name: 'Invalid Floating Stock Part',
          sku: 'INV-FLOAT-99',
          stock_quantity: 3.14,
        });
        assert('POST /api/parts with non-integer stock fails with 400 Bad Request', invalidPartRes.status === 400);

        // 4.9 Verify Server-Side Schedule Validation (rejects non-positive frequency)
        const invalidSchRes = await post('http://localhost:3000/api/schedules', {
          asset_id: firstAsset.id,
          task_name: 'Invalid Frequency Task',
          frequency_interval_days: -10,
          next_due_date: '2026-10-01',
        });
        assert('POST /api/schedules with negative frequency fails with 400 Bad Request', invalidSchRes.status === 400);
      }
    }

  } catch (e) {
    console.error('Backend verification error:', e);
    failed++;
  }

  console.log(`\n======================================================`);
  console.log(`Verification Summary: ${passed} passed, ${failed} failed.`);
  console.log(`======================================================`);
  if (failed > 0) process.exit(1);
}

run();
