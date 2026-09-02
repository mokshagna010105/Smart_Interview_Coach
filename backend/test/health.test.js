import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';

test('GET /api/v1/health returns 200 and healthy status', async () => {
  // Start server on an ephemeral port
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const response = await fetch(`http://localhost:${port}/api/v1/health`);
    const json = await response.json();

    assert.strictEqual(response.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.status, 'healthy');
    assert.strictEqual(json.data.service, 'interview-ai-backend');
  } finally {
    server.close();
  }
});

test('GET /api/v1/non-existent-route returns 404', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const response = await fetch(`http://localhost:${port}/api/v1/non-existent-route`);
    const json = await response.json();

    assert.strictEqual(response.status, 404);
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error.code, 'NOT_FOUND');
  } finally {
    server.close();
  }
});
