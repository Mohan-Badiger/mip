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

    const existingUser = await User.findById(user._id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (name && name.trim()) {
      existingUser.name = name.trim();
    }

    if (phone && phone.trim()) {
      existingUser.phone = phone.trim();
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

      const defaultIndex = existingUser.addresses.findIndex(a => a.isDefault);

      if (defaultIndex >= 0) {
        // Update the existing default address in place
        existingUser.addresses[defaultIndex].street = street.trim();
        existingUser.addresses[defaultIndex].city = city.trim();
        existingUser.addresses[defaultIndex].state = state.trim();
        existingUser.addresses[defaultIndex].pincode = pincode.trim();
      } else {
        // Push a new default address
        existingUser.addresses.push({
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          isDefault: true,
          tag: 'home'
        });
      }
    }

    await existingUser.save();

    return NextResponse.json({
      success: true,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
        role: existingUser.role,
        addresses: existingUser.addresses
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/auth/profile
 * Permanently deletes the authenticated user's account and clears their session.
 */
export async function DELETE(req) {
  try {
    await dbConnect();
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'customer') {
      return NextResponse.json({ error: 'Only customer accounts can be self-deleted.' }, { status: 403 });
    }

    const deletedUser = await User.findByIdAndDelete(user._id);
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });

    // Clear the JWT authentication cookie
    response.headers.set(
      'Set-Cookie',
      'accessToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    );

    return response;
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
