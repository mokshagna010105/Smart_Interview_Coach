import test, { before, after, describe } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import app from '../src/app.js';

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
    // If memory server is unavailable, connect to test database URI
    const fallbackUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/interview_ai_test_auth';
    await mongoose.connect(fallbackUri);
  }

  // Clear test data to ensure test idempotency
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

describe('Block 1: Authentication, Profile & Resume Integration Tests', () => {
  let authToken = '';
  let refreshToken = '';
  let userId = '';

  const testUser = {
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    password: 'Password123'
  };

  test('1. POST /api/v1/auth/register registers user and returns access token', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.user.email, testUser.email);
    assert.ok(body.data.accessToken, 'Access token should be returned');
    assert.ok(body.data.refreshToken, 'Refresh token should be returned');

    authToken = body.data.accessToken;
    refreshToken = body.data.refreshToken;
    userId = body.data.user.id;
  });

  test('2. POST /api/v1/auth/register rejects duplicate email with 409 CONFLICT', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const body = await res.json();
    assert.strictEqual(res.status, 409);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'CONFLICT');
  });

  test('3. POST /api/v1/auth/login authenticates with correct credentials', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.accessToken);
    authToken = body.data.accessToken;
  });

  test('4. POST /api/v1/auth/login rejects invalid password with 401', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword99'
      })
    });

    const body = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'UNAUTHORIZED');
  });

  test('5. GET /api/v1/auth/me returns authenticated user identity', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.user.email, testUser.email);
    assert.strictEqual(body.data.profile.fullName, testUser.fullName);
  });

  test('6. GET /api/v1/profile returns user profile', async () => {
    const res = await fetch(`${baseUrl}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.fullName, testUser.fullName);
  });

  test('7. PUT /api/v1/profile updates target role, skills, and companies', async () => {
    const updateData = {
      targetRole: 'Senior Cloud Architect',
      experienceLevel: 'ADVANCED',
      targetCompanies: ['Google', 'Stripe'],
      primarySkills: ['Node.js', 'Kubernetes', 'AWS', 'Go']
    };

    const res = await fetch(`${baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify(updateData)
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.targetRole, 'Senior Cloud Architect');
    assert.strictEqual(body.data.experienceLevel, 'ADVANCED');
    assert.deepStrictEqual(body.data.primarySkills, ['Node.js', 'Kubernetes', 'AWS', 'Go']);
  });

  test('8. POST /api/v1/resumes/upload uploads and parses a text resume', async () => {
    const sampleResumeContent = `
Jane Doe
Email: jane.doe@example.com
Target Role: Senior Full Stack Engineer

Skills: JavaScript, React, Node.js, Express.js, MongoDB, Docker, AWS, System Design

Experience:
Senior Software Engineer at Tech Corp (2021 - 2024)
- Built distributed REST APIs and React frontends.

Education:
Bachelor of Science in Computer Science, Tech University, 2021

Key Projects:
Cloud Microservices Architecture
- Deployed containerized applications with Docker and AWS.
    `;

    const blob = new Blob([sampleResumeContent], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('resume', blob, 'jane_doe_resume.txt');

    const res = await fetch(`${baseUrl}/resumes/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      body: formData
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.originalFilename, 'jane_doe_resume.txt');
    assert.ok(body.data.parsedData.skills.includes('JavaScript'));
    assert.ok(body.data.parsedData.skills.includes('React'));
    assert.ok(body.data.parsedData.skills.includes('Node.js'));
    assert.strictEqual(body.data.isDefault, true);
  });

  test('8b. POST /api/v1/resumes/upload uploads and parses a real PDF resume', async () => {
    // Valid PDF byte stream containing technical skills text
    const samplePdfRaw = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj
4 0 obj<</Length 120>>stream
BT
/F1 12 Tf
100 700 Td
(Jane Doe Software Engineer Skills: Python, Docker, PostgreSQL, React, TypeScript) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000216 00000 n
trailer<</Size 5/Root 1 0 R>>
startxref
386
%%EOF`;

    const pdfBuffer = Buffer.from(samplePdfRaw, 'utf-8');
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('resume', blob, 'resume_sample.pdf');

    const res = await fetch(`${baseUrl}/resumes/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      body: formData
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.originalFilename, 'resume_sample.pdf');
    assert.strictEqual(body.data.mimeType, 'application/pdf');
    assert.ok(body.data.parsedData.skills.includes('Python'), 'Parsed skills should include Python');
    assert.ok(body.data.parsedData.skills.includes('Docker'), 'Parsed skills should include Docker');
    assert.ok(body.data.parsedData.skills.includes('PostgreSQL'), 'Parsed skills should include PostgreSQL');
  });

  test('9. GET /api/v1/resumes lists uploaded resumes for authenticated user', async () => {
    const res = await fetch(`${baseUrl}/resumes`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.length, 2);
  });

  test('10. POST /api/v1/auth/refresh-token refreshes access token', async () => {
    const res = await fetch(`${baseUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.accessToken);
  });

  test('11. POST /api/v1/auth/logout revokes refresh token', async () => {
    const res = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ refreshToken })
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
  });
});
