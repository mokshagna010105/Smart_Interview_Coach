import test, { before, after, describe } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { detectFillerWords } from '../src/utils/fillerWordDetector.js';

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
    const fallbackUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/interview_ai_test';
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

describe('Block 3: AI Answer Evaluation, Reports & Analytics Tests', () => {
  let userTokenA = '';
  let userTokenB = '';
  let interviewId = '';
  let questionId1 = '';
  let questionId2 = '';
  let answerId1 = '';
  let skippedAnswerId = '';

  // 1. Setup candidate accounts & interview session
  test('Setup: Create Candidates and Interview Session', async () => {
    const resA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Elena Rostova',
        email: 'elena@example.com',
        password: 'Password123'
      })
    });
    const bodyA = await resA.json();
    userTokenA = bodyA.data.accessToken;

    const resB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Marcus Vance',
        email: 'marcus@example.com',
        password: 'Password123'
      })
    });
    const bodyB = await resB.json();
    userTokenB = bodyB.data.accessToken;

    // Create interview for Candidate A
    const interviewRes = await fetch(`${baseUrl}/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userTokenA}`
      },
      body: JSON.stringify({
        type: 'TECHNICAL',
        difficulty: 'INTERMEDIATE',
        targetRole: 'Backend Engineer',
        targetCompany: 'Google',
        skillsFocus: ['Node.js', 'MongoDB', 'Event Loop'],
        questionCount: 2,
        timeLimitMinutes: 20
      })
    });
    const interviewBody = await interviewRes.json();
    interviewId = interviewBody.data.interview._id;
    questionId1 = interviewBody.data.questions[0]._id;
    questionId2 = interviewBody.data.questions[1]._id;

    // Start interview
    await fetch(`${baseUrl}/interviews/${interviewId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userTokenA}` }
    });

    // Submit Answer 1 with filler words
    const answerRes = await fetch(`${baseUrl}/interviews/${interviewId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userTokenA}`
      },
      body: JSON.stringify({
        questionId: questionId1,
        transcriptText: 'Um, basically the JavaScript Event Loop manages the Call Stack and Microtask Queue like you know for asynchronous execution.',
        durationSeconds: 35,
        inputMethod: 'SPEECH'
      })
    });
    const answerBody = await answerRes.json();
    answerId1 = answerBody.data.answer._id;

    // Skip Question 2
    const skipRes = await fetch(`${baseUrl}/interviews/${interviewId}/skip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userTokenA}`
      },
      body: JSON.stringify({ questionId: questionId2 })
    });
    const skipBody = await skipRes.json();
    skippedAnswerId = skipBody.data.answer._id;
  });

  test('1. Unit Test: detectFillerWords utility identifies word counts and percentages', () => {
    const text = 'Um, actually basically I think like we should sort of optimize this, you know?';
    const result = detectFillerWords(text);

    assert.ok(result.totalCount >= 5, 'Should detect at least 5 filler occurrences');
    assert.ok(result.breakdown.um >= 1);
    assert.ok(result.breakdown.actually >= 1);
    assert.ok(result.breakdown.basically >= 1);
    assert.ok(result.fillerPercentage > 0);
  });

  test('2. POST /api/v1/interviews/:id/answers/:answerId/evaluate evaluates answer with rubrics', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/answers/${answerId1}/evaluate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userTokenA}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.overallScore >= 0 && body.data.overallScore <= 100);
    assert.ok(body.data.scores.relevance !== undefined);
    assert.ok(body.data.scores.correctness !== undefined);
    assert.ok(body.data.strengths.length > 0);
    assert.ok(body.data.feedback.length > 0);
    assert.ok(body.data.idealAnswer.length > 10);
    assert.ok(body.data.fillerWordAnalysis.totalCount > 0);
  });

  test('3. Candidate B cannot evaluate Candidate A answer (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/answers/${answerId1}/evaluate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userTokenB}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'FORBIDDEN');
  });

  test('4. Evaluating a skipped / empty answer returns 400 Validation Error', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/answers/${skippedAnswerId}/evaluate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userTokenA}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
  });

  test('5. Duplicate evaluation request returns cached evaluation document', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/answers/${answerId1}/evaluate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userTokenA}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
  });

  test('6. POST /api/v1/interviews/:id/evaluate-all evaluates all answered questions', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/evaluate-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userTokenA}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
  });

  test('7. GET /api/v1/interviews/:id/report returns comprehensive scorecard and question breakdown', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/report`, {
      headers: { Authorization: `Bearer ${userTokenA}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.report);
    assert.strictEqual(body.data.report.totalQuestions, 2);
    assert.strictEqual(body.data.report.questionsAnswered, 1);
    assert.strictEqual(body.data.report.questionsSkipped, 1);
    assert.ok(body.data.questionBreakdown.length === 2);
    assert.ok(body.data.questionBreakdown[0].evaluation !== null);
    assert.ok(body.data.questionBreakdown[1].answer.isSkipped === true);
  });

  test('8. Candidate B cannot access Candidate A report (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/interviews/${interviewId}/report`, {
      headers: { Authorization: `Bearer ${userTokenB}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(body.success, false);
  });

  test('9. GET /api/v1/analytics returns real aggregated historical metrics for user with interviews', async () => {
    const res = await fetch(`${baseUrl}/analytics`, {
      headers: { Authorization: `Bearer ${userTokenA}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.totalInterviews, 1);
    assert.ok(body.data.averageOverallScore > 0);
    assert.ok(body.data.scoreHistory.length > 0);
    assert.strictEqual(body.data.scoreHistory[0].type, 'TECHNICAL');
    assert.strictEqual(body.data.questionsMetrics.totalAnswered, 1);
    assert.strictEqual(body.data.questionsMetrics.totalSkipped, 1);
  });

  test('10. GET /api/v1/analytics returns clean empty state for Candidate B (no completed interviews)', async () => {
    const res = await fetch(`${baseUrl}/analytics`, {
      headers: { Authorization: `Bearer ${userTokenB}` }
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.totalInterviews, 0);
    assert.strictEqual(body.data.averageOverallScore, 0);
    assert.strictEqual(body.data.scoreHistory.length, 0);
  });
});
