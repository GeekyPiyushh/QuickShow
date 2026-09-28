const assert = require('assert');

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE END-TO-END TESTS ---');

  // Test 1: Invalid Login
  console.log('\n[Test 1] Testing invalid credentials handling...');
  const invRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'baduser@example.com', password: 'wrongpassword' }),
  });
  assert.strictEqual(invRes.status, 401, 'Invalid login should return status 401');
  const invData = await invRes.json();
  assert.strictEqual(invData.success, false, 'Invalid login response success should be false');
  console.log('✓ Invalid login correctly rejected with 401 and success: false');

  // Test 2: Normal User Registration
  const testEmail = `user_${Date.now()}@test.com`;
  console.log(`\n[Test 2] Testing normal user registration for ${testEmail}...`);
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: testEmail, password: 'password123' }),
  });
  assert.strictEqual(regRes.status, 201, 'Registration should return status 201');
  const regData = await regRes.json();
  assert.strictEqual(regData.success, true, 'Registration response should be success');
  console.log('✓ Normal user registration succeeded:', regData.user);

  // Test 3: Normal User Login
  console.log('\n[Test 3] Testing normal user login...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'password123' }),
  });
  assert.strictEqual(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.strictEqual(loginData.success, true);
  assert.ok(loginData.token, 'Token must exist in login response');
  assert.strictEqual(loginData.user.role, 'user', 'Role must be user');
  const userToken = loginData.token;
  console.log('✓ User login successful. Token acquired. Role: user');

  // Test 4: Refresh / Verify user session via /auth/me
  console.log('\n[Test 4] Testing session persistence via /auth/me...');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.strictEqual(meRes.status, 200);
  const meData = await meRes.json();
  assert.strictEqual(meData.user.email, testEmail);
  console.log('✓ Session verification succeeded for user:', meData.user.name);

  // Test 5: Unauthorized access to Admin endpoint by normal user
  console.log('\n[Test 5] Testing unauthorized access to admin endpoints by normal user...');
  const unauthRes = await fetch(`${BASE_URL}/bookings`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert.strictEqual(unauthRes.status, 403, 'Normal user must receive 403 Forbidden for admin endpoint');
  console.log('✓ Normal user correctly blocked from admin endpoint with 403 Forbidden');

  // Test 6: Admin Login
  console.log('\n[Test 6] Testing administrator login (admin@example.com)...');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }),
  });
  assert.strictEqual(adminLoginRes.status, 200);
  const adminData = await adminLoginRes.json();
  assert.strictEqual(adminData.success, true);
  assert.strictEqual(adminData.user.role, 'admin');
  const adminToken = adminData.token;
  console.log('✓ Admin login successful. Role: admin');

  // Test 7: Admin access to Admin Endpoints
  console.log('\n[Test 7] Testing admin access to /bookings and /users...');
  const adminBookingsRes = await fetch(`${BASE_URL}/bookings`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(adminBookingsRes.status, 200);
  const adminBookingsData = await adminBookingsRes.json();
  assert.ok(Array.isArray(adminBookingsData.bookings));
  console.log(`✓ Admin access granted. Current bookings count: ${adminBookingsData.bookings.length}`);

  const adminUsersRes = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(adminUsersRes.status, 200);
  const adminUsersData = await adminUsersRes.json();
  console.log(`✓ Admin users list accessed. Total registered users: ${adminUsersData.count}`);

  // Test 8: Admin creates a new Movie
  console.log('\n[Test 8] Testing admin adding a new movie...');
  const newMoviePayload = {
    title: 'Interstellar 2026 Remaster',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    genre: ['Adventure', 'Drama', 'Science Fiction'],
    language: 'English',
    duration: 169,
    releaseDate: '2026-10-01',
    poster: 'https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    rating: 8.7,
    status: 'now_showing'
  };
  const addMovieRes = await fetch(`${BASE_URL}/movies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify(newMoviePayload)
  });
  assert.strictEqual(addMovieRes.status, 201);
  const addMovieData = await addMovieRes.json();
  assert.strictEqual(addMovieData.success, true);
  const createdMovieId = addMovieData.movie._id;
  console.log(`✓ Movie created successfully by admin: "${addMovieData.movie.title}" (ID: ${createdMovieId})`);

  // Test 9: Public movie listing
  console.log('\n[Test 9] Testing public movie retrieval...');
  const moviesRes = await fetch(`${BASE_URL}/movies`);
  const moviesData = await moviesRes.json();
  const foundMovie = moviesData.movies.find(m => m._id === createdMovieId);
  assert.ok(foundMovie, 'Newly added movie must appear in public movies list');
  console.log('✓ Newly added movie verified in public movie catalog');

  // Test 10: User Books a Ticket
  console.log('\n[Test 10] Testing user booking tickets...');
  const showsRes = await fetch(`${BASE_URL}/shows`);
  const showsData = await showsRes.json();
  assert.ok(showsData.shows.length > 0, 'Shows must exist');
  const targetShow = showsData.shows[0];

  const bookingPayload = {
    show: targetShow,
    seats: ['F1', 'F2']
  };
  const bookRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify(bookingPayload)
  });
  assert.strictEqual(bookRes.status, 201);
  const bookData = await bookRes.json();
  assert.strictEqual(bookData.success, true);
  console.log(`✓ Booking confirmed for user: Booking ID: ${bookData.booking._id}, Amount: ₹${bookData.booking.totalAmount}`);

  // Test 11: User My Bookings
  console.log('\n[Test 11] Testing retrieval of user-specific bookings via /bookings/my...');
  const myBookingsRes = await fetch(`${BASE_URL}/bookings/my`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.strictEqual(myBookingsRes.status, 200);
  const myBookingsData = await myBookingsRes.json();
  assert.ok(myBookingsData.bookings.some(b => b._id === bookData.booking._id));
  console.log(`✓ User personal booking list includes new booking (${myBookingsData.bookings.length} booking(s))`);

  // Test 12: Admin sees updated bookings
  console.log('\n[Test 12] Testing updated admin bookings list...');
  const updatedAdminBookingsRes = await fetch(`${BASE_URL}/bookings`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const updatedAdminData = await updatedAdminBookingsRes.json();
  assert.ok(updatedAdminData.bookings.some(b => b._id === bookData.booking._id));
  console.log(`✓ Admin bookings list correctly includes the new customer booking`);

  console.log('\n======================================================');
  console.log(' ALL 12 END-TO-END TESTS PASSED SUCCESSFULLY! (100%)');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
