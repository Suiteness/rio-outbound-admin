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
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createCustomer } from "@/lib/api";
import * as v from "valibot";

const formSchema = v.object({
  firstName: v.pipe(
    v.string(),
    v.minLength(2, "First name must be at least 2 characters")
  ),
  lastName: v.pipe(
    v.string(),
    v.minLength(2, "Last name must be at least 2 characters")
  ),
  email: v.optional(
    v.union([
      v.literal(""),
      v.pipe(v.string(), v.email("Invalid email address")),
    ])
  ),
  phoneNumber: v.optional(v.string()),
  playerId: v.optional(
    v.pipe(
      v.number(),
      v.integer("Player ID must be an integer"),
      v.minValue(1, "Player ID must be greater than 0")
    )
  ),
  playerTier: v.optional(v.string()),
  optPhone: v.boolean(),
  optText: v.boolean(),
  notes: v.optional(v.string()),
});

type FormValues = v.InferOutput<typeof formSchema>;

export function CreateCustomerButton({ apiToken }: { apiToken: string }) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: valibotResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      playerId: undefined,
      playerTier: "",
      optPhone: false,
      optText: false,
      notes: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const url = new URL(window.location.href);
      const response = await createCustomer(url.origin, apiToken, data);

      if (!response.success) {
        throw new Error("Failed to create customer");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter customer email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
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
                name="playerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player ID (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter player ID"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : parseInt(value, 10)
                          );
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="playerTier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player Tier (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter player tier" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="optPhone"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel>Opt-in for Phone</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="optText"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel>Opt-in for Text</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" type="submit">
              Create Customer
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
