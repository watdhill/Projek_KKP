// Quick test to check if masterDataController has syntax errors
try {
    const controller = require('./src/controllers/masterDataController.js');
    console.log('✓ masterDataController loaded successfully');
    console.log('Available exports:', Object.keys(controller));
} catch (error) {
    console.error('✗ Error loading masterDataController:');
    console.error(error.message);
    console.error(error.stack);
}
