"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as v from "valibot";
import { valibotResolver } from "@hookform/resolvers/valibot";

interface CreateCustomerOfferButtonProps {
  apiToken: string;
  customerId: number;
  customerName: string;
}

const createOfferSchema = v.object({
  customer_id: v.number(),
  hotel_offer: v.optional(v.string()),
  food_offer: v.optional(v.string()),
  bonus_play_offer: v.optional(v.string()),
  offer_start_date: v.pipe(v.string(), v.minLength(1)),
  offer_end_date: v.pipe(v.string(), v.minLength(1)),
  validity_start_date: v.pipe(v.string(), v.minLength(1)),
  validity_end_date: v.pipe(v.string(), v.minLength(1)),
});

type CreateOfferForm = v.InferInput<typeof createOfferSchema>;

export function CreateCustomerOfferButton({
  apiToken,
  customerId,
  customerName,
}: CreateCustomerOfferButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateOfferForm>({
    resolver: valibotResolver(createOfferSchema),
    defaultValues: {
      customer_id: customerId,
      hotel_offer: "",
      food_offer: "",
      bonus_play_offer: "",
      offer_start_date: "",
      offer_end_date: "",
      validity_start_date: "",
      validity_end_date: "",
    },
  });

  async function onSubmit(values: CreateOfferForm) {
    try {
      setIsLoading(true);

      const response = await fetch("/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create offer");
      }

      form.reset({
        customer_id: customerId,
        hotel_offer: "",
        food_offer: "",
        bonus_play_offer: "",
        offer_start_date: "",
        offer_end_date: "",
        validity_start_date: "",
        validity_end_date: "",
      });
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error creating offer:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Offer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Offer</DialogTitle>
          <DialogDescription>
            Create a new offer for {customerName}. All date fields are required.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="hotel_offer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Offer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter hotel offer details (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="food_offer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Offer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter food offer details (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bonus_play_offer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bonus Play Offer</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter bonus play offer details (optional)"
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
                name="offer_start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offer_end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validity_start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validity Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validity_end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validity End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create Offer"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
