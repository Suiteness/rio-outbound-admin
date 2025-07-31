import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as v from "valibot";

const formSchema = v.object({
  to_number: v.pipe(
    v.string(),
    v.regex(
      /^\+\d{10,15}$/,
      "Phone number must be in international format (+1234567890)"
    )
  ),
  from_number: v.pipe(
    v.string(),
    v.regex(
      /^\+\d{10,15}$/,
      "Phone number must be in international format (+1234567890)"
    )
  ),
  message_content: v.pipe(
    v.string(),
    v.minLength(1, "Message content is required"),
    v.maxLength(1600, "Message content must be less than 1600 characters")
  ),
  agent_id: v.optional(v.string()),
  agent_template_id: v.optional(v.string()),
  initialization_values: v.optional(v.string()),
});

type FormData = v.InferInput<typeof formSchema>;

interface CreateCustomerTextMessageProps {
  customerId: number;
  customerPhone?: string;
  customerName?: string;
  onSuccess?: () => void;
}

export function CreateCustomerTextMessage({
  customerId,
  customerPhone,
  customerName,
  onSuccess,
}: CreateCustomerTextMessageProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      to_number: customerPhone?.startsWith("+")
        ? customerPhone
        : customerPhone
        ? `+1${customerPhone}`
        : "",
      from_number: "",
      message_content: "",
      agent_id: "",
      agent_template_id: "",
      initialization_values: customerName
        ? JSON.stringify(
            {
              customer_name: customerName,
              customer_id: customerId.toString(),
              purpose: "customer_outreach",
            },
            null,
            2
          )
        : "",
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    try {
      // Parse initialization_values as JSON if provided
      let initValues = undefined;
      if (values.initialization_values?.trim()) {
        try {
          initValues = JSON.parse(values.initialization_values);
        } catch (error) {
          form.setError("initialization_values", {
            type: "manual",
            message: "Must be valid JSON",
          });
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch("/api/text-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customerId,
          to_number: values.to_number,
          from_number: values.from_number,
          message_content: values.message_content,
          agent_id: values.agent_id?.trim() || undefined,
          agent_template_id: values.agent_template_id?.trim() || undefined,
          initialization_values: initValues,
        }),
      });

      if (!response.ok) {
        const error: any = await response.json();
        throw new Error((error as any).error || "Failed to send text message");
      }

      setOpen(false);
      form.reset();
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior for Astro islands - refresh the page
        window.location.reload();
      }
    } catch (error) {
      console.error("Error sending text message:", error);
      form.setError("root", {
        type: "manual",
        message:
          error instanceof Error
            ? error.message
            : "Failed to send text message",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          Text Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Text Message to {customerName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+15551234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="from_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+18005551234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message_content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hello! This is a message from our team..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="agent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="agent_12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agent_template_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Template ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="template_sales_001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="initialization_values"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initialization Values (JSON, Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"customer_name":"John Doe","customer_id":"1","purpose":"customer_outreach"}'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
