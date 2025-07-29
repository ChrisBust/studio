
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Widget from '@/models/widget';
import { z } from 'zod';

interface Params {
  id: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: Request, { params }: { params: Params }) {
  await dbConnect();
  try {
    const widget = await Widget.findById(params.id);
    if (!widget) {
      return NextResponse.json({ success: false, error: 'Widget not found' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ success: true, data: widget }, { headers: corsHeaders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400, headers: corsHeaders });
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  await dbConnect();
  try {
    const widget = await Widget.findByIdAndUpdate(params.id, await request.json(), {
      new: true,
      runValidators: true,
    });
    if (!widget) {
      return NextResponse.json({ success: false, error: 'Widget not found' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ success: true, data: widget }, { headers: corsHeaders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400, headers: corsHeaders });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  await dbConnect();
  try {
    const deletedWidget = await Widget.findByIdAndDelete(params.id);
    if (!deletedWidget) {
      return NextResponse.json({ success: false, error: 'Widget not found' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ success: true, data: {} }, { headers: corsHeaders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400, headers: corsHeaders });
  }
}

const AddReviewSchema = z.object({
  name: z.string().min(2),
  stars: z.coerce.number().min(1).max(5),
  text: z.string().min(10),
  source: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: Params }) {
  await dbConnect();
  try {
    const formData = await request.formData();
    const validatedFields = AddReviewSchema.safeParse({
      name: formData.get('name'),
      stars: formData.get('stars'),
      text: formData.get('text'),
      source: formData.get('source'),
    });
    
    if (!validatedFields.success) {
      return NextResponse.json({ success: false, error: validatedFields.error.flatten().fieldErrors }, { status: 400, headers: corsHeaders });
    }

    const { name, stars, text, source } = validatedFields.data;
    
    const widget = await Widget.findById(params.id);
    if (!widget) {
      return NextResponse.json({ success: false, error: 'Widget not found' }, { status: 404, headers: corsHeaders });
    }

    widget.reviews.push({ name, stars, text, source: source || 'Direct' });
    await widget.save();
    
    return NextResponse.json({ success: true, data: widget }, { status: 201, headers: corsHeaders });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
