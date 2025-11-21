import express from 'express';
import {
    getAllCustomers,
    getCustomerById,
    getProfile,
    updateProfile,
    updateCustomerById,
    deleteCustomer,
    deactivateAccount,
    changePassword,
    uploadProfilePhoto,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from '../controllers/customerController.js';
import { checkToken, checkAdmin } from '../middlewares/auth.js';
import multerConfig from '../middlewares/multer-config.js';

const router = express.Router();

// ==================== PROTECTED CUSTOMER ROUTES ====================
// All routes require authentication

// Profile Management
router.get('/profile', checkToken, getProfile);
router.put('/profile', checkToken, multerConfig, updateProfile);
router.post('/profile/upload-photo', checkToken, multerConfig, uploadProfilePhoto);
router.post('/profile/change-password', checkToken, changePassword);
router.post('/profile/deactivate', checkToken, deactivateAccount);

// Address Management
router.get('/addresses', checkToken, getAddresses);
router.post('/addresses', checkToken, addAddress);
router.put('/addresses/:addressId', checkToken, updateAddress);
router.delete('/addresses/:addressId', checkToken, deleteAddress);
router.post('/addresses/:addressId/set-default', checkToken, setDefaultAddress);

// ==================== ADMIN ROUTES ====================
// Require admin privileges

// Get all customers (admin only)
router.get('/', checkToken, checkAdmin, getAllCustomers);

// Get customer by ID (admin only)
router.get('/:id', checkToken, checkAdmin, getCustomerById);

// Update customer by ID (admin only)
router.put('/:id', checkToken, checkAdmin, multerConfig, updateCustomerById);

// Delete customer (admin only)
router.delete('/:id', checkToken, checkAdmin, deleteCustomer);

export default router;
