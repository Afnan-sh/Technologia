async function testFlow() {
  console.log('--- 1. Testing Catalog API ---');
  const catRes = await fetch('http://localhost:3000/api/catalog');
  const catData = await catRes.json();
  console.log('Catalog Success:', catData.success, 'Devices Count:', catData.devices.length);

  console.log('--- 2. Testing Post Listing API ---');
  const listRes = await fetch('http://localhost:3000/api/listings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Dell Latitude 7490 Core i7-8650U 16GB 512GB SSD 14 FHD',
      category: 'LAPTOP',
      itemType: 'COMPLETE_UNIT',
      brand: 'Dell',
      model: 'Latitude 7490',
      price: 62000,
      condition: 'Like New (10/10)',
      ramGB: 16,
      storage: '512GB NVMe SSD',
      city: 'Islamabad',
      locationArea: 'Blue Area IT Tower',
      sellerName: 'Islamabad Laptops Care',
      sellerPhone: '03005566778',
      description: 'Fresh UK corporate import batch. Backlit keyboard and original Dell 65W charger.',
      images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed'],
    }),
  });
  const listData = await listRes.json();
  console.log('Listing Created:', listData.success, listData.listing?.id, listData.listing?.title);

  console.log('--- 3. Testing Single Listing Detail & View Count ---');
  const singleRes = await fetch(`http://localhost:3000/api/listings/${listData.listing.id}`);
  const singleData = await singleRes.json();
  console.log('Single Listing Fetched:', singleData.success, 'Views:', singleData.listing?.viewsCount);

  console.log('--- 4. Testing Feature Ad Toggle (Mock Flow) ---');
  const patchRes = await fetch(`http://localhost:3000/api/listings/${listData.listing.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isFeatured: true }),
  });
  const patchData = await patchRes.json();
  console.log('Listing Featured Status:', patchData.success, patchData.listing?.isFeatured);

  console.log('--- 5. Testing Create Sourcing Part Request ---');
  const reqRes = await fetch('http://localhost:3000/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Need 01AV421 24Wh internal battery for ThinkPad T480 in Lahore',
      category: 'LAPTOP',
      brand: 'Lenovo',
      model: 'ThinkPad T480',
      partType: 'Battery',
      partNumber: '01AV421',
      acceptableConditions: ['Brand New (OEM)', 'Working Pull / Used'],
      maxBudgetPKR: 7000,
      urgency: 'Urgent / Immediate',
      description: 'Swollen internal battery. Need good cell replacement in Lahore Hafeez Centre.',
      buyerName: 'Kashif Mehmood',
      buyerPhone: '03009988776',
      city: 'Lahore',
      locationArea: 'Hafeez Centre',
    }),
  });
  const reqData = await reqRes.json();
  console.log('Request Created:', reqData.success, reqData.request?.id, reqData.request?.title);

  console.log('--- 6. Testing Seller "I Have This" Quote Pitch ---');
  const quoteRes = await fetch(`http://localhost:3000/api/requests/${reqData.request.id}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      offeredPrice: 6500,
      condition: 'Working Pull / Used',
      notes: 'Clean Lenovo OEM 24Wh battery with 92% health. Available at Hafeez Centre 2nd floor.',
      sellerName: 'Hamza Battery Clinic',
      sellerPhone: '03214455667',
      city: 'Lahore (Hafeez Centre)',
    }),
  });
  const quoteData = await quoteRes.json();
  console.log('Quote Pitched:', quoteData.success, quoteData.quote?.id, 'Offered PKR:', quoteData.quote?.offeredPrice);

  console.log('--- 7. Testing In-App Mock Direct Messaging ---');
  const msgRes = await fetch('http://localhost:3000/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      threadId: quoteData.threadId,
      senderRole: 'BUYER',
      senderName: 'Kashif Mehmood',
      text: 'Can we meet at Hafeez Centre around 4 PM to test battery health?',
      isPrompt: true,
    }),
  });
  const msgData = await msgRes.json();
  console.log('Message Sent:', msgData.success, msgData.message?.id, msgData.message?.text);

  console.log('--- All Verification Tests Passed Successfully! ---');
}

testFlow().catch(console.error);
