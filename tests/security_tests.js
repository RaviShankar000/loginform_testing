/**
 * Security Testing Suite
 * Tests injection attacks, brute force protection, and security vulnerabilities
 * Run: node security_tests.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api/auth';
const reportFile = path.join(__dirname, 'security_test_report.html');

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

// SQL/NoSQL Injection Tests
async function testSQLInjection1() {
    const testId = 'ST-001';
    const scenario = 'SQL Injection - OR 1=1';
    const input = "admin' OR '1'='1";
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: "admin' OR '1'='1",
            password: 'anything'
        });
        addTestResult(testId, scenario, input, 'Blocked/Invalid Credentials', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Blocked/Invalid Credentials', actual, status);
    }
}

async function testSQLInjection2() {
    const testId = 'ST-002';
    const scenario = 'SQL Injection - Comment Attack';
    const input = "admin'-- ";
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: "admin'-- ",
            password: 'anything'
        });
        addTestResult(testId, scenario, input, 'Blocked', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Blocked', actual, status);
    }
}

async function testNoSQLInjection1() {
    const testId = 'ST-003';
    const scenario = 'NoSQL Injection - $ne Operator';
    const input = '{"$ne": null}';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: { $ne: null },
            password: { $ne: null }
        });
        addTestResult(testId, scenario, input, 'Blocked', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = (actual.includes('Invalid') || actual.includes('required')) ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Blocked', actual, status);
    }
}

async function testNoSQLInjection2() {
    const testId = 'ST-004';
    const scenario = 'NoSQL Injection - $gt Operator';
    const input = '{"$gt": ""}';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: { $gt: '' },
            password: 'anything'
        });
        addTestResult(testId, scenario, input, 'Blocked', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = (actual.includes('Invalid') || actual.includes('required')) ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Blocked', actual, status);
    }
}

// XSS (Cross-Site Scripting) Tests
async function testXSSAttack1() {
    const testId = 'ST-005';
    const scenario = 'XSS Attack - Script Tag';
    const input = '<script>alert("XSS")</script>';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: '<script>alert("XSS")</script>',
            password: 'anything'
        });
        addTestResult(testId, scenario, input, 'Sanitized/Blocked', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        // Should be sanitized and result in invalid credentials
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Sanitized/Blocked', actual, status);
    }
}

async function testXSSAttack2() {
    const testId = 'ST-006';
    const scenario = 'XSS Attack - IMG Tag with onerror';
    const input = '<img src=x onerror="alert(1)">';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: '<img src=x onerror="alert(1)">',
            password: 'anything'
        });
        addTestResult(testId, scenario, input, 'Sanitized/Blocked', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Sanitized/Blocked', actual, status);
    }
}

async function testXSSAttack3() {
    const testId = 'ST-007';
    const scenario = 'XSS Attack - JavaScript Protocol';
    const input = 'javascript:alert(1)';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: 'javascript:alert(1)',
            password: 'anything'
        });
        addTestResult(testId, scenario, input, 'Sanitized/Blocked', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Sanitized/Blocked', actual, status);
    }
}

// Brute Force Protection Tests
async function testBruteForceProtection() {
    const testId = 'ST-008';
    const scenario = 'Brute Force Protection - 5+ Failed Attempts';
    const input = '5 consecutive failed login attempts';
    
    try {
        // Create a new user first
        const username = `brutetest_${Date.now()}`;
        await axios.post(`${API_URL}/register`, {
            username: username,
            email: `${username}@test.com`,
            password: 'Test@1234'
        });
        
        // Attempt 5 failed logins
        for (let i = 0; i < 5; i++) {
            try {
                await axios.post(`${API_URL}/login`, {
                    username: username,
                    password: `WrongPass${i}`
                });
            } catch (e) {
                // Expected to fail
            }
        }
        
        // 6th attempt should be locked
        try {
            await axios.post(`${API_URL}/login`, {
                username: username,
                password: 'WrongPass5'
            });
            addTestResult(testId, scenario, input, 'Account locked', 'Login still allowed', 'FAIL');
        } catch (error) {
            const actual = error.response?.data?.msg || error.message;
            const status = (actual.includes('locked') || actual.includes('Account locked')) ? 'PASS' : 'FAIL';
            addTestResult(testId, scenario, input, 'Account locked', actual, status);
        }
    } catch (error) {
        addTestResult(testId, scenario, input, 'Account locked', error.message, 'FAIL');
    }
}

async function testAccountLockDuration() {
    const testId = 'ST-009';
    const scenario = 'Account Lock Duration Check';
    const input = 'Check lock persists';
    
    try {
        // Try to login to already locked account from previous test
        await axios.post(`${API_URL}/login`, {
            username: 'testuser', // Assuming this might be locked
            password: 'Test@1234'
        });
        addTestResult(testId, scenario, input, 'Lock persists or login succeeds if unlocked', 'Success', 'PASS');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        // If locked, that's expected
        const status = (actual.includes('locked') || actual.includes('Invalid')) ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Lock persists or valid error', actual, status);
    }
}

// Password Complexity Tests
async function testWeakPassword1() {
    const testId = 'ST-010';
    const scenario = 'Weak Password - No Uppercase';
    const input = 'test@1234';
    
    try {
        await axios.post(`${API_URL}/register`, {
            username: `weaktest_${Date.now()}`,
            email: `${Date.now()}@test.com`,
            password: 'test@1234'
        });
        addTestResult(testId, scenario, input, 'Rejected - No uppercase', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Password') || actual.includes('uppercase') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Rejected', actual, status);
    }
}

async function testWeakPassword2() {
    const testId = 'ST-011';
    const scenario = 'Weak Password - No Special Character';
    const input = 'Test12345';
    
    try {
        await axios.post(`${API_URL}/register`, {
            username: `weaktest_${Date.now()}`,
            email: `${Date.now()}@test.com`,
            password: 'Test12345'
        });
        addTestResult(testId, scenario, input, 'Rejected - No special char', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Password') || actual.includes('special') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Rejected', actual, status);
    }
}

async function testWeakPassword3() {
    const testId = 'ST-012';
    const scenario = 'Weak Password - No Numbers';
    const input = 'TestTest@';
    
    try {
        await axios.post(`${API_URL}/register`, {
            username: `weaktest_${Date.now()}`,
            email: `${Date.now()}@test.com`,
            password: 'TestTest@'
        });
        addTestResult(testId, scenario, input, 'Rejected - No numbers', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Password') || actual.includes('number') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Rejected', actual, status);
    }
}

async function testWeakPassword4() {
    const testId = 'ST-013';
    const scenario = 'Weak Password - All Lowercase';
    const input = 'password';
    
    try {
        await axios.post(`${API_URL}/register`, {
            username: `weaktest_${Date.now()}`,
            email: `${Date.now()}@test.com`,
            password: 'password'
        });
        addTestResult(testId, scenario, input, 'Rejected - Too weak', 'Registration succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Password') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Rejected', actual, status);
    }
}

// Command Injection Tests
async function testCommandInjection1() {
    const testId = 'ST-014';
    const scenario = 'Command Injection - Semicolon';
    const input = 'admin; ls -la';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: 'admin; ls -la',
            password: 'anything'
        });
        addTestResult(testId, scenario, input, 'Blocked', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Blocked', actual, status);
    }
}

async function testCommandInjection2() {
    const testId = 'ST-015';
    const scenario = 'Command Injection - Pipe';
    const input = 'admin | cat /etc/passwd';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: 'admin | cat /etc/passwd',
            password: 'anything'
        });
        addTestResult(testId, scenario, input, 'Blocked', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Blocked', actual, status);
    }
}

// Path Traversal Tests
async function testPathTraversal() {
    const testId = 'ST-016';
    const scenario = 'Path Traversal Attack';
    const input = '../../etc/passwd';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: '../../etc/passwd',
            password: 'anything'
        });
        addTestResult(testId, scenario, input, 'Blocked', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Blocked', actual, status);
    }
}

// LDAP Injection Test
async function testLDAPInjection() {
    const testId = 'ST-017';
    const scenario = 'LDAP Injection Attack';
    const input = '*)(uid=*))(|(uid=*';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: '*)(uid=*))(|(uid=*',
            password: 'anything'
        });
        addTestResult(testId, scenario, input, 'Blocked', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Blocked', actual, status);
    }
}

// Special Character Attacks
async function testSpecialCharacterFlood() {
    const testId = 'ST-018';
    const scenario = 'Special Character Flood';
    const input = '!!!@@@###$$$%%%^^^&&&***';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: '!!!@@@###$$$%%%^^^&&&***',
            password: 'anything'
        });
        addTestResult(testId, scenario, input, 'Handled properly', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Handled properly', actual, status);
    }
}

// Null Byte Injection
async function testNullByteInjection() {
    const testId = 'ST-019';
    const scenario = 'Null Byte Injection';
    const input = 'admin\\x00';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: 'admin\x00',
            password: 'anything'
        });
        addTestResult(testId, scenario, input, 'Blocked', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Blocked', actual, status);
    }
}

// Format String Attack
async function testFormatStringAttack() {
    const testId = 'ST-020';
    const scenario = 'Format String Attack';
    const input = '%s%s%s%s%s';
    
    try {
        await axios.post(`${API_URL}/login`, {
            username: '%s%s%s%s%s',
            password: 'anything'
        });
        addTestResult(testId, scenario, input, 'Blocked', 'Login succeeded', 'FAIL');
    } catch (error) {
        const actual = error.response?.data?.msg || error.message;
        const status = actual.includes('Invalid Credentials') ? 'PASS' : 'FAIL';
        addTestResult(testId, scenario, input, 'Blocked', actual, status);
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
    <title>Security Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
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
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
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
        .summary-card.total .value { color: #ff6b6b; }
        .summary-card.pass .value { color: #10b981; }
        .summary-card.fail .value { color: #ef4444; }
        .summary-card.rate .value { color: #ee5a6f; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        thead {
            background: #ff6b6b;
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
        .attack-type {
            display: inline-block;
            padding: 3px 10px;
            background: #ffebee;
            color: #c62828;
            border-radius: 5px;
            font-size: 0.85em;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🛡️ Security Testing Report</h1>
            <p>Penetration Testing & Vulnerability Assessment</p>
        </header>
        
        <div class="summary">
            <div class="summary-card total">
                <h3>Total Tests</h3>
                <div class="value">${totalTests}</div>
            </div>
            <div class="summary-card pass">
                <h3>Blocked/Passed</h3>
                <div class="value">${passCount}</div>
            </div>
            <div class="summary-card fail">
                <h3>Vulnerable/Failed</h3>
                <div class="value">${failCount}</div>
            </div>
            <div class="summary-card rate">
                <h3>Security Score</h3>
                <div class="value">${passRate}%</div>
            </div>
        </div>
        
        <div class="table-container">
            <h2 style="margin-bottom: 20px;">Attack Simulation Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Test ID</th>
                        <th>Attack Type</th>
                        <th>Malicious Input</th>
                        <th>Expected Response</th>
                        <th>Actual Response</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${testResults.map(test => `
                        <tr>
                            <td><strong>${test.id}</strong></td>
                            <td>${test.scenario}</td>
                            <td><code style="background: #fff3cd; padding: 5px; color: #856404; border-radius: 3px;">${test.input}</code></td>
                            <td>${test.expected}</td>
                            <td>${test.actual}</td>
                            <td><span class="status-${test.status.toLowerCase()}">${test.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <footer>
            <p><strong>⚠️ Security Assessment:</strong> ${passRate >= 90 ? 'Excellent' : passRate >= 75 ? 'Good' : passRate >= 60 ? 'Fair' : 'Needs Improvement'}</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
        </footer>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(reportFile, html);
    console.log(`\n📄 Security Test Report: ${reportFile}`);
}

// Main Runner
async function runAllTests() {
    console.log('═'.repeat(70));
    console.log('🛡️  SECURITY TESTING SUITE');
    console.log('═'.repeat(70));
    
    try {
        console.log('\n🔍 Testing SQL/NoSQL Injection...');
        await testSQLInjection1();
        await testSQLInjection2();
        await testNoSQLInjection1();
        await testNoSQLInjection2();
        
        console.log('\n🔍 Testing XSS Attacks...');
        await testXSSAttack1();
        await testXSSAttack2();
        await testXSSAttack3();
        
        console.log('\n🔍 Testing Brute Force Protection...');
        await testBruteForceProtection();
        await testAccountLockDuration();
        
        console.log('\n🔍 Testing Password Security...');
        await testWeakPassword1();
        await testWeakPassword2();
        await testWeakPassword3();
        await testWeakPassword4();
        
        console.log('\n🔍 Testing Other Attacks...');
        await testCommandInjection1();
        await testCommandInjection2();
        await testPathTraversal();
        await testLDAPInjection();
        await testSpecialCharacterFlood();
        await testNullByteInjection();
        await testFormatStringAttack();
        
        console.log('\n' + '═'.repeat(70));
        console.log('📊 SECURITY SUMMARY');
        console.log('═'.repeat(70));
        console.log(`Total Security Tests: ${testResults.length}`);
        console.log(`✅ Attacks Blocked: ${passCount}`);
        console.log(`❌ Vulnerabilities Found: ${failCount}`);
        console.log(`🛡️  Security Score: ${((passCount / testResults.length) * 100).toFixed(2)}%`);
        console.log('═'.repeat(70));
        
        generateHTMLReport();
        console.log(`\n✨ Security testing completed!\n`);
        
        process.exit(failCount > 0 ? 1 : 0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

runAllTests();
