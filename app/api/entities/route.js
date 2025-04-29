import { NextResponse } from 'next/server';
import { getEntities, addEntity } from '../../../lib/dataStore.js';
import { validateEntity } from '../../../lib/validation.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    let entities = getEntities();

    if (search) {
      entities = entities.filter(entity =>
        entity.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    const start = (page - 1) * limit;
    const paginated = entities.slice(start, start + limit);

    return NextResponse.json(paginated, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req) {
  const entity = await req.json();

  const errors = validateEntity(entity); 
  if (errors.length) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    const created = addEntity(entity); // No need to await, it’s sync
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 409 }); 
  }
}
