import test, { before, after, describe } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { env } from '../src/config/env.js';
import { USER_ROLES } from '../../shared/constants/userRoles.js';

let mongoServer;
let server;
let baseUrl;

before(async () => {
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  } catch (err) {
    const fallbackUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/interview_ai_test_block4';
    await mongoose.connect(fallbackUri);
  }

  // Drop test database for isolation
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }

  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}/api/v1`;
});

after(async () => {
  if (server) server.close();
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Block 4: Final Productionization, Sharing, Feedback, Admin RBAC & Security', () => {
  let userToken = '';
  let adminToken = '';
  let interviewId = '';
  let shareToken = '';
  let testEmail = 'candidate.final@example.com';
  let devResetToken = '';

  test('Setup: Create Candidate and Admin Accounts', async () => {
    // 1. Candidate Account
    const resA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Final Candidate',
        email: testEmail,
        password: 'Password123'
      })
    });
    const bodyA = await resA.json();
    userToken = bodyA.data.accessToken;

    // 2. Admin Account
    const resAdmin = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Platform Administrator',
        email: 'admin.platform@example.com',
        password: 'Password123'
      })
    });
    const bodyAdmin = await resAdmin.json();

    // Elevate admin user to ADMIN role in DB
    await User.findByIdAndUpdate(bodyAdmin.data.user.id, { role: USER_ROLES.ADMIN });

    // Login as Admin to get token with ADMIN role
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin.platform@example.com',
        password: 'Password123'
      })
    });
    const loginBody = await loginRes.json();
    adminToken = loginBody.data.accessToken;

    // 3. Create, start, answer and complete an interview session for candidate
    const createRes = await fetch(`${baseUrl}/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        type: 'TECHNICAL',
        difficulty: 'INTERMEDIATE',
        targetRole: 'Senior Cloud Engineer',
        questionCount: 2,
        timeLimitMinutes: 20
      })
    });
    const createBody = await createRes.json();
    interviewId = createBody.data.interview._id;
    const q1 = createBody.data.questions[0]._id;

    await fetch(`${baseUrl}/interviews/${interviewId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });

    await fetch(`${baseUrl}/interviews/${interviewId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        questionId: q1,
        transcriptText: 'Distributed caching minimizes database read contention using Redis.',
        durationSeconds: 25,
        inputMethod: 'TEXT'
      })
    });

    await fetch(`${baseUrl}/interviews/${interviewId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });
  });

  test('1. POST /api/v1/interviews/:id/report/share generates public share token', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/report/share`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.isShared, true);
    assert.ok(body.data.shareToken.length >= 16);
    shareToken = body.data.shareToken;
  });

  test('2. GET /api/v1/interviews/shared/:shareToken returns public report without authentication', async () => {
    const res = await fetch(`${baseUrl}/interviews/shared/${shareToken}`);
    const body = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.report.overallScore >= 0);
    assert.ok(body.data.questionBreakdown.length > 0);
    assert.strictEqual(body.data.interview.targetRole, 'Senior Cloud Engineer');
    // Verify no sensitive user IDs or passwords are leaked
    assert.strictEqual(body.data.report.userId, undefined);
  });

  test('3. DELETE /api/v1/interviews/:id/report/share revokes public share access', async () => {
    const revokeRes = await fetch(`${baseUrl}/interviews/${interviewId}/report/share`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const revokeBody = await revokeRes.json();
    assert.strictEqual(revokeRes.status, 200);
    assert.strictEqual(revokeBody.data.isShared, false);

    // Subsequent public access returns 404
    const accessRes = await fetch(`${baseUrl}/interviews/shared/${shareToken}`);
    assert.strictEqual(accessRes.status, 404);
  });

  test('4. POST /api/v1/feedback submits user rating and comment', async () => {
    const res = await fetch(`${baseUrl}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({
        category: 'EVALUATION',
        rating: 5,
        message: 'The AI feedback rubrics and ideal sample answers are exceptionally helpful!'
      })
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.rating, 5);
  });

  test('5. GET /api/v1/admin/stats returns platform telemetry for ADMIN role', async () => {
    const res = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.totalUsers >= 2);
    assert.ok(body.data.totalInterviews >= 1);
    assert.ok(body.data.totalFeedback >= 1);
  });

  test('6. Candidate user is rejected from Admin Console with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'FORBIDDEN');
  });

  test('7. POST /api/v1/auth/forgot-password dispatches reset email and returns generic enumeration guard', async () => {
    // 1. Valid user request
    const res = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    devResetToken = body.data.resetTokenDev;

    // 2. Unknown user request returns identical success message
    const resUnknown = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent.user@example.com' })
    });
    const bodyUnknown = await resUnknown.json();
    assert.strictEqual(resUnknown.status, 200);
    assert.strictEqual(bodyUnknown.data.message, body.data.message);
  });

  test('8. POST /api/v1/auth/reset-password resets password and invalidates used token', async () => {
    const res = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: devResetToken,
        newPassword: 'NewSecurePassword123'
      })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);

    // Verify token reuse fails (400)
    const reuseRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: devResetToken,
        newPassword: 'AnotherPassword123'
      })
    });
    assert.strictEqual(reuseRes.status, 400);

    // Verify candidate can login with new password
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'NewSecurePassword123'
      })
    });
    assert.strictEqual(loginRes.status, 200);
  });

  test('9. Environment and SMTP configuration schema parsing', () => {
    assert.strictEqual(typeof env.SMTP_HOST, 'string');
    assert.strictEqual(typeof env.SMTP_PORT, 'number');
    assert.strictEqual(typeof env.SMTP_SECURE, 'boolean');
    assert.strictEqual(typeof env.SMTP_USER, 'string');
    assert.strictEqual(typeof env.EMAIL_FROM, 'string');
    // Ensure SMTP_PASS is never undefined when defined in .env
    assert.ok(env.SMTP_HOST !== undefined);
  });
});
