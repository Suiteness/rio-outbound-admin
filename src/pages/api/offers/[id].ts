import { validateApiTokenResponse } from "@/lib/api";
import { OfferService } from "@/lib/services/offer";

export async function GET({ locals, params, request }) {
  const { id } = params;
  const { API_TOKEN, DB } = locals.runtime.env;

  const invalidTokenResponse = await validateApiTokenResponse(
    request,
    API_TOKEN,
  );
  if (invalidTokenResponse) return invalidTokenResponse;

  const offerService = new OfferService(DB);

  try {
    const offer = await offerService.getById(parseInt(id));

    if (!offer) {
      return Response.json(
        { message: "Offer not found" },
        { status: 404 },
      );
    }

    return Response.json({ offer });
  } catch (error) {
    return Response.json(
      { message: "Couldn't load offer" },
      { status: 500 },
    );
  }
}

export async function PUT({ locals, params, request }) {
  const { id } = params;
  const { API_TOKEN, DB } = locals.runtime.env;

  const invalidTokenResponse = await validateApiTokenResponse(
    request,
    API_TOKEN,
  );
  if (invalidTokenResponse) return invalidTokenResponse;

  const offerService = new OfferService(DB);

  try {
    const body = await request.json();
    await offerService.update(parseInt(id), body);
    return Response.json(
      {
        message: "Offer updated successfully",
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        message: error.message || "Failed to update offer",
        success: false,
      },
      { status: 500 },
    );
  }
}

export async function DELETE({ locals, params, request }) {
  const { id } = params;
  const { API_TOKEN, DB } = locals.runtime.env;

  const invalidTokenResponse = await validateApiTokenResponse(
    request,
    API_TOKEN,
  );
  if (invalidTokenResponse) return invalidTokenResponse;

  const offerService = new OfferService(DB);

  try {
    await offerService.delete(parseInt(id));
    return Response.json(
      {
        message: "Offer deleted successfully",
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        message: error.message || "Failed to delete offer",
        success: false,
      },
      { status: 500 },
    );
  }
}
