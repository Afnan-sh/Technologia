const http = require('http');

async function testUrl(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== STARTING COMPLETE VERIFICATION OF TECHNOLOGIA ===\n');

  const routes = [
    { path: '/', name: 'Welcome Page', checkNoBounty: true },
    { path: '/home', name: 'Main Landing Page (3 Categorized Rows)', checkNoBounty: true },
    { path: '/buy', name: 'Buy Marketplace Page (Collapsible Filters)', checkNoBounty: true },
    { path: '/buy/laptops', name: 'Dedicated Laptops Sub-page (Context-Aware)', checkNoBounty: true },
    { path: '/buy/phones', name: 'Dedicated Phones Sub-page (Context-Aware)', checkNoBounty: true },
    { path: '/requests', name: 'View Requests Page (No Post CTA, Collapsible Filters)', checkNoBounty: true },
    { path: '/requests/laptops', name: 'Dedicated Laptop Requests Sub-page', checkNoBounty: true },
    { path: '/requests/phones', name: 'Dedicated Phone Requests Sub-page', checkNoBounty: true },
    { path: '/requests/new', name: 'Post Request Page (Sourcing Terminology)', checkNoBounty: true },
    { path: '/listings', name: 'Browse Listings Page', checkNoBounty: true },
    { path: '/messages', name: 'Direct Messages Mock View', checkNoBounty: true },
    { path: '/post-ad', name: 'Post Ad Form', checkNoBounty: true },
  ];

  let hasErrors = false;

  for (const r of routes) {
    try {
      const res = await testUrl(r.path);
      const is200 = res.status === 200;
      const containsBounty = /bount(y|ies)/i.test(res.data);

      console.log(`[${is200 ? 'PASS' : 'FAIL'}] ${r.name} (${r.path}) -> HTTP ${res.status}`);

      if (!is200) {
        console.error(`  ERROR: Expected 200, got ${res.status}`);
        hasErrors = true;
      }

      if (r.checkNoBounty && containsBounty) {
        console.error(`  ERROR: Found 'bounty' or 'bounties' in response HTML of ${r.path}!`);
        hasErrors = true;
      } else {
        console.log(`  ✓ Verified clean: Zero bounty terminology found.`);
      }

      // Check specific route requirements
      if (r.path === '/requests') {
        const hasPostButton = res.data.includes('Post Sourcing Request') || res.data.includes('Post Part Sourcing');
        if (hasPostButton) {
          console.error(`  ERROR: View Requests page contains a Post Sourcing Request button!`);
          hasErrors = true;
        } else {
          console.log(`  ✓ Verified: No 'Post Sourcing Request' button on View Requests page.`);
        }
      }

    } catch (e) {
      console.error(`[FAIL] ${r.name} (${r.path}) -> Error:`, e.message);
      hasErrors = true;
    }
  }

  console.log('\n=== TESTING API ENDPOINTS ===');
  const apiRes = await testUrl('/api/requests');
  console.log(`API /api/requests -> HTTP ${apiRes.status}`);
  const requestsData = JSON.parse(apiRes.data);
  console.log(`  Active Sourcing Requests count: ${requestsData.requests?.length}`);

  const listingsRes = await testUrl('/api/listings');
  console.log(`API /api/listings -> HTTP ${listingsRes.status}`);
  const listingsData = JSON.parse(listingsRes.data);
  console.log(`  Active Listings count: ${listingsData.listings?.length}`);

  if (hasErrors) {
    console.log('\n❌ VERIFICATION FAILED WITH ERRORS');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL VERIFICATIONS PASSED PERFECTLY!');
  }
}

run();
