import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { withAuth } from '@/lib/withAuth';
import { logAdminAction } from '@/lib/auditLogger';

// Map display role names to DB role values
const ROLE_MAP = {
  'Super Admin': 'admin',
  'Catalog Manager': 'catalog-manager',
  'CMS Editor': 'cms-editor',
  'Sales Representative': 'sales-rep'
};

const ROLE_DISPLAY = {
  'admin': 'Super Admin',
  'catalog-manager': 'Catalog Manager',
  'cms-editor': 'CMS Editor',
  'sales-rep': 'Sales Representative'
};

const ADMIN_ROLES = ['admin', 'catalog-manager', 'cms-editor', 'sales-rep'];

// GET - List all staff users
export const GET = withAuth(async function GET() {
  try {
    await dbConnect();
    const users = await User.find({ role: { $in: ADMIN_ROLES } })
      .select('-password')
      .sort({ createdAt: -1 });

    const result = users.map(u => ({
      _id: u._id,
      name: u.name || '',
      email: u.email,
      phone: u.phone || '',
      role: ROLE_DISPLAY[u.role] || u.role,
      status: u.status || 'Active',
      joinedDate: u.createdAt
        ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        : 'N/A',
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching staff users:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred while fetching staff users.' }, { status: 500 });
  }
}, ['admin']);

// POST - Create a new staff user
export const POST = withAuth(async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, phone, role, status, password } = body;

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ success: false, error: 'Name, email, phone, and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'A user with this email already exists.' }, { status: 400 });
    }

    const dbRole = ROLE_MAP[role] || 'sales-rep';
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      role: dbRole,
      status: status || 'Active',
      password: hashedPassword,
    });

    await logAdminAction(req, {
      action: 'CREATE',
      entity: 'StaffUser',
      entityId: newUser._id,
      description: `Created staff user "${name}" with role ${role}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: ROLE_DISPLAY[newUser.role] || newUser.role,
        status: newUser.status,
        joinedDate: new Date(newUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      },
    });
  } catch (error) {
    console.error('Error creating staff user:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred while creating staff user.' }, { status: 500 });
  }
}, ['admin']);

// PUT - Update an existing staff user
export const PUT = withAuth(async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, name, email, phone, role, status, password } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'User ID (_id) is required.' }, { status: 400 });
    }

    const user = await User.findById(_id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Staff user not found.' }, { status: 404 });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email.toLowerCase();
    if (phone !== undefined) updates.phone = phone;
    if (role !== undefined) updates.role = ROLE_MAP[role] || role;
    if (status !== undefined) updates.status = status;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    await logAdminAction(req, {
      action: 'UPDATE',
      entity: 'StaffUser',
      entityId: _id,
      description: `Updated staff user "${updatedUser.name}"`,
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: ROLE_DISPLAY[updatedUser.role] || updatedUser.role,
        status: updatedUser.status,
        joinedDate: new Date(updatedUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      },
    });
  } catch (error) {
    console.error('Error updating staff user:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred while updating staff user.' }, { status: 500 });
  }
}, ['admin']);

// DELETE - Remove a staff user
export const DELETE = withAuth(async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID (id) parameter is required.' }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Staff user not found.' }, { status: 404 });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return NextResponse.json({ success: false, error: 'Cannot remove the last Super Admin account.' }, { status: 400 });
      }
    }

    await User.findByIdAndDelete(id);

    await logAdminAction(req, {
      action: 'DELETE',
      entity: 'StaffUser',
      entityId: id,
      description: `Deleted staff user "${user.name}"`,
    });

    return NextResponse.json({ success: true, message: 'Staff user removed successfully.' });
  } catch (error) {
    console.error('Error deleting staff user:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred while deleting staff user.' }, { status: 500 });
  }
}, ['admin']);
