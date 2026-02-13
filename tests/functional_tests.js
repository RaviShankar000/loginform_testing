/**
 * Comprehensive Functional Testing Suite
 * Tests all login system functionality
 * Run: npm test
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api/auth';
const reportFile = path.join(__dirname, 'test_report.html');

// Test Results Storage
const testResults = [];
let passCount = 0;
let failCount = 0;

// Helper Functions
function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function addTestResult(id, scenario, input, expected, actual, status) {
    const result = {
        id,
        scenario,
        input,
        expected,
        actual,
        status,
        timestamp: new Date().toISOString()
    };
    testResults.push(result);
    
    if (status === 'PASS') {
        passCount++;
        console.log(`✅ ${id}: ${scenario} - PASS`);
    } else {
        failCount++;
        console.log(`❌ ${id}: ${scenario} - FAIL`);
        console.log(`   Expected: ${expected}`);
        console.log(`   Actual: ${actual}`);
    }
}

// Test Functions
async function testValidRegistration() {
    const testId = 'FT-001';
    const scenario = 'Valid User Registration';
    const username = `testuser_${Date.now()}`;
    const input = `Username: ${username}, Email: ${username}@test.com, Password: Test@1234`;
    
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username: username,
            email: `${username}@test.com`,
            password: 'Test@1234'
        });
        
        const expected = 'Registration success with token';
        const actual = response.data.msg || 'Registration Successful';
        const status = response.data.token ? 'PASS' : 'FAIL';
        
        addTestResult(testId, scenario, input, expected, actual, status);
        return response.data.token;
    } catch (error) {
        addTestResult(testId, scenario, input, 'Success', error.response?.data?.msg || error.message, 'FAIL');
        return null;
    }
}

async function testValidLogin() {
    const testId = 'FT-002';
    const scenario = 'Valid Login';
    const input = 'Username: testuser, Password: Test@1234';
    
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username: 'testuser',
            password: 'Test@1234'
        });
        
        const expected = 'Login successful with token';
        const actual = response.data.msg || 'Login successful';
        const status = response.data.token ? 'PASS' : 'FAIL';
        
        addTestResult(testId, scenario, input, expected, actual, status);
        return response.data.token;
    } catch (error) {
        addTestResult(testId, scenario, input, 'Success', error.response?.data?.msg || error.message, 'FAIL');
        return null;
    }
}

async function testInvalidUsername() {
    const testId = 'FT-003';
    const scenario = 'Invalid Username';
    const input = 'Username: nonexistent, Password: Test@1234';
    
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username: 'nonexistent_user_xyz',
            password: 'Test@1234'
        });
        
        addTestResult(testId, scenario, input, 'Invalid Credentials', 'Login succeeded (should fail)', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Invalid Credentials', actual, status);
    }
}

async function testInvalidPassword() {
    const testId = 'FT-004';
    const scenario = 'Invalid Password';
    const input = 'Username: testuser, Password: WrongPassword123!';
    
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username: 'testuser',
            password: 'WrongPassword123!'
        });
        
        addTestResult(testId, scenario, input, 'Invalid Credentials', 'Login succeeded (should fail)', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Invalid Credentials', actual, status);
    }
}

async function testEmptyUsername() {
    const testId = 'FT-005';
    const scenario = 'Empty Username';
    const input = 'Username: (empty), Password: Test@1234';
    
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username: '',
            password: 'Test@1234'
        });
        
        addTestResult(testId, scenario, input, 'Username required error', 'Login succeeded (should fail)', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Username') || actual.includes('required') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Username required error', actual, status);
    }
}

async function testEmptyPassword() {
    const testId = 'FT-006';
    const scenario = 'Empty Password';
    const input = 'Username: testuser, Password: (empty)';
    
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username: 'testuser',
            password: ''
        });
        
        addTestResult(testId, scenario, input, 'Password required error', 'Login succeeded (should fail)', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Password') || actual.includes('required') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Password required error', actual, status);
    }
}

async function testBothFieldsEmpty() {
    const testId = 'FT-007';
    const scenario = 'Both Fields Empty';
    const input = 'Username: (empty), Password: (empty)';
    
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username: '',
            password: ''
        });
        
        addTestResult(testId, scenario, input, 'Validation error', 'Login succeeded (should fail)', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('required') || actual.includes('Username') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error', actual, status);
    }
}

async function testSpecialCharactersUsername() {
    const testId = 'FT-008';
    const scenario = 'Special Characters in Username';
    const input = "Username: admin'--";
    
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username: "admin'--",
            password: 'Test@1234'
        });
        
        addTestResult(testId, scenario, input, 'Invalid Credentials (sanitized)', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Invalid Credentials (sanitized)', actual, status);
    }
}

async function testCaseSensitivePassword() {
    const testId = 'FT-009';
    const scenario = 'Case Sensitive Password Check';
    const input = 'Username: testuser, Password: test@1234 (lowercase)';
    
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username: 'testuser',
            password: 'test@1234' // lowercase version of Test@1234
        });
        
        addTestResult(testId, scenario, input, 'Invalid Credentials (case mismatch)', 'Login succeeded (should fail)', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Invalid Credentials (case mismatch)', actual, status);
    }
}

async function testLeadingTrailingSpaces() {
    const testId = 'FT-010';
    const scenario = 'Leading/Trailing Spaces';
    const input = 'Username: " testuser " (with spaces), Password: Test@1234';
    
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username: '  testuser  ',
            password: 'Test@1234'
        });
        
        const expected = 'Login successful (spaces trimmed)';
        const actual = response.data.msg || 'Login successful';
        const status = response.data.token ? 'PASS' : 'FAIL';
        
        addTestResult(testId, scenario, input, expected, actual, status);
    } catch (error) {
        addTestResult(testId, scenario, input, 'Login successful (spaces trimmed)', error.response?.data?.msg || error.message, 'FAIL');
    }
}

async function testMaxLengthUsername() {
    const testId = 'FT-011';
    const scenario = 'Maximum Length Username';
    const longUsername = 'a'.repeat(31); // Max is 30
    const input = `Username: ${longUsername.substring(0, 20)}... (31 chars)`;
    
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username: longUsername,
            email: `${Date.now()}@test.com`,
            password: 'Test@1234'
        });
        
        addTestResult(testId, scenario, input, 'Validation error (too long)', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = (actual.includes('30 characters') || actual.includes('validation')) ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error (too long)', actual, status);
    }
}

async function testMinLengthPassword() {
    const testId = 'FT-012';
    const scenario = 'Minimum Length Password';
    const input = 'Password: Test@12 (7 chars, min is 8)';
    
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username: `user_${Date.now()}`,
            email: `${Date.now()}@test.com`,
            password: 'Test@12'
        });
        
        addTestResult(testId, scenario, input, 'Validation error (too short)', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = (actual.includes('8 characters') || actual.includes('validation')) ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error (too short)', actual, status);
    }
}

async function testMultipleFailedAttempts() {
    const testId = 'FT-013';
    const scenario = 'Multiple Failed Login Attempts';
    const input = '5 consecutive failed attempts';
    
    let lastError = '';
    try {
        // Attempt 5 failed logins
        for (let i = 1; i <= 5; i++) {
            try {
                await axios.post(`${API_URL}/login`, {
                    username: 'testuser',
                    password: `WrongPass${i}`
                });
            } catch (error) {
                lastError = error.response?.data?.msg || error.message;
            }
        }
        
        // Try 6th attempt - should be locked
        try {
            await axios.post(`${API_URL}/login`, {
                username: 'testuser',
                password: 'WrongPass6'
            });
            addTestResult(testId, scenario, input, 'Account locked message', 'Login still allowed', 'FAIL');
        } catch (error) {
            const actual = error.response?.data?.msg || error.message;
            const status = actual.includes('locked') || actual.includes('Account locked') ? 'PASS' : 'FAIL';
            addTestResult(testId, scenario, input, 'Account locked message', actual, status);
        }
    } catch (error) {
        addTestResult(testId, scenario, input, 'Account locked', error.message, 'FAIL');
    }
}

async function testForgotPassword() {
    const testId = 'FT-014';
    const scenario = 'Forgot Password Request';
    const input = 'Email: testuser@example.com';
    
    try {
        const response = await axios.post(`${API_URL}/forgot-password`, {
            email: 'testuser@example.com'
        });
        
        const expected = 'Reset link sent message';
        const actual = response.data.msg || 'Success';
        const status = actual.includes('reset') || actual.includes('sent') ? 'PASS' : 'FAIL';
        
        addTestResult(testId, scenario, input, expected, actual, status);
    } catch (error) {
        addTestResult(testId, scenario, input, 'Reset link sent', error.response?.data?.msg || error.message, 'FAIL');
    }
}

async function testSQLInjection() {
    const testId = 'FT-015';
    const scenario = 'SQL Injection Attempt';
    const input = "Username: admin' OR '1'='1";
    
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username: "admin' OR '1'='1",
            password: 'anything'
        });
        
        addTestResult(testId, scenario, input, 'Invalid Credentials (injection blocked)', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Invalid Credentials (injection blocked)', actual, status);
    }
}

async function testScriptInjection() {
    const testId = 'FT-016';
    const scenario = 'Script Injection Attempt';
    const input = 'Username: <script>alert("xss")</script>';
    
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username: '<script>alert("xss")</script>',
            password: 'anything'
        });
        
        addTestResult(testId, scenario, input, 'Invalid Credentials (sanitized)', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Invalid Credentials (sanitized)', actual, status);
    }
}

async function testWeakPassword() {
    const testId = 'FT-017';
    const scenario = 'Weak Password Registration';
    const input = 'Password: password (no uppercase, no numbers, no special)';
    
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username: `user_${Date.now()}`,
            email: `${Date.now()}@test.com`,
            password: 'password'
        });
        
        addTestResult(testId, scenario, input, 'Validation error (weak password)', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = (actual.includes('Password') || actual.includes('validation')) ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error (weak password)', actual, status);
    }
}

// Generate HTML Report
function generateHTMLReport() {
    const totalTests = testResults.length;
    const passRate = ((passCount / totalTests) * 100).toFixed(2);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login System Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        header h1 { font-size: 2.5em; margin-bottom: 10px; }
        header p { font-size: 1.1em; opacity: 0.9; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
        }
        .summary-card h3 { color: #666; font-size: 0.9em; margin-bottom: 10px; text-transform: uppercase; }
        .summary-card .value { font-size: 2.5em; font-weight: bold; }
        .summary-card.total .value { color: #667eea; }
        .summary-card.pass .value { color: #10b981; }
        .summary-card.fail .value { color: #ef4444; }
        .summary-card.rate .value { color: #f59e0b; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        thead {
            background: #667eea;
            color: white;
        }
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th { font-weight: 600; }
        tbody tr:hover { background: #f9fafb; }
        .status-pass {
            background: #10b981;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }
        .status-fail {
            background: #ef4444;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }
        .table-container { padding: 30px; }
        footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e5e7eb;
        }
        .timestamp { font-size: 0.85em; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🔐 Secure Login System</h1>
            <p>Comprehensive Test Report</p>
        </header>
        
        <div class="summary">
            <div class="summary-card total">
                <h3>Total Tests</h3>
                <div class="value">${totalTests}</div>
            </div>
            <div class="summary-card pass">
                <h3>Passed</h3>
                <div class="value">${passCount}</div>
            </div>
            <div class="summary-card fail">
                <h3>Failed</h3>
                <div class="value">${failCount}</div>
            </div>
            <div class="summary-card rate">
                <h3>Pass Rate</h3>
                <div class="value">${passRate}%</div>
            </div>
        </div>
        
        <div class="table-container">
            <h2 style="margin-bottom: 20px; color: #333;">Test Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Test ID</th>
                        <th>Scenario</th>
                        <th>Input</th>
                        <th>Expected</th>
                        <th>Actual</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${testResults.map(test => `
                        <tr>
                            <td><strong>${test.id}</strong></td>
                            <td>${test.scenario}</td>
                            <td><code style="background: #f3f4f6; padding: 5px; border-radius: 3px;">${test.input}</code></td>
                            <td>${test.expected}</td>
                            <td>${test.actual}</td>
                            <td><span class="status-${test.status.toLowerCase()}">${test.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <footer>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p class="timestamp">Secure Login System - Functional Testing Suite v1.0</p>
        </footer>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(reportFile, html);
    console.log(`\n📄 HTML Report generated: ${reportFile}`);
}

// Main Test Runner
async function runAllTests() {
    console.log('═'.repeat(70));
    console.log('🔐 SECURE LOGIN SYSTEM - FUNCTIONAL TESTING SUITE');
    console.log('═'.repeat(70));
    console.log(`\nStarting tests at ${new Date().toLocaleString()}\n`);
    
    try {
        await testValidRegistration();
        await testValidLogin();
        await testInvalidUsername();
        await testInvalidPassword();
        await testEmptyUsername();
        await testEmptyPassword();
        await testBothFieldsEmpty();
        await testSpecialCharactersUsername();
        await testCaseSensitivePassword();
        await testLeadingTrailingSpaces();
        await testMaxLengthUsername();
        await testMinLengthPassword();
        await testMultipleFailedAttempts();
        await testForgotPassword();
        await testSQLInjection();
        await testScriptInjection();
        await testWeakPassword();
        
        console.log('\n' + '═'.repeat(70));
        console.log('📊 TEST SUMMARY');
        console.log('═'.repeat(70));
        console.log(`Total Tests: ${testResults.length}`);
        console.log(`✅ Passed: ${passCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`📈 Pass Rate: ${((passCount / testResults.length) * 100).toFixed(2)}%`);
        console.log('═'.repeat(70));
        
        generateHTMLReport();
        
        console.log(`\n✨ All tests completed!\n`);
        process.exit(failCount > 0 ? 1 : 0);
        
    } catch (error) {
        console.error('\n❌ Test suite encountered an error:', error.message);
        process.exit(1);
    }
}

// Run tests
runAllTests();
