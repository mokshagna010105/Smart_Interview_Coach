import test, { before, after, describe } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { INTERVIEW_STATUS } from '../../shared/constants/interviewStatuses.js';

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
    const fallbackUri = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/interview_ai_test_engine';
    await mongoose.connect(fallbackUri);
  }

  // Clean DB for isolation
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

describe('Block 2: Interview Engine Integration Tests', () => {
  let userAToken = '';
  let userBToken = '';
  let interviewId = '';
  let questionId = '';
  let secondQuestionId = '';

  // 1. Setup two test users
  test('Setup: Register Candidate A and Candidate B', async () => {
    const resA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Alice Developer',
        email: 'alice@example.com',
        password: 'Password123'
      })
    });
    const bodyA = await resA.json();
    userAToken = bodyA.data.accessToken;

    const resB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Bob Competitor',
        email: 'bob@example.com',
        password: 'Password123'
      })
    });
    const bodyB = await resB.json();
    userBToken = bodyB.data.accessToken;
  });

  test('1. POST /api/v1/interviews creates interview and generates validated question bank', async () => {
    const payload = {
      type: 'TECHNICAL',
      difficulty: 'INTERMEDIATE',
      targetRole: 'Full Stack Engineer',
      targetCompany: 'Google',
      skillsFocus: ['React', 'Node.js', 'MongoDB'],
      questionCount: 3,
      timeLimitMinutes: 20
    };

    const res = await fetch(`${baseUrl}/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`
      },
      body: JSON.stringify(payload)
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.interview.status, INTERVIEW_STATUS.READY);
    assert.strictEqual(body.data.interview.questionCount, 3);
    assert.strictEqual(body.data.questions.length, 3);
    assert.ok(body.data.questions[0].questionText.length > 10);
    assert.ok(body.data.questions[0].expectedTopics.length > 0);

    interviewId = body.data.interview._id;
    questionId = body.data.questions[0]._id;
    secondQuestionId = body.data.questions[1]._id;
  });

  test('2. POST /api/v1/interviews rejects invalid configuration with 400', async () => {
    const invalidPayload = {
      type: 'INVALID_TYPE',
      difficulty: 'SUPER_HARD',
      targetRole: '',
      questionCount: 99,
      timeLimitMinutes: 1
    };

    const res = await fetch(`${baseUrl}/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`
      },
      body: JSON.stringify(invalidPayload)
    });

    const body = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
  });

  test('3. Unauthenticated request to /api/v1/interviews is rejected with 401', async () => {
    const res = await fetch(`${baseUrl}/interviews`);
    const body = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'UNAUTHORIZED');
  });

  test('4. Candidate B cannot access or modify Candidate A interview (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}`, {
      headers: { Authorization: `Bearer ${userBToken}` }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'FORBIDDEN');
  });

  test('5. GET /api/v1/interviews/:id retrieves interview details and questions for owner', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}`, {
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.interview._id, interviewId);
    assert.strictEqual(body.data.questions.length, 3);
  });

  test('6. POST /api/v1/interviews/:id/start transitions state to IN_PROGRESS', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, INTERVIEW_STATUS.IN_PROGRESS);
    assert.ok(body.data.startedAt);
  });

  test('7. POST /api/v1/interviews/:id/pause transitions state to PAUSED', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/pause`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, INTERVIEW_STATUS.PAUSED);
  });

  test('8. POST /api/v1/interviews/:id/pause on already PAUSED interview returns 400', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/pause`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'INVALID_STATE');
  });

  test('9. POST /api/v1/interviews/:id/resume resumes interview to IN_PROGRESS', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, INTERVIEW_STATUS.IN_PROGRESS);
  });

  test('10. POST /api/v1/interviews/:id/answer submits answer and advances index', async () => {
    const answerPayload = {
      questionId,
      transcriptText: 'JavaScript Event Loop manages asynchronous concurrency using Call Stack and Task Queues.',
      durationSeconds: 45,
      inputMethod: 'TEXT'
    };

    const res = await fetch(`${baseUrl}/interviews/${interviewId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`
      },
      body: JSON.stringify(answerPayload)
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.answer.transcriptText, answerPayload.transcriptText);
    assert.strictEqual(body.data.interview.currentQuestionIndex, 1);
  });

  test('11. POST /api/v1/interviews/:id/skip skips second question and advances index', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/skip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`
      },
      body: JSON.stringify({ questionId: secondQuestionId })
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.answer.isSkipped, true);
    assert.strictEqual(body.data.interview.currentQuestionIndex, 2);
  });

  test('12. POST /api/v1/interviews/:id/complete transitions session to COMPLETED', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, INTERVIEW_STATUS.COMPLETED);
    assert.ok(body.data.completedAt);
  });

  test('13. POST /api/v1/interviews/:id/abandon on completed interview returns 400', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/abandon`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAToken}` }
    });
    const body = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'INVALID_STATE');
  });

  test('14. Abandoning an in-progress interview transitions to ABANDONED', async () => {
    // Create and start a new session
    const createRes = await fetch(`${baseUrl}/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userBToken}`
      },
      body: JSON.stringify({
        type: 'BEHAVIORAL',
        difficulty: 'BEGINNER',
        targetRole: 'Junior Developer',
        questionCount: 2,
        timeLimitMinutes: 10
      })
    });
    const createBody = await createRes.json();
    const newInterviewId = createBody.data.interview._id;

    await fetch(`${baseUrl}/interviews/${newInterviewId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userBToken}` }
    });

    const abandonRes = await fetch(`${baseUrl}/interviews/${newInterviewId}/abandon`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userBToken}` }
    });
    const abandonBody = await abandonRes.json();
    assert.strictEqual(abandonRes.status, 200);
    assert.strictEqual(abandonBody.data.status, INTERVIEW_STATUS.ABANDONED);
    assert.ok(abandonBody.data.abandonedAt);
  });
});
