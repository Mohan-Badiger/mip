import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import User from '@/backend/models/User';
import { authenticate } from '@/backend/middlewares/authMiddleware';

/**
 * PUT /api/v1/auth/profile
 * Persists profile updates (name, phone, primaryAddress) for the authenticated user.
 */
export async function PUT(req) {
  try {
    await dbConnect();
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, primaryAddress } = await req.json();

    const updateFields = {};

    if (name && name.trim()) {
      updateFields.name = name.trim();
    }

    if (phone && phone.trim()) {
      updateFields.phone = phone.trim();
    }

    // Persist the primary address into the addresses array
    if (primaryAddress) {
      const { street, city, state, pincode } = primaryAddress;
      if (!street || !city || !state || !pincode) {
        return NextResponse.json({ error: 'All address fields (street, city, state, pincode) are required' }, { status: 400 });
      }

      if (!/^[0-9]{6}$/.test(pincode)) {
        return NextResponse.json({ error: 'Pincode must be exactly 6 digits' }, { status: 400 });
      }

      const existingUser = await User.findById(user._id);
      const defaultIndex = existingUser.addresses.findIndex(a => a.isDefault);

      if (defaultIndex >= 0) {
        // Update the existing default address in place
        existingUser.addresses[defaultIndex].street = street.trim();
        existingUser.addresses[defaultIndex].city = city.trim();
        existingUser.addresses[defaultIndex].state = state.trim();
        existingUser.addresses[defaultIndex].pincode = pincode.trim();
        await existingUser.save();
      } else {
        // Insert a new default address
        updateFields['$push'] = {
          addresses: {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            isDefault: true,
            tag: 'home'
          }
        };
      }
    }

    // Apply scalar updates (name, phone)
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        addresses: updatedUser.addresses
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
