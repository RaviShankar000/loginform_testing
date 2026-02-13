/**
 * Selenium Automation Testing Suite
 * Automated UI testing for login system
 * Run: node feature_test.js
 */

const fs = require('fs');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Configuration
const BASE_URL = 'http://localhost:5173'; // Vite Default
const TARGET_BROWSER = 'chrome';
const REPORT_FILE = 'selenium_test_report.html';

// Test Results Storage
const reportStream = fs.createWriteStream('test_report.txt', { flags: 'a' });
const testResults = [];
let passCount = 0;
let failCount = 0;

function logReport(id, scenario, input, expected, actual, status) {
    const reportLine = `Test ID: ${id} | Scenario: ${scenario} | Input: ${input} | Expected: ${expected} | Actual: ${actual} | Status: ${status}\n`;
    console.log(reportLine);
    reportStream.write(reportLine);
    
    testResults.push({ id, scenario, input, expected, actual, status });
    if (status === 'PASS') passCount++;
    else failCount++;
}

async function runTests() {
    // Setup Chrome options for headless mode (optional)
    const options = new chrome.Options();
    // options.addArguments('--headless'); // Uncomment for headless mode
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    
    let driver = await new Builder()
        .forBrowser(TARGET_BROWSER)
        .setChromeOptions(options)
        .build();

    // Initialize Report
    reportStream.write(`\n${'═'.repeat(70)}\n`);
    reportStream.write(`Selenium Automation Test Report - ${new Date().toISOString()}\n`);
    reportStream.write(`${'═'.repeat(70)}\n\n`);

    try {
        console.log('═'.repeat(70));
        console.log('🤖 SELENIUM AUTOMATION TESTING SUITE');
        console.log('═'.repeat(70));
        console.log(`\nStarting automated UI tests...\n`);

        // TC-01: Load Page
        console.log('📝 TC-01: Loading application...');
        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.id('container')), 10000);
        logReport('TC-01', 'Load Page', 'URL: ' + BASE_URL, 'Page Loaded', 'Page Loaded', 'PASS');
        await driver.sleep(1000);

        // TC-02: Test Registration with Password Strength
        console.log('📝 TC-02: Testing user registration...');
        await driver.findElement(By.id('signUp')).click();
        await driver.sleep(1500);

        const testUser = `autouser_${Date.now()}`;
        await driver.findElement(By.id('reg-username')).sendKeys(testUser);
        await driver.findElement(By.id('reg-email')).sendKeys(`${testUser}@example.com`);
        
        const regPasswordField = await driver.findElement(By.id('reg-password'));
        await regPasswordField.sendKeys('TestPass123!');
        await driver.sleep(500);

        // Check Password Strength Indicator
        let strengthText = await driver.findElement(By.id('strength-text')).getText();
        logReport('TC-02', 'Password Strength Check', 'TestPass123!', 'Strong', strengthText, strengthText === 'Strong' ? 'PASS' : 'FAIL');

        await driver.findElement(By.css('#registerForm button[type="submit"]')).click();
        await driver.sleep(1000);

        // Handle Alert
        try {
            await driver.wait(until.alertIsPresent(), 5000);
            let alert = await driver.switchTo().alert();
            let alertText = await alert.getText();
            await alert.accept();
            const status = alertText.includes('Successful') ? 'PASS' : 'FAIL';
            logReport('TC-03', 'User Registration', `User: ${testUser}`, 'Success Alert', alertText, status);
        } catch (e) {
            // Check for error message instead
            const errorMsg = await driver.findElement(By.id('reg-error')).getText();
            if (errorMsg) {
                logReport('TC-03', 'User Registration', `User: ${testUser}`, 'Success Alert', `Error: ${errorMsg}`, 'FAIL');
            } else {
                logReport('TC-03', 'User Registration', `User: ${testUser}`, 'Success Alert', 'No response', 'FAIL');
            }
        }

        // TC-04: Test Valid Login
        console.log('📝 TC-04: Testing valid login...');
        await driver.sleep(2000);
        
        const loginUsername = await driver.findElement(By.id('login-username'));
        await loginUsername.clear();
        await loginUsername.sendKeys(testUser);
        
        const loginPassword = await driver.findElement(By.id('login-password'));
        await loginPassword.clear();
        await loginPassword.sendKeys('TestPass123!');
        
        await driver.findElement(By.css('#loginForm button[type="submit"]')).click();
        await driver.sleep(2000);

        // Check for Dashboard
        try {
            const dashboard = await driver.findElement(By.id('dashboard'));
            const isDashboardVisible = await dashboard.isDisplayed();
            
            if (isDashboardVisible) {
                const userNameDisplay = await driver.findElement(By.id('user-name')).getText();
                const status = userNameDisplay === testUser ? 'PASS' : 'FAIL';
                logReport('TC-04', 'Valid Login', `User: ${testUser}`, 'Dashboard Visible', `Dashboard with ${userNameDisplay}`, status);

                // TC-05: Logout
                console.log('📝 TC-05: Testing logout...');
                await driver.findElement(By.id('logoutBtn')).click();
                await driver.sleep(1000);
                
                const containerVisible = await driver.findElement(By.id('container')).isDisplayed();
                logReport('TC-05', 'Logout', 'Click Logout', 'Login Container Visible', containerVisible ? 'Login Container Visible' : 'Failed', containerVisible ? 'PASS' : 'FAIL');
            } else {
                logReport('TC-04', 'Valid Login', `User: ${testUser}`, 'Dashboard Visible', 'Dashboard not visible', 'FAIL');
            }
        } catch (e) {
            const errorMsg = await driver.findElement(By.id('login-error')).getText();
            logReport('TC-04', 'Valid Login', `User: ${testUser}`, 'Dashboard Visible', `Error: ${errorMsg}`, 'FAIL');
        }

        // TC-06: Test Invalid Username
        console.log('📝 TC-06: Testing invalid username...');
        await driver.navigate().refresh();
        await driver.wait(until.elementLocated(By.id('login-username')), 5000);
        await driver.sleep(1000);

        await driver.findElement(By.id('login-username')).sendKeys('nonexistent_user_xyz123');
        await driver.findElement(By.id('login-password')).sendKeys('TestPass123!');
        await driver.findElement(By.css('#loginForm button[type="submit"]')).click();
        await driver.sleep(2000);

        let errorMsg = await driver.findElement(By.id('login-error')).getText();
        const invalidUsernameStatus = errorMsg.includes('Invalid') ? 'PASS' : 'FAIL';
        logReport('TC-06', 'Invalid Username', 'nonexistent_user', 'Invalid Credentials Error', errorMsg, invalidUsernameStatus);

        // TC-07: Test Invalid Password
        console.log('📝 TC-07: Testing invalid password...');
        await driver.navigate().refresh();
        await driver.wait(until.elementLocated(By.id('login-username')), 5000);
        await driver.sleep(1000);

        await driver.findElement(By.id('login-username')).sendKeys(testUser);
        await driver.findElement(By.id('login-password')).sendKeys('WrongPassword123!');
        await driver.findElement(By.css('#loginForm button[type="submit"]')).click();
        await driver.sleep(2000);

        errorMsg = await driver.findElement(By.id('login-error')).getText();
        const invalidPasswordStatus = errorMsg.includes('Invalid') ? 'PASS' : 'FAIL';
        logReport('TC-07', 'Invalid Password', 'Wrong password', 'Invalid Credentials Error', errorMsg, invalidPasswordStatus);

        // TC-08: Test Empty Fields
        console.log('📝 TC-08: Testing empty fields...');
        await driver.navigate().refresh();
        await driver.wait(until.elementLocated(By.id('login-username')), 5000);
        await driver.sleep(1000);

        await driver.findElement(By.css('#loginForm button[type="submit"]')).click();
        await driver.sleep(1000);

        errorMsg = await driver.findElement(By.id('login-error')).getText();
        const emptyFieldsStatus = (errorMsg.includes('required') || errorMsg.includes('Username')) ? 'PASS' : 'FAIL';
        logReport('TC-08', 'Empty Fields', 'Both empty', 'Validation Error', errorMsg, emptyFieldsStatus);

        // TC-09: Test Show/Hide Password
        console.log('📝 TC-09: Testing show/hide password...');
        await driver.navigate().refresh();
        await driver.wait(until.elementLocated(By.id('login-password')), 5000);
        await driver.sleep(1000);

        const passwordField = await driver.findElement(By.id('login-password'));
        await passwordField.sendKeys('TestPassword');
        
        let passwordType = await passwordField.getAttribute('type');
        logReport('TC-09A', 'Password Hidden by Default', 'type attribute', 'password', passwordType, passwordType === 'password' ? 'PASS' : 'FAIL');

        const toggleIcon = await driver.findElement(By.css('[data-target="login-password"]'));
        await toggleIcon.click();
        await driver.sleep(500);

        passwordType = await passwordField.getAttribute('type');
        logReport('TC-09B', 'Password Toggle to Visible', 'Click eye icon', 'text', passwordType, passwordType === 'text' ? 'PASS' : 'FAIL');

        // TC-10: Test Forgot Password Link
        console.log('📝 TC-10: Testing forgot password...');
        await driver.navigate().refresh();
        await driver.wait(until.elementLocated(By.id('forgot-password-link')), 5000);
        await driver.sleep(1000);

        await driver.findElement(By.id('forgot-password-link')).click();
        await driver.sleep(1000);

        const modal = await driver.findElement(By.id('forgot-modal'));
        const modalVisible = await modal.isDisplayed();
        logReport('TC-10', 'Forgot Password Modal', 'Click forgot link', 'Modal opens', modalVisible ? 'Modal opened' : 'Modal not visible', modalVisible ? 'PASS' : 'FAIL');

        if (modalVisible) {
            await driver.findElement(By.id('forgot-email')).sendKeys(`${testUser}@example.com`);
            await driver.findElement(By.css('#forgotForm button[type="submit"]')).click();
            await driver.sleep(2000);

            const forgotMsg = await driver.findElement(By.id('forgot-msg')).getText();
            const forgotStatus = forgotMsg.includes('sent') || forgotMsg.includes('reset') ? 'PASS' : 'FAIL';
            logReport('TC-11', 'Forgot Password Submit', `Email: ${testUser}@example.com`, 'Success message', forgotMsg, forgotStatus);

            // Close modal
            await driver.findElement(By.css('.close-modal')).click();
            await driver.sleep(500);
        }

        // TC-12: Test Special Characters (Injection Prevention)
        console.log('📝 TC-12: Testing SQL injection prevention...');
        await driver.navigate().refresh();
        await driver.wait(until.elementLocated(By.id('login-username')), 5000);
        await driver.sleep(1000);

        await driver.findElement(By.id('login-username')).sendKeys("admin' OR '1'='1");
        await driver.findElement(By.id('login-password')).sendKeys('anything');
        await driver.findElement(By.css('#loginForm button[type="submit"]')).click();
        await driver.sleep(2000);

        errorMsg = await driver.findElement(By.id('login-error')).getText();
        const injectionStatus = errorMsg.includes('Invalid') ? 'PASS' : 'FAIL';
        logReport('TC-12', 'SQL Injection Prevention', "admin' OR '1'='1", 'Blocked/Invalid', errorMsg, injectionStatus);

        // TC-13: Test Leading/Trailing Spaces
        console.log('📝 TC-13: Testing space trimming...');
        await driver.navigate().refresh();
        await driver.wait(until.elementLocated(By.id('login-username')), 5000);
        await driver.sleep(1000);

        await driver.findElement(By.id('login-username')).sendKeys(`  ${testUser}  `);
        await driver.findElement(By.id('login-password')).sendKeys('TestPass123!');
        await driver.findElement(By.css('#loginForm button[type="submit"]')).click();
        await driver.sleep(2000);

        try {
            const dashboardAfterSpaces = await driver.findElement(By.id('dashboard'));
            const isDashVisible = await dashboardAfterSpaces.isDisplayed();
            logReport('TC-13', 'Leading/Trailing Spaces', `"  ${testUser}  "`, 'Login Success (trimmed)', isDashVisible ? 'Dashboard visible' : 'Not visible', isDashVisible ? 'PASS' : 'FAIL');
            
            if (isDashVisible) {
                await driver.findElement(By.id('logoutBtn')).click();
                await driver.sleep(1000);
            }
        } catch (e) {
            logReport('TC-13', 'Leading/Trailing Spaces', `"  ${testUser}  "`, 'Login Success', 'Failed', 'FAIL');
        }

        console.log('\n' + '═'.repeat(70));
        console.log('📊 TEST SUMMARY');
        console.log('═'.repeat(70));
        console.log(`Total Tests: ${testResults.length}`);
        console.log(`✅ Passed: ${passCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`📈 Pass Rate: ${((passCount / testResults.length) * 100).toFixed(2)}%`);
        console.log('═'.repeat(70));

        // Generate HTML Report
        generateHTMLReport();

    } catch (error) {
        console.error('\n❌ Test Error:', error.message);
        reportStream.write(`\nERROR: ${error.message}\n`);
    } finally {
        await driver.quit();
        reportStream.end();
        console.log(`\n✨ Selenium tests completed!\n`);
        process.exit(failCount > 0 ? 1 : 0);
    }
}

function generateHTMLReport() {
    const totalTests = testResults.length;
    const passRate = ((passCount / totalTests) * 100).toFixed(2);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selenium Automation Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
        .summary-card.total .value { color: #4facfe; }
        .summary-card.pass .value { color: #10b981; }
        .summary-card.fail .value { color: #ef4444; }
        .summary-card.rate .value { color: #00f2fe; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        thead {
            background: #4facfe;
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
            <h1>🤖 Selenium Automation Report</h1>
            <p>Automated UI Testing Results</p>
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
            <p style="font-size: 0.85em; color: #999; margin-top: 10px;">Selenium WebDriver - Chrome Browser</p>
        </footer>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(REPORT_FILE, html);
    console.log(`\n📄 HTML Report generated: ${REPORT_FILE}`);
}

// Run tests
runTests();
