
'use client';

import { useMemo } from 'react';
import { Bot, Clock, ExternalLink, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { IWidget } from '@/models/widget';
import DeleteWidgetButton from './delete-widget-button';
import EmbedCodeButton from './embed-code-button';
import PreviewWidgetDialog from './preview-widget-dialog';
import { ManageReviewsDialog } from './manage-reviews-dialog';

interface WidgetCardProps {
  widget: IWidget;
}

export function WidgetCard({ widget }: WidgetCardProps) {
  const widgetData = JSON.parse(JSON.stringify(widget));
  
  const overallRating = useMemo(() => {
    if (!widget.reviews || widget.reviews.length === 0) return 0;
    const total = widget.reviews.reduce((acc, review) => acc + review.stars, 0);
    return total / widget.reviews.length;
  }, [widget.reviews]);

  return (
    <Card className="flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
      <CardHeader className="grid grid-cols-[1fr_auto] items-start gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl">{widgetData.businessName}</CardTitle>
          <a href={widgetData.website} target='_blank' rel='noopener noreferrer' className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            {widgetData.website} <ExternalLink className="w-3 h-3"/>
          </a>
        </div>
        <div className="flex items-center justify-center bg-primary/10 text-primary rounded-lg p-3">
            <Bot className="h-6 w-6" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center justify-between text-sm text-primary-foreground bg-primary p-3 rounded-md">
            <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-accent" />
                <span className="font-bold">{overallRating.toFixed(1)}</span>
                <span>({widgetData.reviews.length} reviews)</span>
            </div>
            <div className="flex items-center">
                <Clock className="mr-1.5 h-4 w-4" />
                <span>{formatDistanceToNow(new Date(widgetData.updatedAt), { addSuffix: true })}</span>
            </div>
        </div>
        <p className='text-sm text-muted-foreground pt-2'>Use the actions below to manage, preview, or embed your widget.</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 items-stretch">
        <div className="flex gap-2">
            <PreviewWidgetDialog widget={widgetData} />
            <EmbedCodeButton widgetId={widgetData._id} />
        </div>
        <div className='flex gap-2'>
            <ManageReviewsDialog widget={widgetData} />
            <DeleteWidgetButton widgetId={widgetData._id} />
        </div>
      </CardFooter>
    </Card>
  );
}
