
'use client';

import { useState, useEffect } from 'react';
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
  const [hasCopiedTag, setHasCopiedTag] = useState(false);
  const [hasCopiedScript, setHasCopiedScript] = useState(false);
  
  const scriptSrc = `https://cdn.jsdelivr.net/gh/ChrisBust/studio@alt-history/public/review-widget.js`;
  const embedTag = `<review-widget widgetId="${widgetId}"></review-widget>`;
  const scriptTag = `<script src="${scriptSrc}" async defer></script>`;

  const copyToClipboard = (text: string, type: 'tag' | 'script') => {
    navigator.clipboard.writeText(text);
    if (type === 'tag') {
      setHasCopiedTag(true);
      setTimeout(() => setHasCopiedTag(false), 2000);
    } else {
      setHasCopiedScript(true);
      setTimeout(() => setHasCopiedScript(false), 2000);
    }
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
            Follow these two steps to embed your widget on your website.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="embed-tag" className='flex items-center gap-2'>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">1</span>
                <span>Paste this tag in your site where the widget should appear.</span>
            </Label>
            <div className="relative">
              <pre className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap break-all">
                <code>{embedTag}</code>
              </pre>
              <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={() => copyToClipboard(embedTag, 'tag')}>
                {hasCopiedTag ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy Embed Tag</span>
              </Button>
            </div>
          </div>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="embed-script" className='flex items-center gap-2'>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">2</span>
                <span>Paste this script once per page, just before the closing &lt;/body&gt; tag.</span>
            </Label>
            <div className="relative">
              <pre className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap break-all">
                <code>{scriptTag}</code>
              </pre>
              <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={() => copyToClipboard(scriptTag, 'script')}>
                {hasCopiedScript ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy Script Tag</span>
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

