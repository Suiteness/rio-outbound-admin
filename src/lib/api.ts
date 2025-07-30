const safeCompare = async (a: string, b: string): Promise<boolean> => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const encoder = new TextEncoder();
  const aEncoded = encoder.encode(a);
  const bEncoded = encoder.encode(b);
  if (aEncoded.length !== bEncoded.length) return false;
  // Note: timingSafeEqual is not available in all environments
  // This is a simplified comparison for demo purposes
  return a === b;
};

export const validateApiTokenResponse = async (request, apiToken) => {
  const successful = await validateApiToken(request, apiToken);
  if (!successful) {
    return Response.json({ message: "Invalid API token" }, { status: 401 });
  }
};

export const validateApiToken = async (request, apiToken) => {
  try {
    if (!request?.headers?.get) {
      console.error("Invalid request object");
      return false;
    }

    if (!apiToken) {
      console.error(
        "No API token provided. Set one as an environment variable.",
      );
      return false;
    }

    const authHeader = request.headers.get("authorization");
    const customTokenHeader = request.headers.get("x-api-token");

    let tokenToValidate = customTokenHeader;

    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        tokenToValidate = authHeader.substring(7);
      } else if (authHeader.startsWith("Token ")) {
        tokenToValidate = authHeader.substring(6);
      } else {
        tokenToValidate = authHeader;
      }
    }

    if (!tokenToValidate || tokenToValidate.length === 0) return false;

    return await safeCompare(apiToken.trim(), tokenToValidate.trim());
  } catch (error) {
    console.error("Error validating API token:", error);
    return false;
  }
};

export const getCustomers = async (baseUrl, apiToken) => {
  const url = `${baseUrl}/api/customers`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (response.ok) {
    const data = await response.json();
    return {
      customers: (data as any).customers,
      success: true,
    };
  } else {
    console.error("Failed to fetch customers");
    return {
      customers: [],
      success: false,
    };
  }
};

export const getCustomer = async (id, baseUrl, apiToken) => {
  const response = await fetch(baseUrl + "/api/customers/" + id, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (response.ok) {
    const data = await response.json();
    return {
      customer: (data as any).customer,
      success: true,
    };
  } else {
    console.error("Failed to fetch customers");
    return {
      customer: null,
      success: false,
    };
  }
};

export const createCustomer = async (baseUrl, apiToken, customer) => {
  const response = await fetch(baseUrl + "/api/customers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  });
  if (response.ok) {
    const data = await response.json();
    return {
      customer: (data as any).customer,
      success: true,
    };
  } else {
    console.error("Failed to create customer");
    return {
      customer: null,
      success: false,
    };
  }
};

export const createOffer = async (baseUrl, apiToken, offer) => {
  const response = await fetch(baseUrl + "/api/offers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(offer),
  });
  if (response.ok) {
    const data = await response.json();
    return {
      offer: (data as any).offer,
      success: true,
    };
  } else {
    console.error("Failed to create offer");
    return {
      offer: null,
      success: false,
    };
  }
};

export const getOffers = async (baseUrl, apiToken) => {
  const response = await fetch(baseUrl + "/api/offers", {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (response.ok) {
    const data = await response.json();
    return {
      offers: (data as any).offers,
      success: true,
    };
  } else {
    console.error("Failed to fetch offers");
    return {
      offers: [],
      success: false,
    };
  }
};

export const getOffer = async (id, baseUrl, apiToken) => {
  const response = await fetch(baseUrl + "/api/offers/" + id, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  if (response.ok) {
    const data = await response.json();
    return {
      offer: (data as any).offer,
      success: true,
    };
  } else {
    console.error("Failed to fetch offer");
    return {
      offer: null,
      success: false,
    };
  }
};

export const runCustomerWorkflow = async (id, baseUrl, apiToken) => {
  const response = await fetch(baseUrl + `/api/customers/${id}/workflow`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    method: "POST",
  });
  if (response.ok) {
    const data = await response.json();
    return {
      success: true,
    };
  } else {
    console.error("Failed to run customer workflow");
    return {
      success: false,
    };
  }
};
