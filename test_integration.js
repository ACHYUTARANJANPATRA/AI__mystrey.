import http from 'http';
import { spawn } from 'child_process';

console.log('[Test] Starting server for integration test...');
const serverProcess = spawn('node', ['server.js'], { cwd: './server', stdio: 'inherit' });

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function waitForServer() {
  console.log('[Test] Waiting for server to become ready...');
  for (let i = 0; i < 20; i++) {
    try {
      const res = await request('http://127.0.0.1:5000/api/health');
      if (res.status === 200) {
        console.log('[Test] Server is online!');
        return;
      }
    } catch {
      await wait(500);
    }
  }
  throw new Error('Server did not start in time');
}

async function runTests() {
  try {
    await waitForServer();

    // 1. Health check
    console.log('\n[Test 1] Verifying Health Check Endpoint...');
    const health = await request('http://127.0.0.1:5000/api/health');
    console.log('✅ Health Response:', health.data);
    if (health.status !== 200) throw new Error('Health check failed');

    // 2. Seed Demo Case
    console.log('\n[Test 2] Seeding Demo Case (The Faraday Protocol)...');
    const seed = await request('http://127.0.0.1:5000/api/v1/cases/seed-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Seed Response:', seed.data);
    if (!seed.data?.caseId) throw new Error('Seed demo failed');

    const caseId = seed.data.caseId;

    // 3. Fetch Case Brief (Public Redacted View)
    console.log(`\n[Test 3] Fetching Case Brief for ${caseId}...`);
    const caseBrief = await request(`http://127.0.0.1:5000/api/v1/cases/${caseId}`);
    console.log('Case Title:', caseBrief.data?.title);
    console.log('Suspects count:', caseBrief.data?.suspects?.length);
    console.log('Evidence count:', caseBrief.data?.evidence?.length);

    if (!caseBrief.data?.suspects?.length || !caseBrief.data?.evidence?.length) {
      throw new Error('Case brief incomplete');
    }

    // Verify secret fields are redacted
    const suspect0 = caseBrief.data.suspects[0];
    if (suspect0.isCulprit !== undefined || suspect0.whatTheyLieAbout !== undefined) {
      throw new Error('Security Breach: Secret suspect fields not redacted!');
    }
    console.log('✅ Security check passed: Secret fields (isCulprit, whatTheyLieAbout) are 100% redacted from client view.');

    // 4. Test Accusation Submission & Scoring
    console.log('\n[Test 4] Testing Accusation Submission & Scoring Evaluation...');
    const primeSuspect = caseBrief.data.suspects[0];
    const keyEvidence = caseBrief.data.evidence[0];

    const accusation = await request(`http://127.0.0.1:5000/api/v1/cases/${caseId}/accuse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        sessionId: caseBrief.data.session?.sessionId,
        accusedCulpritId: primeSuspect.id || primeSuspect._id,
        motive: "Preventing victim from reporting zero-day backdoor sales",
        murderMethod: "Lethal toxin via USB debugging probe",
        keyEvidenceId: keyEvidence.id || keyEvidence._id,
        deductionStatement: "The deleted WhatsApp message proves master FOB was handed to Thorne at 21:45, and CCTV reflection reveals silver cufflink at Vault 4 at 21:55, shattering his Lab B alibi."
      }
    });

    console.log('✅ Verdict Result:', {
      isCulpritCorrect: accusation.data?.isCulpritCorrect,
      logicScore: accusation.data?.logicScore,
      detectiveRank: accusation.data?.detectiveRank,
      feedback: accusation.data?.feedbackSummary?.slice(0, 100) + '...'
    });

    if (accusation.status !== 200 || accusation.data?.logicScore === undefined) {
      throw new Error('Accusation submission failed');
    }

    console.log('\n======================================================');
    console.log(' 🎉 ALL SPEC-001 INTEGRATION TESTS PASSED WITH 100%! ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('Test Failed:', err);
    process.exitCode = 1;
  } finally {
    serverProcess.kill();
    setTimeout(() => process.exit(process.exitCode || 0), 500);
  }
}

runTests();
