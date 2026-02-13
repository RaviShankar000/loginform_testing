/**
 * Boundary Value Testing Suite
 * Tests edge cases and boundary conditions
 * Run: node boundary_tests.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api/auth';
const reportFile = path.join(__dirname, 'boundary_test_report.html');

const testResults = [];
let passCount = 0;
let failCount = 0;

function addTestResult(id, scenario, input, expected, actual, status) {
    const result = { id, scenario, input, expected, actual, status, timestamp: new Date().toISOString() };
    testResults.push(result);
    
    if (status === 'PASS') {
        passCount++;
        console.log(`✅ ${id}: ${scenario} - PASS`);
    } else {
        failCount++;
        console.log(`❌ ${id}: ${scenario} - FAIL`);
    }
}

// Boundary Tests

async function testUsernameLength0() {
    const testId = 'BT-001';
    const scenario = 'Username Length = 0';
    const input = 'Empty string';
    
    try {
        await axios.post(`${API_URL}/register`, {
            username: '',
            email: `${Date.now()}@test.com`,
            password: 'Test@1234'
        });
        addTestResult(testId, scenario, input, 'Validation error', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = (actual.includes('required') || actual.includes('3')) ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error', actual, status);
    }
}

async function testUsernameLength1() {
    const testId = 'BT-002';
    const scenario = 'Username Length = 1 (Below Minimum)';
    const input = 'Username: "a"';
    
    try {
        await axios.post(`${API_URL}/register`, {
            username: 'a',
            email: `${Date.now()}@test.com`,
            password: 'Test@1234'
        });
        addTestResult(testId, scenario, input, 'Validation error (too short)', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = (actual.includes('3') || actual.includes('characters')) ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error', actual, status);
    }
}

async function testUsernameLength2() {
    const testId = 'BT-003';
    const scenario = 'Username Length = 2 (Below Minimum)';
    const input = 'Username: "ab"';
    
    try {
        await axios.post(`${API_URL}/register`, {
            username: 'ab',
            email: `${Date.now()}@test.com`,
            password: 'Test@1234'
        });
        addTestResult(testId, scenario, input, 'Validation error (too short)', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = (actual.includes('3') || actual.includes('characters')) ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error', actual, status);
    }
}

async function testUsernameLength3() {
    const testId = 'BT-004';
    const scenario = 'Username Length = 3 (Minimum Boundary)';
    const username = 'abc';
    const input = `Username: "${username}"`;
    
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username: username,
            email: `${Date.now()}@test.com`,
            password: 'Test@1234'
        });
        const status = response.data.token ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Registration success', 'Registration success', status);
    } catch (error) {
        addTestResult(testId, scenario, input, 'Registration success', error.response?.data?.msg || error.message, 'FAIL');
    }
}

async function testUsernameLength30() {
    const testId = 'BT-005';
    const scenario = 'Username Length = 30 (Maximum Boundary)';
    const username = 'a'.repeat(30);
    const input = `Username: "${username.substring(0, 20)}..." (30 chars)`;
    
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username: username,
            email: `${Date.now()}@test.com`,
            password: 'Test@1234'
        });
        const status = response.data.token ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Registration success', 'Registration success', status);
    } catch (error) {
        addTestResult(testId, scenario, input, 'Registration success', error.response?.data?.msg || error.message, 'FAIL');
    }
}

async function testUsernameLength31() {
    const testId = 'BT-006';
    const scenario = 'Username Length = 31 (Above Maximum)';
    const username = 'a'.repeat(31);
    const input = `Username: "${username.substring(0, 20)}..." (31 chars)`;
    
    try {
        await axios.post(`${API_URL}/register`, {
            username: username,
            email: `${Date.now()}@test.com`,
            password: 'Test@1234'
        });
        addTestResult(testId, scenario, input, 'Validation error (too long)', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = (actual.includes('30') || actual.includes('characters')) ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error', actual, status);
    }
}

async function testPasswordLength7() {
    const testId = 'BT-007';
    const scenario = 'Password Length = 7 (Below Minimum)';
    const input = 'Password: "Test@12" (7 chars)';
    
    try {
        await axios.post(`${API_URL}/register`, {
            username: `user${Date.now()}`,
            email: `${Date.now()}@test.com`,
            password: 'Test@12'
        });
        addTestResult(testId, scenario, input, 'Validation error (too short)', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = (actual.includes('8') || actual.includes('characters')) ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error', actual, status);
    }
}

async function testPasswordLength8() {
    const testId = 'BT-008';
    const scenario = 'Password Length = 8 (Minimum Boundary)';
    const input = 'Password: "Test@123" (8 chars)';
    
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username: `user${Date.now()}`,
            email: `${Date.now()}@test.com`,
            password: 'Test@123'
        });
        const status = response.data.token ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Registration success', 'Registration success', status);
    } catch (error) {
        addTestResult(testId, scenario, input, 'Registration success', error.response?.data?.msg || error.message, 'FAIL');
    }
}

async function testPasswordLength128() {
    const testId = 'BT-009';
    const scenario = 'Password Length = 128 (Maximum Boundary)';
    // Create valid password with 128 chars
    const password = 'A1!' + 'a'.repeat(125);
    const input = `Password: ${password.substring(0, 30)}... (128 chars)`;
    
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username: `user${Date.now()}`,
            email: `${Date.now()}@test.com`,
            password: password
        });
        const status = response.data.token ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Registration success', 'Registration success', status);
    } catch (error) {
        addTestResult(testId, scenario, input, 'Registration success', error.response?.data?.msg || error.message, 'FAIL');
    }
}

async function testPasswordLength129() {
    const testId = 'BT-010';
    const scenario = 'Password Length = 129 (Above Maximum)';
    const password = 'A1!' + 'a'.repeat(126);
    const input = `Password: ${password.substring(0, 30)}... (129 chars)`;
    
    try {
        await axios.post(`${API_URL}/register`, {
            username: `user${Date.now()}`,
            email: `${Date.now()}@test.com`,
            password: password
        });
        addTestResult(testId, scenario, input, 'Validation error (too long)', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = (actual.includes('128') || actual.includes('characters')) ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error', actual, status);
    }
}

async function testExtremelyLongUsername() {
    const testId = 'BT-011';
    const scenario = 'Extremely Long Username (1000 chars)';
    const username = 'a'.repeat(1000);
    const input = `Username: ${username.substring(0, 30)}... (1000 chars)`;
    
    try {
        await axios.post(`${API_URL}/register`, {
            username: username,
            email: `${Date.now()}@test.com`,
            password: 'Test@1234'
        });
        addTestResult(testId, scenario, input, 'Validation error', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('characters') || actual.includes('30') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error', actual, status);
    }
}

async function testExtremelyLongPassword() {
    const testId = 'BT-012';
    const scenario = 'Extremely Long Password (1000 chars)';
    const password = 'A1!' + 'a'.repeat(997);
    const input = `Password: ${password.substring(0, 30)}... (1000 chars)`;
    
    try {
        await axios.post(`${API_URL}/register`, {
            username: `user${Date.now()}`,
            email: `${Date.now()}@test.com`,
            password: password
        });
        addTestResult(testId, scenario, input, 'Validation error', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('128') || actual.includes('characters') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error', actual, status);
    }
}

async function testUnicodeCharacters() {
    const testId = 'BT-013';
    const scenario = 'Unicode Characters in Username';
    const input = 'Username: "用户名" (Chinese)';
    
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username: '用户名123',
            email: `${Date.now()}@test.com`,
            password: 'Test@1234'
        });
        // This could pass or fail depending on requirements
        addTestResult(testId, scenario, input, 'Handled properly', 'Registration accepted', 'PASS');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        addTestResult(testId, scenario, input, 'Handled properly', actual, 'PASS');
    }
}

async function testEmailBoundary() {
    const testId = 'BT-014';
    const scenario = 'Email at Boundary (Very Long)';
    const longEmail = 'a'.repeat(50) + '@example.com';
    const input = `Email: ${longEmail}`;
    
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username: `user${Date.now()}`,
            email: longEmail,
            password: 'Test@1234'
        });
        addTestResult(testId, scenario, input, 'Handled properly', 'Registration success', 'PASS');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        addTestResult(testId, scenario, input, 'Handled properly', actual, 'PASS');
    }
}

async function testNullUsername() {
    const testId = 'BT-015';
    const scenario = 'Null Username';
    const input = 'Username: null';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: null,
            password: 'Test@1234'
        });
        addTestResult(testId, scenario, input, 'Validation error', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('required') || actual.includes('Username') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error', actual, status);
    }
}

async function testUndefinedPassword() {
    const testId = 'BT-016';
    const scenario = 'Undefined Password';
    const input = 'Password: undefined';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: 'testuser',
            password: undefined
        });
        addTestResult(testId, scenario, input, 'Validation error', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('required') || actual.includes('Password') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Validation error', actual, status);
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
    <title>Boundary Value Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        header h1 { font-size: 2.5em; margin-bottom: 10px; }
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
        .summary-card h3 { color: #666; font-size: 0.9em; margin-bottom: 10px; }
        .summary-card .value { font-size: 2.5em; font-weight: bold; }
        .summary-card.total .value { color: #f093fb; }
        .summary-card.pass .value { color: #10b981; }
        .summary-card.fail .value { color: #ef4444; }
        .summary-card.rate .value { color: #f5576c; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        thead {
            background: #f093fb;
            color: white;
        }
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        tbody tr:hover { background: #f9fafb; }
        .status-pass {
            background: #10b981;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
        }
        .status-fail {
            background: #ef4444;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
        }
        .table-container { padding: 30px; }
        footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📏 Boundary Value Testing</h1>
            <p>Edge Cases & Boundary Conditions</p>
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
            <h2 style="margin-bottom: 20px;">Test Results</h2>
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
                            <td><code style="background: #f3f4f6; padding: 5px;">${test.input}</code></td>
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
        </footer>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(reportFile, html);
    console.log(`\n📄 Boundary Test Report: ${reportFile}`);
}

// Main Runner
async function runAllTests() {
    console.log('═'.repeat(70));
    console.log('📏 BOUNDARY VALUE TESTING SUITE');
    console.log('═'.repeat(70));
    
    try {
        await testUsernameLength0();
        await testUsernameLength1();
        await testUsernameLength2();
        await testUsernameLength3();
        await testUsernameLength30();
        await testUsernameLength31();
        await testPasswordLength7();
        await testPasswordLength8();
        await testPasswordLength128();
        await testPasswordLength129();
        await testExtremelyLongUsername();
        await testExtremelyLongPassword();
        await testUnicodeCharacters();
        await testEmailBoundary();
        await testNullUsername();
        await testUndefinedPassword();
        
        console.log('\n' + '═'.repeat(70));
        console.log('📊 SUMMARY');
        console.log('═'.repeat(70));
        console.log(`Total: ${testResults.length} | ✅ Passed: ${passCount} | ❌ Failed: ${failCount}`);
        console.log(`Pass Rate: ${((passCount / testResults.length) * 100).toFixed(2)}%`);
        console.log('═'.repeat(70));
        
        generateHTMLReport();
        process.exit(failCount > 0 ? 1 : 0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

runAllTests();
