
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import dbConnect from './mongodb';
import Widget from '@/models/widget';
import User from '@/models/user';
import bcrypt from 'bcryptjs';

const CreateWidgetSchema = z.object({
  businessName: z.string().min(2, { message: 'Business name must be at least 2 characters.' }),
  website: z.string().url({ message: 'Please enter a valid URL.' }),
});

export type State = {
  errors?: {
    businessName?: string[];
    website?: string[];
  };
  message?: string | null;
};

export async function createWidget(prevState: State, formData: FormData) {
  const validatedFields = CreateWidgetSchema.safeParse({
    businessName: formData.get('businessName'),
    website: formData.get('website'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to create widget. Please check the fields.',
    };
  }

  const { businessName, website } = validatedFields.data;

  try {
    await dbConnect();

    const newWidget = new Widget({
      businessName,
      website,
      reviews: [], // Start with an empty reviews array
    });

    await newWidget.save();
  } catch (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to create widget.',
    };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function deleteWidget(id: string) {
  if (!id) {
    throw new Error('ID is required to delete a widget.');
  }

  try {
    await dbConnect();
    await Widget.findByIdAndDelete(id);
    revalidatePath('/dashboard');
    return { message: 'Widget deleted successfully.' };
  } catch (error) {
    console.error(error);
    return { message: 'Database Error: Failed to delete widget.' };
  }
}

const AddReviewSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  stars: z.coerce.number().min(1, 'Please select a star rating.').max(5),
  text: z.string().min(10, { message: 'Review must be at least 10 characters.' }),
  source: z.string().optional(),
});

export type AddReviewState = {
  errors?: {
    name?: string[];
    stars?: string[];
    text?: string[];
    source?: string[];
  };
  message?: string | null;
}

export async function addReview(widgetId: string, prevState: AddReviewState, formData: FormData) {
  const validatedFields = AddReviewSchema.safeParse({
    name: formData.get('name'),
    stars: formData.get('stars'),
    text: formData.get('text'),
    source: formData.get('source'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to submit review. Please check the fields.',
    };
  }

  const { name, stars, text, source } = validatedFields.data;

  try {
    await dbConnect();

    const widget = await Widget.findById(widgetId);

    if (!widget) {
      return { message: 'Widget not found.' };
    }

    widget.reviews.push({
      name,
      stars,
      text,
      source: source || 'Direct',
      createdAt: new Date(),
    });

    await widget.save();
    
    revalidatePath('/dashboard');
    revalidatePath(`/widget/${widgetId}`);
    return { message: 'Thank you for your review!' };

  } catch (error) {
    console.error(error);
    return { message: 'Database Error: Failed to add review.' };
  }
}

export async function deleteReview(widgetId: string, reviewId: string) {
  try {
    await dbConnect();
    
    await Widget.findByIdAndUpdate(widgetId, {
      $pull: { reviews: { _id: reviewId } },
    });

    revalidatePath('/dashboard');
    revalidatePath(`/widget/${widgetId}`);
    
    return { success: true, message: 'Review deleted successfully.' };
  } catch (error) {
    console.error('Failed to delete review:', error);
    return { success: false, message: 'Database Error: Failed to delete review.' };
  }
}

// Schema for a single review in the bulk import
const ImportReviewSchema = z.object({
  User: z.string().min(1, 'User name cannot be empty.'),
  Rate: z.coerce.number().min(1, 'Rate must be between 1 and 5.').max(5, 'Rate must be between 1 and 5.'),
  commentary: z.string().min(1, 'Commentary cannot be empty.'),
});

// Schema for the entire import form
const ImportReviewsSchema = z.object({
  widgetId: z.string().min(1, 'Please select a widget.'),
  source: z.string().min(1, 'Source cannot be empty.'),
  reviewsJson: z.string().min(1, 'JSON content cannot be empty.'),
});

export type ImportState = {
  errors?: {
    widgetId?: string[];
    source?: string[];
    reviewsJson?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function importReviews(prevState: ImportState, formData: FormData): Promise<ImportState> {
  // 1. Validate form fields
  const validatedFields = ImportReviewsSchema.safeParse({
    widgetId: formData.get('widgetId'),
    source: formData.get('source'),
    reviewsJson: formData.get('reviewsJson'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to import. Please check the form fields.',
      success: false,
    };
  }

  const { widgetId, source, reviewsJson } = validatedFields.data;

  // 2. Parse and validate JSON content
  let reviewsToImport;
  try {
    reviewsToImport = JSON.parse(reviewsJson);
    if (!Array.isArray(reviewsToImport)) {
      throw new Error();
    }
  } catch (e) {
    return {
      errors: { reviewsJson: ['Invalid JSON format. Please provide a valid JSON array.'] },
      message: 'Invalid JSON format.',
      success: false,
    };
  }

  const validatedReviews = z.array(ImportReviewSchema).safeParse(reviewsToImport);
  if (!validatedReviews.success) {
    return {
      errors: { reviewsJson: ['The JSON array contains items with an invalid structure.'] },
      message: 'One or more reviews in the JSON have an invalid structure. ' + validatedReviews.error.issues.map(i => i.path.join('.') + ': ' + i.message).join('; '),
      success: false,
    };
  }

  try {
    await dbConnect();
    const widget = await Widget.findById(widgetId);

    if (!widget) {
      return { message: 'Target widget not found.', success: false };
    }

    const newReviews = validatedReviews.data.map(review => ({
      name: review.User,
      stars: review.Rate,
      text: review.commentary,
      source: source,
      createdAt: new Date(),
    }));

    widget.reviews.push(...newReviews);
    await widget.save();
    
    revalidatePath('/dashboard');
    revalidatePath(`/widget/${widgetId}`);
    
    return { 
      message: `Successfully imported ${newReviews.length} reviews to "${widget.businessName}".`,
      success: true,
    };

  } catch (error) {
    console.error(error);
    return { message: 'Database Error: Failed to import reviews.', success: false };
  }
}


export async function authenticate(prevState: any, formData: FormData) {
  await dbConnect();
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const user = await User.findOne({ user: username });
  if (!user) {
    return { message: 'Invalid credentials.' };
  }

  const passwordsMatch = await bcrypt.compare(password, user.password);
  if (!passwordsMatch) {
    return { message: 'Invalid credentials.' };
  }

  // Here you can generate the session and redirect to the dashboard
  // For example, using your encrypt and cookies function
  return { message: 'Login successful.' };
}
