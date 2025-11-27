import Customer, { validateCustomerUpdate, validateAddress, validateAddressUpdate } from '../models/Customer.js';
import bcrypt from 'bcrypt';

// ==================== GET ALL CUSTOMERS ====================
export async function getAllCustomers(req, res) {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            isVerified, 
            isActive,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = {};

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Status filters
        if (isVerified !== undefined) {
            query.isVerified = isVerified === 'true';
        }
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === 'desc' ? -1 : 1;

        const customers = await Customer.find(query)
            .select('-password -emailVerificationToken -resetPasswordToken -otpCode')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Customer.countDocuments(query);

        res.status(200).json({
            success: true,
            customers,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (err) {
        console.error('Get all customers error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== GET CUSTOMER BY ID ====================
export async function getCustomerById(req, res) {
    try {
        const { id } = req.params;

        const customer = await Customer.findById(id)
            .select('-password -emailVerificationToken -resetPasswordToken -otpCode')
            .lean();

        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        res.status(200).json({
            success: true,
            customer
        });

    } catch (err) {
        console.error('Get customer by ID error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== GET CURRENT CUSTOMER PROFILE ====================
export async function getProfile(req, res) {
    try {
        const { _id } = req.user;

        const customer = await Customer.findById(_id)
            .select('-password -emailVerificationToken -resetPasswordToken -otpCode')
            .lean();

        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        res.status(200).json({
            success: true,
            customer
        });

    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== UPDATE CUSTOMER PROFILE ====================
export async function updateProfile(req, res) {
    try {
        const { _id } = req.user;
        const { error } = validateCustomerUpdate(req.body);

        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const updateData = { ...req.body };

        // Handle profile image upload
        if (req.file) {
            updateData.profileImage = `/uploads/images/${req.file.filename}`;
        }

        // Don't allow updating sensitive fields
        delete updateData.password;
        delete updateData.email;
        delete updateData.role;
        delete updateData.isVerified;
        delete updateData.isActive;

        const customer = await Customer.findByIdAndUpdate(
            _id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password -emailVerificationToken -resetPasswordToken -otpCode');

        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            customer
        });

    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== UPDATE CUSTOMER BY ID (ADMIN) ====================
export async function updateCustomerById(req, res) {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Handle profile image upload
        if (req.file) {
            updateData.profileImage = `/uploads/images/${req.file.filename}`;
        }

        // Hash password if being updated
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const customer = await Customer.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password -emailVerificationToken -resetPasswordToken -otpCode');

        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Customer updated successfully',
            customer
        });

    } catch (err) {
        console.error('Update customer error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== DELETE CUSTOMER ====================
export async function deleteCustomer(req, res) {
    try {
        const { id } = req.params;

        const customer = await Customer.findByIdAndDelete(id);

        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Customer deleted successfully'
        });

    } catch (err) {
        console.error('Delete customer error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== DEACTIVATE ACCOUNT ====================
export async function deactivateAccount(req, res) {
    try {
        const { _id } = req.user;

        const customer = await Customer.findByIdAndUpdate(
            _id,
            { isActive: false },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Account deactivated successfully',
            customer
        });

    } catch (err) {
        console.error('Deactivate account error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== CHANGE PASSWORD ====================
export async function changePassword(req, res) {
    try {
        const { _id } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false,
                message: 'Current password and new password are required' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: 'New password must be at least 6 characters' 
            });
        }

        const customer = await Customer.findById(_id);
        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, customer.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: 'Current password is incorrect' 
            });
        }

        // Hash and update new password
        customer.password = await bcrypt.hash(newPassword, 10);
        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== UPLOAD PROFILE PHOTO ====================
export async function uploadProfilePhoto(req, res) {
    try {
        const { _id } = req.user;

        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No file uploaded' 
            });
        }

        const profileImage = `/uploads/images/${req.file.filename}`;

        const customer = await Customer.findByIdAndUpdate(
            _id,
            { profileImage },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully',
            profileImage,
            customer
        });

    } catch (err) {
        console.error('Upload profile photo error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// ==================== ADDRESS MANAGEMENT ====================

// Get all addresses
export async function getAddresses(req, res) {
    try {
        const { _id } = req.user;

        const customer = await Customer.findById(_id).select('addresses defaultAddressId');

        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        res.status(200).json({
            success: true,
            addresses: customer.addresses,
            defaultAddressId: customer.defaultAddressId
        });

    } catch (err) {
        console.error('Get addresses error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// Add new address
export async function addAddress(req, res) {
    try {
        const { _id } = req.user;
        const { error } = validateAddress(req.body);

        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const customer = await Customer.findById(_id);

        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        // If this is the first address or marked as default, set it as default
        const isFirstAddress = customer.addresses.length === 0;
        const newAddress = {
            ...req.body,
            isDefault: isFirstAddress || req.body.isDefault
        };

        // If setting as default, unset other defaults
        if (newAddress.isDefault) {
            customer.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        customer.addresses.push(newAddress);
        
        // Set default address ID
        if (newAddress.isDefault) {
            customer.defaultAddressId = customer.addresses[customer.addresses.length - 1]._id;
        }

        await customer.save();

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            address: customer.addresses[customer.addresses.length - 1],
            addresses: customer.addresses
        });

    } catch (err) {
        console.error('Add address error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// Update address
export async function updateAddress(req, res) {
    try {
        const { _id } = req.user;
        const { addressId } = req.params;
        const { error } = validateAddressUpdate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const customer = await Customer.findById(_id);

        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        const addressIndex = customer.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({ 
                success: false,
                message: 'Address not found' 
            });
        }

        // If setting as default, unset other defaults
        if (req.body.isDefault) {
            customer.addresses.forEach(addr => {
                addr.isDefault = false;
            });
            customer.defaultAddressId = addressId;
        }

        // Update address
        customer.addresses[addressIndex] = {
            ...customer.addresses[addressIndex].toObject(),
            ...req.body,
            _id: customer.addresses[addressIndex]._id
        };

        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            address: customer.addresses[addressIndex],
            addresses: customer.addresses
        });

    } catch (err) {
        console.error('Update address error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// Delete address
export async function deleteAddress(req, res) {
    try {
        const { _id } = req.user;
        const { addressId } = req.params;

        const customer = await Customer.findById(_id);

        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        const addressIndex = customer.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({ 
                success: false,
                message: 'Address not found' 
            });
        }

        const wasDefault = customer.addresses[addressIndex].isDefault;

        // Remove address
        customer.addresses.splice(addressIndex, 1);

        // If deleted address was default, set first remaining address as default
        if (wasDefault && customer.addresses.length > 0) {
            customer.addresses[0].isDefault = true;
            customer.defaultAddressId = customer.addresses[0]._id;
        } else if (customer.addresses.length === 0) {
            customer.defaultAddressId = null;
        }

        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
            addresses: customer.addresses
        });

    } catch (err) {
        console.error('Delete address error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}

// Set default address
export async function setDefaultAddress(req, res) {
    try {
        const { _id } = req.user;
        const { addressId } = req.params;

        const customer = await Customer.findById(_id);

        if (!customer) {
            return res.status(404).json({ 
                success: false,
                message: 'Customer not found' 
            });
        }

        const addressExists = customer.addresses.some(
            addr => addr._id.toString() === addressId
        );

        if (!addressExists) {
            return res.status(404).json({ 
                success: false,
                message: 'Address not found' 
            });
        }

        // Unset all defaults
        customer.addresses.forEach(addr => {
            addr.isDefault = addr._id.toString() === addressId;
        });

        customer.defaultAddressId = addressId;
        await customer.save();

        res.status(200).json({
            success: true,
            message: 'Default address set successfully',
            addresses: customer.addresses,
            defaultAddressId: customer.defaultAddressId
        });

    } catch (err) {
        console.error('Set default address error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: err.message 
        });
    }
}
