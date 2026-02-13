const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

// Register Route
router.post('/register', [
    check('username', 'Username is required and must be between 3 and 30 characters')
        .isLength({ min: 3, max: 30 })
        .trim()
        .escape(), // Basic sanitization
    check('email', 'Please include a valid email')
        .isEmail()
        .normalizeEmail(), // Sanitization
    check('password', 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character')
        .isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
], authController.register);

// Login Route
router.post('/login', [
    check('username', 'Username is required').exists().trim().escape(),
    check('password', 'Password is required').exists()
], authController.login);

// Forgot Password Route
router.post('/forgot-password', [
    check('email', 'Please include a valid email').isEmail().normalizeEmail()
], authController.forgotPassword);

// Reset Password Route
router.post('/reset-password/:token', [
    check('newPassword', 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character')
        .isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
], authController.resetPassword);

// Get User Profile (Protected)
router.get('/profile', authMiddleware, authController.getCurrentUser);

// Logout Route
router.get('/logout', authController.logout);

module.exports = router;
