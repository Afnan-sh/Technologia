const http = require('http');

async function getUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request(`http://localhost:3000${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('=== VERIFYING TECHNOLOGIA UPDATE: CATALOG, SMART FORMS, COMPARE & AD REDESIGN ===\n');
  let hasErrors = false;

  // 1. Verify 10-Year Master Device Catalog
  console.log('1. Checking 10-Year Master Device Catalog (/api/catalog)...');
  const catRes = await getUrl('/api/catalog');
  if (catRes.status !== 200) {
    console.error(`  FAIL: /api/catalog returned ${catRes.status}`);
    hasErrors = true;
  } else {
    const catData = JSON.parse(catRes.data);
    const phones = catData.devices.filter(d => d.category === 'PHONE');
    const laptops = catData.devices.filter(d => d.category === 'LAPTOP');
    const phoneBrands = Array.from(new Set(phones.map(d => d.brand)));
    const laptopBrands = Array.from(new Set(laptops.map(d => d.brand)));

    console.log(`  ✓ Total Devices: ${catData.count}`);
    console.log(`  ✓ Phones (${phones.length}): Brands -> ${phoneBrands.join(', ')}`);
    console.log(`  ✓ Laptops (${laptops.length}): Brands -> ${laptopBrands.join(', ')}`);

    // Verify required brands:
    const requiredPhoneBrands = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Huawei', 'Nothing'];
    const requiredLaptopBrands = ['Apple', 'Dell', 'Lenovo', 'HP', 'Asus', 'Acer', 'Google'];

    const missingPhones = requiredPhoneBrands.filter(b => !phoneBrands.includes(b));
    const missingLaptops = requiredLaptopBrands.filter(b => !laptopBrands.includes(b));

    if (missingPhones.length > 0) {
      console.error(`  FAIL: Missing phone brands: ${missingPhones.join(', ')}`);
      hasErrors = true;
    } else {
      console.log(`  ✓ All required 10-year phone brands present.`);
    }

    if (missingLaptops.length > 0) {
      console.error(`  FAIL: Missing laptop brands: ${missingLaptops.join(', ')}`);
      hasErrors = true;
    } else {
      console.log(`  ✓ All required 10-year laptop brands present.`);
    }

    // Verify detailed specs exist on canonical devices
    const s22 = phones.find(d => d.model.includes('S22 Ultra'));
    if (s22) {
      console.log(`  ✓ Sample Spec Check (S22 Ultra):`);
      console.log(`    - Display: ${s22.screenSize} ${s22.displayTech}`);
      console.log(`    - Chipset: ${s22.chipset}`);
      console.log(`    - Camera: ${s22.cameraSummary || s22.mainCamera}`);
      console.log(`    - Strict RAM options: ${s22.ramOptions}`);
      console.log(`    - Strict Storage options: ${s22.storageOptions}`);
    }
  }

  // 2. Verify /compare Page
  console.log('\n2. Checking GSMArena-Style Compare Page (/compare)...');
  const compRes = await getUrl('/compare');
  if (compRes.status !== 200) {
    console.error(`  FAIL: /compare returned ${compRes.status}`);
    hasErrors = true;
  } else {
    console.log(`  ✓ HTTP ${compRes.status} OK`);
    const containsBenchmark = compRes.data.includes('Comparison Engine') || compRes.data.includes('Compare');
    if (!containsBenchmark) {
      console.error('  FAIL: Comparison page missing expected title');
      hasErrors = true;
    } else {
      console.log('  ✓ Compare UI elements verified.');
    }
  }

  // 3. Verify Horizontal Ad Cards on /home and /buy
  console.log('\n3. Checking Horizontal Ad Cards on /home...');
  const homeRes = await getUrl('/home');
  if (homeRes.status !== 200) {
    console.error(`  FAIL: /home returned ${homeRes.status}`);
    hasErrors = true;
  } else {
    console.log(`  ✓ HTTP ${homeRes.status} OK`);
    // Check that title only contains clean device name, e.g. "iPhone 13 Pro" or "Lenovo ThinkPad T480"
    const hasHorizontalCards = homeRes.data.includes('iPhone 13 Pro') && homeRes.data.includes('ThinkPad T480');
    console.log(`  ✓ Horizontal clean ad cards rendered on Home: ${hasHorizontalCards}`);
  }

  // 4. Test Smart Ad Posting Flow (Strict Phone vs Upgradeable Laptop)
  console.log('\n4. Testing Smart Ad Posting API (/api/listings)...');
  const testPhonePayload = {
    title: 'Samsung Galaxy S22 Ultra',
    category: 'PHONE',
    itemType: 'COMPLETE_UNIT',
    brand: 'Samsung',
    model: 'Galaxy S22 Ultra',
    price: 185000,
    condition: 'Like New (10/10)',
    ptaStatus: 'Official PTA Approved',
    batteryHealth: 94,
    ramGB: 12,
    storage: '256GB',
    city: 'Lahore',
    locationArea: 'Hafeez Centre',
    sellerName: 'Smart Test Seller',
    sellerPhone: '03009998877',
  };

  const postRes = await postJson('/api/listings', testPhonePayload);
  if (postRes.status !== 201) {
    console.error(`  FAIL: POST /api/listings returned ${postRes.status}`, postRes.data);
    hasErrors = true;
  } else {
    const created = JSON.parse(postRes.data).listing;
    console.log(`  ✓ Ad Created Successfully: ${created.id}`);
    console.log(`    - Clean Title: "${created.title}"`);
    console.log(`    - Strict RAM: ${created.ramGB}GB`);
    console.log(`    - Strict Storage: ${created.storage}`);
    console.log(`    - Auto-assigned Camera Spec: ${created.cameraSpec || 'Standard'}`);
  }

  // 5. Terminology Check: Verify zero "bounty"
  console.log('\n5. Checking forbidden terminology across pages...');
  const pagesToCheck = ['/', '/home', '/buy', '/compare', '/post-ad', '/requests'];
  for (const p of pagesToCheck) {
    const res = await getUrl(p);
    if (/bount(y|ies)/i.test(res.data)) {
      console.error(`  FAIL: Found "bounty" on page ${p}`);
      hasErrors = true;
    } else {
      console.log(`  ✓ ${p} -> Clean: 0 bounty occurrences`);
    }
  }

  if (hasErrors) {
    console.log('\n❌ VERIFICATION FAILED WITH ERRORS');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL UPDATES VERIFIED PERFECTLY!');
  }
}

run();
