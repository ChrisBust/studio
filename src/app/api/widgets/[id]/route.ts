
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Widget from '@/models/widget';
import { z } from 'zod';

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  await dbConnect();
  try {
    const widget = await Widget.findById(params.id);
    if (!widget) {
      return NextResponse.json({ success: false, error: 'Widget not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: widget });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
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
      return NextResponse.json({ success: false, error: 'Widget not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: widget });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  await dbConnect();
  try {
    const deletedWidget = await Widget.findByIdAndDelete(params.id);
    if (!deletedWidget) {
      return NextResponse.json({ success: false, error: 'Widget not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
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
    const body = await request.json();
    const validatedFields = AddReviewSchema.safeParse(body);
    
    if (!validatedFields.success) {
      return NextResponse.json({ success: false, error: validatedFields.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, stars, text, source } = validatedFields.data;
    
    const widget = await Widget.findById(params.id);
    if (!widget) {
      return NextResponse.json({ success: false, error: 'Widget not found' }, { status: 404 });
    }

    widget.reviews.push({ name, stars, text, source: source || 'Direct' });
    await widget.save();
    
    return NextResponse.json({ success: true, data: widget }, { status: 201 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
