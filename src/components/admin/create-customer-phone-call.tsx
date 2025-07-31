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
import { Phone } from "lucide-react";
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
  agent_id: v.optional(v.string()),
  agent_template_id: v.optional(v.string()),
  initialization_values: v.optional(v.string()),
});

type FormData = v.InferInput<typeof formSchema>;

interface CreateCustomerPhoneCallProps {
  customerId: number;
  customerPhone?: string;
  customerName?: string;
  customerOffers?: Array<{
    id: number;
    hotel_offer?: string;
    food_offer?: string;
    bonus_play_offer?: string;
    offer_start_date?: string;
    offer_end_date?: string;
    validity_start_date?: string;
    validity_end_date?: string;
  }>;
  onSuccess?: () => void;
}

export function CreateCustomerPhoneCall({
  customerId,
  customerPhone,
  customerName,
  customerOffers = [],
  onSuccess,
}: CreateCustomerPhoneCallProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<v.InferInput<typeof formSchema>>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      to_number: customerPhone?.startsWith("+")
        ? customerPhone
        : customerPhone
        ? `+1${customerPhone}`
        : "",
      from_number: "",
      agent_id: "",
      agent_template_id: "",
      initialization_values: (() => {
        const baseValues = {
          customer_name: customerName || "",
          customer_id: customerId.toString(),
          purpose: "customer_outreach",
        };

        // Find the most recent valid offer
        const currentOffer = customerOffers.find(offer => {
          const now = new Date();
          const validityStart = offer.validity_start_date ? new Date(offer.validity_start_date) : null;
          const validityEnd = offer.validity_end_date ? new Date(offer.validity_end_date) : null;
          
          return (!validityStart || validityStart <= now) && 
                 (!validityEnd || validityEnd >= now);
        }) || customerOffers[customerOffers.length - 1]; // Fallback to latest offer

        if (currentOffer) {
          return JSON.stringify({
            ...baseValues,
            current_offer: {
              id: currentOffer.id,
              hotel_offer: currentOffer.hotel_offer,
              food_offer: currentOffer.food_offer,
              bonus_play_offer: currentOffer.bonus_play_offer,
              offer_start_date: currentOffer.offer_start_date,
              offer_end_date: currentOffer.offer_end_date,
              validity_start_date: currentOffer.validity_start_date,
              validity_end_date: currentOffer.validity_end_date,
            }
          }, null, 2);
        }

        return customerName ? JSON.stringify(baseValues, null, 2) : "";
      })(),
    },
  });

  async function onSubmit(data: v.InferInput<typeof formSchema>) {
    setIsLoading(true);
    try {
      let initValues;
      if (data.initialization_values?.trim()) {
        try {
          initValues = JSON.parse(data.initialization_values);
        } catch {
          form.setError("initialization_values", {
            type: "manual",
            message: "Must be valid JSON",
          });
          setIsLoading(false);
          return;
        }
      }

      // Validate that at least one agent field is provided
      if (!data.agent_id?.trim() && !data.agent_template_id?.trim()) {
        form.setError("agent_id", {
          type: "manual",
          message: "Either Agent ID or Agent Template ID must be provided",
        });
        form.setError("agent_template_id", {
          type: "manual",
          message: "Either Agent ID or Agent Template ID must be provided",
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/phone-calls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customerId,
          to_number: data.to_number,
          from_number: data.from_number,
          agent_id: data.agent_id?.trim() || undefined,
          agent_template_id: data.agent_template_id?.trim() || undefined,
          initialization_values: initValues,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          (error as any).error || "Failed to initiate phone call"
        );
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
      console.error("Error initiating phone call:", error);
      form.setError("root", {
        type: "manual",
        message:
          error instanceof Error
            ? error.message
            : "Failed to initiate phone call",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Phone className="mr-2 h-4 w-4" />
          Call Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Initiate Phone Call to {customerName}</DialogTitle>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="agent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent ID</FormLabel>
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
                    <FormLabel>Agent Template ID</FormLabel>
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
                  <FormLabel>Initialization Values (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"customer_name":"John Doe","customer_id":"1","purpose":"customer_outreach","current_offer":{"id":1,"hotel_offer":"Free night","food_offer":"$50 credit"}}'
                      className="min-h-[120px]"
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
                {isLoading ? "Initiating..." : "Initiate Call"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
