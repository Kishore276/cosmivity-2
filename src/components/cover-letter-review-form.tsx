

import { useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// TODO: Re-implement AI flow types when needed
type CoverLetterReviewInput = {
  coverLetterText: string;
  profession: string;
};

type CoverLetterReviewOutput = {
  feedback: string;
};
import { useToast } from "@/hooks/use-toast";
import { OrbitalLoader } from "@/components/ui/orbital-loader";

const formSchema = z.object({
  coverLetterText: z.string().min(100, "Cover letter text must be at least 100 characters long."),
  profession: z.string().min(2, "Profession is required."),
});

type CoverLetterReviewFormProps = {
  onReview: (input: CoverLetterReviewInput) => Promise<CoverLetterReviewOutput | undefined>;
};

export function CoverLetterReviewForm({ onReview }: CoverLetterReviewFormProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coverLetterText: "",
      profession: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setFeedback(null);
    startTransition(() => {
      onReview(values).then((result) => {
        if (result) {
          setFeedback(result.feedback);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to get cover letter feedback. Please try again.",
          });
        }
      }).catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get cover letter feedback. Please try again.",
        });
      });
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Submit Your Cover Letter</CardTitle>
              <CardDescription>
                Paste your cover letter and specify the profession for AI-powered feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="coverLetterText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your full cover letter text here..."
                        className="h-96 resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Profession</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <OrbitalLoader className="h-6 w-6" />}
                Review My Cover Letter
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline">Feedback</h2>
        <Card className="min-h-[40rem]">
          <CardContent className="p-6">
            {isPending && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                 <OrbitalLoader message="Analyzing your cover letter..." />
              </div>
            )}
            {feedback && !isPending && (
              <div className="prose prose-sm max-w-none text-foreground dark:prose-invert" dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br />') }} />
            )}
            {!feedback && !isPending && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>Your AI-generated feedback will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
