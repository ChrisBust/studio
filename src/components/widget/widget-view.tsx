
'use client';

import { useMemo } from 'react';
import type { IWidget } from '@/models/widget';
import StarRating from './star-rating';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '../ui/progress';
import { AddReviewDialog } from './add-review-dialog';
import { Star, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WidgetViewProps {
  widget: IWidget;
}

const ReviewGrid = ({ reviews }: { reviews: IWidget['reviews'] }) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <div key={review._id.toString()} className="h-full">
            <Card className="flex flex-col h-full bg-card">
            <CardContent className="flex-1 p-6 space-y-4">
                <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={`https://placehold.co/40x40.png?text=${review.name.charAt(0)}`} data-ai-hint="person avatar" />
                    <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.source} review</p>
                </div>
                </div>
                <StarRating rating={review.stars} />
                <p className="text-sm text-foreground/80 pt-2">{review.text}</p>
            </CardContent>
            </Card>
        </div>
      ))}
    </div>
);


export default function WidgetView({ widget }: WidgetViewProps) {
  const { overallRating, totalReviews, ratingDistribution, reviewsBySource, sources } = useMemo(() => {
    if (!widget.reviews || widget.reviews.length === 0) {
      return {
        overallRating: 0,
        totalReviews: 0,
        ratingDistribution: [0, 0, 0, 0, 0],
        reviewsBySource: {},
        sources: [],
      };
    }

    const total = widget.reviews.reduce((acc, review) => acc + review.stars, 0);
    const overall = total / widget.reviews.length;

    const distribution = Array(5).fill(0);
    const sourceCounts: { [key: string]: { count: number; totalStars: number; reviews: IWidget['reviews'] } } = {};

    const sortedReviews = [...widget.reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    for (const review of sortedReviews) {
      distribution[5 - review.stars]++;
      if (!sourceCounts[review.source]) {
        sourceCounts[review.source] = { count: 0, totalStars: 0, reviews: [] };
      }
      sourceCounts[review.source].count++;
      sourceCounts[review.source].totalStars += review.stars;
      sourceCounts[review.source].reviews.push(review);
    }

    return {
      overallRating: overall,
      totalReviews: widget.reviews.length,
      ratingDistribution: distribution,
      reviewsBySource: sourceCounts,
      sources: Object.keys(sourceCounts).sort(),
    };
  }, [widget.reviews]);
  
  const allReviewsSorted = useMemo(() => {
    return widget.reviews ? [...widget.reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
  }, [widget.reviews]);

  return (
    <div className="p-4 sm:p-6 bg-background text-foreground min-h-screen font-body">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">{widget.businessName}</h1>
          <a href={widget.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {widget.website}
          </a>
        </header>

        {totalReviews > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="md:col-span-1 flex flex-col items-center justify-center text-center p-6 bg-card">
                <p className="text-5xl font-bold">{overallRating.toFixed(1)}</p>
                <StarRating rating={overallRating} />
                <p className="text-muted-foreground mt-2">Based on {totalReviews} reviews</p>
              </Card>
              <Card className="md:col-span-2 p-6 bg-card">
                <h2 className="font-semibold mb-3">Rating distribution</h2>
                <div className="space-y-2">
                  {ratingDistribution.map((count, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground w-6 text-right">{5 - i}</span>
                      <Star className="w-4 h-4 text-accent" />
                      <Progress value={(count / totalReviews) * 100} className="w-full h-2" />
                      <span className="text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{totalReviews > 0 ? "What people are saying" : "Be the first to leave a review"}</h2>
            <AddReviewDialog widgetId={widget._id.toString()} businessName={widget.businessName} />
          </div>
          {totalReviews > 0 ? (
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                {sources.map(source => (
                    <TabsTrigger key={source} value={source}>{source}</TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <ReviewGrid reviews={allReviewsSorted} />
              </TabsContent>
               {sources.map(source => (
                <TabsContent key={source} value={source} className="mt-4">
                    <ReviewGrid reviews={reviewsBySource[source].reviews} />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-lg bg-card text-muted-foreground">
              <MessageSquare className="mx-auto h-12 w-12" />
              <h3 className="mt-2 text-lg font-semibold">No reviews yet</h3>
              <p>Your widget is ready to collect feedback.</p>
            </div>
          )}
        </div>

        <footer className="text-center mt-12">
          <p className="text-sm text-muted-foreground">Powered by Widget Wizard</p>
        </footer>
      </div>
    </div>
  );
}
