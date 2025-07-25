
import dbConnect from '@/lib/mongodb';
import Widget from '@/models/widget';
import { ImportReviewsForm } from '@/components/dashboard/import-reviews-form';

export const dynamic = 'force-dynamic';

async function getWidgets() {
  await dbConnect();
  const widgets = await Widget.find({}).select('businessName _id').sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(widgets));
}

export default async function ImportReviewsPage() {
  const widgets = await getWidgets();

  return (
    <div className="container mx-auto py-6">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Import Reviews
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Bulk import reviews from a JSON array.
            </p>
          </div>
        </div>
      <div className="max-w-4xl mx-auto">
        <ImportReviewsForm widgets={widgets} />
      </div>
    </div>
  );
}
