import { pool, query } from '../db';
import { hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';

const API_BASE = 'http://localhost:4000';

interface FetchResult<T = unknown> {
  status: number;
  data: T;
}

async function apiCall<T = unknown>(
  path: string,
  method: string = 'GET',
  body?: unknown,
  token?: string
): Promise<FetchResult<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json().catch(() => null)) as T;
  return { status: res.status, data };
}

async function runVerification() {
  console.log('=====================================================');
  console.log('CONFORMALGUARD: DEVELOPER ACCESS & REVOCATION TEST SUITE');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      if (detail) console.log(`       ${detail}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error(`       ${detail}`);
      failed++;
    }
  }

  const testSuffix = Date.now().toString().slice(-6);
  const adminEmail = `test_admin_${testSuffix}@cg.test`;
  const devEmail = `test_dev_${testSuffix}@cg.test`;
  const secondAdminEmail = `test_admin2_${testSuffix}@cg.test`;

  let adminUserId = '';
  let adminToken = '';
  let devUserId = '';
  let devToken = '';

  try {
    // Setup 1: Seed temporary test admin
    console.log('Setting up temporary test admin...');
    const hashedPw = await hashPassword('AdminSecurePass123!');
    const seedRes = await query<{ id: string }>(
      `INSERT INTO users (email, username, password_hash, role, must_change_password)
       VALUES ($1, $2, $3, 'admin', false)
       RETURNING id;`,
      [adminEmail, `admin_${testSuffix}`, hashedPw]
    );
    adminUserId = seedRes.rows[0].id;
    adminToken = signToken({ id: adminUserId, email: adminEmail, role: 'admin' });
    console.log(`Admin created: ${adminEmail} (ID: ${adminUserId})\n`);

    // TEST 1: Admin invites new account with role 'admin'
    console.log('--- TEST 1: Admin invites account with role admin ---');
    const inviteAdminRes = await apiCall<{ success: boolean; user: { id: string; email: string; role: string } }>(
      '/users/invite',
      'POST',
      { email: secondAdminEmail, username: `admin2_${testSuffix}`, role: 'admin' },
      adminToken
    );
    assert(
      inviteAdminRes.status === 201 && inviteAdminRes.data.user.role === 'admin',
      'Test 1: Admin successfully invites new admin account',
      `Status: ${inviteAdminRes.status}, Role: ${inviteAdminRes.data?.user?.role}`
    );

    // TEST 2: Admin invites new account with role 'developer'
    console.log('\n--- TEST 2: Admin invites account with role developer ---');
    const inviteDevRes = await apiCall<{ success: boolean; user: { id: string; email: string; role: string } }>(
      '/users/invite',
      'POST',
      { email: devEmail, username: `dev_${testSuffix}`, role: 'developer' },
      adminToken
    );
    assert(
      inviteDevRes.status === 201 && inviteDevRes.data.user.role === 'developer',
      'Test 2: Admin successfully invites developer account',
      `Status: ${inviteDevRes.status}, Role: ${inviteDevRes.data?.user?.role}, ID: ${inviteDevRes.data?.user?.id}`
    );
    devUserId = inviteDevRes.data.user.id;

    // Set developer password so developer can log in and get real token
    await query('UPDATE users SET password_hash = $1, must_change_password = false WHERE id = $2;', [
      hashedPw,
      devUserId,
    ]);
    const loginRes = await apiCall<{ token: string; user: { id: string; role: string } }>(
      '/auth/login',
      'POST',
      { email: devEmail, password: 'AdminSecurePass123!' }
    );
    devToken = loginRes.data.token;
    assert(
      loginRes.status === 200 && loginRes.data.user.role === 'developer',
      'Test 2b: Developer logs in and acquires valid JWT with role=developer',
      `Token issued with role: ${loginRes.data.user.role}`
    );

    // TEST 3: Invalid role rejection ('user' role or garbage role)
    console.log('\n--- TEST 3: Reject invite with role user or invalid role ---');
    const inviteUserRes = await apiCall<{ error: string }>(
      '/users/invite',
      'POST',
      { email: `invalid_user_${testSuffix}@cg.test`, role: 'user' },
      adminToken
    );
    assert(
      inviteUserRes.status === 400,
      "Test 3a: Invite with role='user' is rejected with 400 Bad Request",
      `Status: ${inviteUserRes.status}, Error: ${inviteUserRes.data.error}`
    );

    const inviteGarbageRes = await apiCall<{ error: string }>(
      '/users/invite',
      'POST',
      { email: `invalid_garbage_${testSuffix}@cg.test`, role: 'superuser' },
      adminToken
    );
    assert(
      inviteGarbageRes.status === 400,
      "Test 3b: Invite with role='superuser' is rejected with 400 Bad Request",
      `Status: ${inviteGarbageRes.status}, Error: ${inviteGarbageRes.data.error}`
    );

    // TEST 4: View Developer Access list
    console.log('\n--- TEST 4: View Developer Access list (excludes admins) ---');
    const devListRes = await apiCall<{ developers: Array<{ id: string; email: string }> }>(
      '/users/developers',
      'GET',
      undefined,
      adminToken
    );
    const devs = devListRes.data.developers || [];
    const containsDev = devs.some((d) => d.id === devUserId);
    const containsAdmin = devs.some((d) => d.id === adminUserId);
    assert(
      devListRes.status === 200 && containsDev && !containsAdmin,
      'Test 4: GET /users/developers returns developer and excludes admin accounts',
      `Developer count: ${devs.length}, Contains Dev: ${containsDev}, Contains Admin: ${containsAdmin}`
    );

    // TEST 8: RBAC Protection - Developer tries to access admin routes
    console.log('\n--- TEST 8: RBAC Protection - Developer cannot call admin endpoints ---');
    const devCallList = await apiCall('/users/developers', 'GET', undefined, devToken);
    assert(
      devCallList.status === 403,
      'Test 8a: Developer calling GET /users/developers is rejected with 403 Forbidden',
      `Status: ${devCallList.status}`
    );

    const devCallRevoke = await apiCall(`/users/${devUserId}/revoke-developer`, 'POST', undefined, devToken);
    assert(
      devCallRevoke.status === 403,
      'Test 8b: Developer calling POST /users/:userId/revoke-developer is rejected with 403 Forbidden',
      `Status: ${devCallRevoke.status}`
    );

    // TEST 7: Self-revoke prevention
    console.log('\n--- TEST 7: Self-revocation prevention ---');
    const selfRevokeRes = await apiCall<{ error: string }>(
      `/users/${adminUserId}/revoke-developer`,
      'POST',
      undefined,
      adminToken
    );
    assert(
      selfRevokeRes.status === 400,
      'Test 7: Admin attempting self-revocation is rejected with 400 Bad Request',
      `Status: ${selfRevokeRes.status}, Error: ${selfRevokeRes.data.error}`
    );

    // TEST PRE-CHECK FOR TEST 9: Verify developer token currently works on developer-only route
    console.log('\n--- PRE-CHECK FOR TEST 9: Developer token works prior to revocation ---');
    const preCheckRes = await apiCall('/widget-preferences', 'GET', undefined, devToken);
    assert(
      preCheckRes.status === 200,
      'Pre-Check: Developer JWT successfully accesses /widget-preferences',
      `Status: ${preCheckRes.status}`
    );

    // TEST 5: Revoke developer access
    console.log('\n--- TEST 5: Admin revokes developer access ---');
    const revokeRes = await apiCall<{ success: boolean; message: string }>(
      `/users/${devUserId}/revoke-developer`,
      'POST',
      undefined,
      adminToken
    );
    assert(
      revokeRes.status === 200 && revokeRes.data.success,
      'Test 5a: Revoke endpoint returns 200 OK',
      `Status: ${revokeRes.status}, Message: ${revokeRes.data.message}`
    );

    // Verify database role is now 'user'
    const dbRoleRes = await query<{ role: string }>('SELECT role FROM users WHERE id = $1;', [devUserId]);
    assert(
      dbRoleRes.rows[0]?.role === 'user',
      "Test 5b: Target user's role in PostgreSQL is now 'user'",
      `Database role: ${dbRoleRes.rows[0]?.role}`
    );

    // Verify developer_access_audit table row
    const auditRes = await query<{
      target_user_id: string;
      performed_by: string;
      previous_role: string;
      new_role: string;
      created_at: Date;
    }>(
      'SELECT target_user_id, performed_by, previous_role, new_role, created_at FROM developer_access_audit WHERE target_user_id = $1;',
      [devUserId]
    );
    const auditRow = auditRes.rows[0];
    assert(
      auditRes.rows.length === 1 &&
        auditRow.performed_by === adminUserId &&
        auditRow.previous_role === 'developer' &&
        auditRow.new_role === 'user',
      'Test 5c: developer_access_audit row correctly recorded in database',
      `Target: ${auditRow?.target_user_id}, Actor: ${auditRow?.performed_by}, ${auditRow?.previous_role} -> ${auditRow?.new_role}`
    );

    // TEST 6: Double-revoke prevention
    console.log('\n--- TEST 6: Double-revoke prevention ---');
    const doubleRevokeRes = await apiCall<{ error: string }>(
      `/users/${devUserId}/revoke-developer`,
      'POST',
      undefined,
      adminToken
    );
    assert(
      doubleRevokeRes.status === 400,
      'Test 6: Revoking an already-revoked user is rejected with 400 Bad Request',
      `Status: ${doubleRevokeRes.status}, Error: ${doubleRevokeRes.data.error}`
    );

    // TEST 9: INSTANT ACCESS DENIAL WITH EXISTING TOKEN
    console.log('\n--- TEST 9: CRITICAL TEST - Instant Access Denial with existing JWT ---');
    // Call developer-only route with the existing developer token (issued before revocation)
    const instantDenialRes = await apiCall<{ error: string }>(
      '/widget-preferences',
      'GET',
      undefined,
      devToken
    );
    assert(
      instantDenialRes.status === 403,
      'Test 9a: Existing developer JWT is IMMEDIATELY rejected with 403 Forbidden without waiting for token expiry',
      `Status: ${instantDenialRes.status}, Error: ${instantDenialRes.data.error}`
    );

    // Call /auth/me with existing developer token
    const meRes = await apiCall<{ user: { id: string; email: string; role: string } }>(
      '/auth/me',
      'GET',
      undefined,
      devToken
    );
    assert(
      meRes.status === 200 && meRes.data.user.role === 'user',
      "Test 9b: GET /auth/me reflects active 'user' role for existing token",
      `Status: ${meRes.status}, Active role: ${meRes.data.user.role}`
    );

    // Verify revoked user is no longer in GET /users/developers
    const devListAfterRes = await apiCall<{ developers: Array<{ id: string }> }>(
      '/users/developers',
      'GET',
      undefined,
      adminToken
    );
    const stillInList = (devListAfterRes.data.developers || []).some((d) => d.id === devUserId);
    assert(
      !stillInList,
      'Test 9c: Revoked developer is absent from GET /users/developers list',
      `Still in list: ${stillInList}`
    );
  } finally {
    // Cleanup temporary test data
    console.log('\nCleaning up temporary test accounts and audit entries...');
    if (devUserId) {
      await query('DELETE FROM developer_access_audit WHERE target_user_id = $1;', [devUserId]);
      await query('DELETE FROM users WHERE id = $1;', [devUserId]);
    }
    if (adminUserId) {
      await query('DELETE FROM users WHERE id = $1;', [adminUserId]);
    }
    await query('DELETE FROM users WHERE email = $1;', [secondAdminEmail]);
    console.log('Cleanup complete.');
    await pool.end();
  }

  console.log('\n=====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Test suite runner encountered unhandled error:', err);
  process.exit(1);
});
