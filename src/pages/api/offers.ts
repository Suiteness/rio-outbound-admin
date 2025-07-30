import { validateApiTokenResponse } from "@/lib/api";
import { OfferService } from "@/lib/services/offer";

export async function GET({ locals, params, request }) {
  const { API_TOKEN, DB } = locals.runtime.env;

  const invalidTokenResponse = await validateApiTokenResponse(
    request,
    API_TOKEN,
  );
  if (invalidTokenResponse) return invalidTokenResponse;

  const offerService = new OfferService(DB);

  try {
    const offers = await offerService.getAll();
    return Response.json({ offers });
  } catch (error) {
    return Response.json(
      { message: "Couldn't load offers" },
      { status: 500 },
    );
  }
}

export async function POST({ locals, request }) {
  const { API_TOKEN, DB } = locals.runtime.env;

  const invalidTokenResponse = await validateApiTokenResponse(
    request,
    API_TOKEN,
  );
  if (invalidTokenResponse) return invalidTokenResponse;

  const offerService = new OfferService(DB);

  try {
    const body = await request.json();
    await offerService.create(body);
    return Response.json(
      {
        message: "Offer created successfully",
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        message: error.message || "Failed to create offer",
        success: false,
      },
      { status: 500 },
    );
  }
}
