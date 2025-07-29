
'use client';

import { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function EmbedCodeButton({ widgetId }: { widgetId: string }) {
  const [hasCopied, setHasCopied] = useState(false);
  
  // This produces an iframe that can be embedded anywhere.
  // The src points to the dedicated widget page.
  const embedCode = `<iframe src="${window.location.origin}/widget/${widgetId}" width="100%" height="600px" frameborder="0"></iframe>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex-1">
          <Code className="mr-2 h-4 w-4" />
          Embed Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Embed Your Widget</DialogTitle>
          <DialogDescription>
            Copy and paste this code into your website's HTML where you want the widget to appear.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="embed-code">HTML Embed Code</Label>
            <div className="relative">
              <pre className="p-3 bg-muted rounded-md text-sm overflow-x-auto">
                <code>{embedCode}</code>
              </pre>
              <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={copyToClipboard}>
                {hasCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy Code</span>
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
