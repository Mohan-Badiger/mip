import { NextResponse } from 'next/server';
import dbConnect from '@/backend/config/dbConnect';
import Store from '@/backend/models/Store';
import { authenticate } from '@/backend/middlewares/authMiddleware';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const lat = searchParams.get('latitude');
    const lng = searchParams.get('longitude');
    const maxDist = searchParams.get('maxDistance'); // in meters
    const tag = searchParams.get('tag');

    const query = {};

    if (tag) {
      query.tag = tag;
    }

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json({ error: 'Invalid latitude or longitude values' }, { status: 400 });
      }

      const maxDistanceMeters = parseInt(maxDist) || 50000; // Default 50km

      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude] // longitude first in GeoJSON
          },
          $maxDistance: maxDistanceMeters
        }
      };
    }

    const stores = await Store.find(query);
    return NextResponse.json({ success: true, count: stores.length, stores });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    // Verify Admin authentication
    const user = await authenticate(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, address, phone, landline, hours, tag, coordinates } = body;

    // coordinates must be [longitude, latitude]
    if (!name || !address || !phone || !hours || !coordinates || coordinates.length !== 2) {
      return NextResponse.json({ error: 'Missing required store details or coordinates format [longitude, latitude]' }, { status: 400 });
    }

    const newStore = new Store({
      name,
      address,
      phone,
      landline,
      hours,
      tag,
      location: {
        type: 'Point',
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      }
    });

    await newStore.save();

    return NextResponse.json({ success: true, store: newStore }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
