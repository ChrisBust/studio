
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { IWidget } from '@/models/widget';
import { importReviews, type ImportState } from '@/lib/actions';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Importing Reviews...' : 'Import Reviews'}
    </Button>
  );
}

const jsonPlaceholder = [
  {
    "User": "Jane Doe",
    "Rate": 5,
    "commentary": "Absolutely fantastic service! Highly recommended."
  },
  {
    "User": "John Smith",
    "Rate": 4,
    "commentary": "Great experience, very helpful staff. The product was exactly as described."
  }
];

export function ImportReviewsForm({ widgets }: { widgets: Pick<IWidget, '_id' | 'businessName'>[] }) {
  const initialState: ImportState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useActionState(importReviews, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Success!',
          description: state.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Import Error',
          description: state.message,
        });
      }
    }
  }, [state, toast]);

  return (
    <form action={dispatch}>
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Reviews</CardTitle>
          <CardDescription>
            Select a widget, provide a source, and paste your JSON array of reviews.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="widgetId">Target Widget</Label>
              <Select name="widgetId" required>
                <SelectTrigger id="widgetId" aria-describedby="widgetId-error">
                  <SelectValue placeholder="Select a widget" />
                </SelectTrigger>
                <SelectContent>
                  {widgets.map((widget) => (
                    <SelectItem key={widget._id.toString()} value={widget._id.toString()}>
                      {widget.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.widgetId && (
                <p id="widgetId-error" className="text-sm text-destructive">
                  {state.errors.widgetId.join(', ')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Review Source</Label>
              <Input
                id="source"
                name="source"
                placeholder="e.g., Yelp, Google, Facebook"
                required
                aria-describedby="source-error"
              />
              {state.errors?.source && (
                <p id="source-error" className="text-sm text-destructive">
                  {state.errors.source.join(', ')}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reviewsJson">Reviews JSON Array</Label>
            <Textarea
              id="reviewsJson"
              name="reviewsJson"
              className="min-h-[200px] font-mono text-sm"
              placeholder={JSON.stringify(jsonPlaceholder, null, 2)}
              required
              aria-describedby="reviewsJson-error"
            />
             {state.errors?.reviewsJson && (
              <p id="reviewsJson-error" className="text-sm text-destructive">
                {state.errors.reviewsJson.join(', ')}
              </p>
            )}
          </div>
          
           <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>JSON Structure</AlertTitle>
            <AlertDescription>
              Your JSON must be an array of objects, each with `User` (string), `Rate` (number 1-5), and `commentary` (string) keys.
            </AlertDescription>
          </Alert>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Imported reviews will be added to the selected widget.
          </p>
          <div className='flex gap-2'>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <SubmitButton />
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
