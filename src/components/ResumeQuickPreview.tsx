import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ResumePreview } from '@/components/ResumePreview';
import { ResumeData, ResumeTemplate, templateService } from '@/lib/firebase-services';
import { Eye } from 'lucide-react';

interface ResumeQuickPreviewProps {
  resume: ResumeData;
}

export function ResumeQuickPreview({ resume }: ResumeQuickPreviewProps) {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<ResumeTemplate | null>(null);

  useEffect(() => {
    if (open) {
      const unsubscribe = templateService.subscribeToTemplates((templates) => {
        const foundTemplate = templates.find(t => t.id === resume.templateId);
        setTemplate(foundTemplate || null);
      });

      return () => unsubscribe();
    }
  }, [open, resume.templateId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" title="Quick Preview">
          <Eye className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{resume.name} - Preview</DialogTitle>
          <DialogDescription>
            {template ? `${template.name} Template • ATS Score: ${template.atsScore}%` : 'Loading template...'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {template ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-3 py-2 text-sm font-medium">
                Resume Preview
              </div>
              <div className="max-h-96 overflow-y-auto">
                <ResumePreview 
                  resumeData={resume} 
                  template={template}
                  className="border-0 shadow-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
