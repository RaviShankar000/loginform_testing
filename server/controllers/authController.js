const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register User
exports.register = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let { username, email, password } = req.body;

    try {
        // Trim inputs
        username = username.trim();
        email = email.trim().toLowerCase();
        
        // Additional validation
        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ msg: 'Username must be between 3 and 30 characters' });
        }
        
        if (password.length < 8 || password.length > 128) {
            return res.status(400).json({ msg: 'Password must be between 8 and 128 characters' });
        }

        // Check if user exists with email
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        // Check username (case-insensitive to prevent similar usernames)
        const sanitizedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        user = await User.findOne({ username: { $regex: new RegExp(`^${sanitizedUsername}$`, 'i') } });
        if (user) {
            return res.status(400).json({ msg: 'Username is already taken' });
        }

        // Hash password with bcrypt (salt rounds = 12 for better security)
        const hashedPassword = await bcrypt.hash(password, 12);

        user = new User({
            username,
            email,
            password: hashedPassword,
            failedLoginAttempts: 0,
            lockUntil: null
        });

        await user.save();

        const payload = {
            user: {
                id: user.id,
                username: user.username
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secretKey',
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        username: user.username, 
                        email: user.email 
                    },
                    msg: 'Registration Successful' 
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Login User
exports.login = async (req, res) => {
    let { username, password } = req.body;

    try {
        console.log('Login attempt:', { username, passwordProvided: !!password });
        
        // Trim leading/trailing spaces from username
        username = username ? username.trim() : '';
        
        // Validate empty inputs
        if (!username) {
            return res.status(400).json({ msg: 'Username/Email is required' });
        }
        
        if (!password) {
            return res.status(400).json({ msg: 'Password is required' });
        }

        // Sanitize username to prevent injection
        // Escape special regex characters
        const sanitizedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Find user by username or email (Case Insensitive for lookup)
        // But password check is CASE SENSITIVE
        const user = await User.findOne({
            $or: [
                { username: { $regex: new RegExp(`^${sanitizedUsername}$`, 'i') } },
                { email: { $regex: new RegExp(`^${sanitizedUsername}$`, 'i') } }
            ]
        });

        console.log('User found:', !!user);
        
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Check Account Lock
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
            return res.status(403).json({ 
                msg: `Account is locked due to multiple failed login attempts. Try again in ${remaining} minutes.`,
                locked: true
            });
        }

        // Reset lock if expired
        if (user.lockUntil && user.lockUntil <= Date.now()) {
            user.lockUntil = null;
            user.failedLoginAttempts = 0;
        }

        // Check Password (CASE SENSITIVE)
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Increment failed attempts
            user.failedLoginAttempts += 1;

            // Check if attempts exceed limit (5 attempts)
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lock
                await user.save();
                return res.status(403).json({ 
                    msg: 'Account locked due to multiple failed login attempts. Please try again after 15 minutes.',
                    locked: true
                });
            }
            
            await user.save();
            const remainingAttempts = 5 - user.failedLoginAttempts;
            return res.status(400).json({ 
                msg: `Invalid Credentials. ${remainingAttempts} attempt(s) remaining before account lock.`,
                remainingAttempts
            });
        }

        // Reset failed attempts on success
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        user.lastLogin = Date.now();
        await user.save();

        // Create JWT
        const payload = {
            user: {
                id: user.id,
                username: user.username
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secretKey',
            { expiresIn: '1h' }, // 1 hour
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        username: user.username, 
                        email: user.email,
                        lastLogin: user.lastLogin
                    },
                    msg: 'Login successful' 
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// Forgot Password (Mock)
exports.forgotPassword = async (req, res) => {
    // Generate token, save to user, send email (mock)
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User with this email does not exist' });
        }

        // Generate reset token (simple random string for demo)
        // In production use crypto
        const resetToken = Array.from({ length: 20 }, () => Math.floor(Math.random() * 36).toString(36)).join('');

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email mock
        console.log(`[EMAIL SEND] To: ${email}, Token: ${resetToken}`);

        res.json({ msg: 'Password reset link sent to email (Check server console for token)' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
        }

        // Update password
        user.password = bcrypt.hashSync(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        // Optionally unlock account if locked
        user.lockUntil = null;
        user.failedLoginAttempts = 0;

        await user.save();

        res.json({ msg: 'Password has been updated' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Current User Profile (Protected)
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -__v');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.logout = (req, res) => {
    // Client side clears token. Server can blacklist token if using Redis/DB, but JWT is stateless usually.
    res.json({ msg: 'Logged out successfully' });
};
