export const OFFER_QUERIES = {
  BASE_SELECT: `
    SELECT 
      offers.*,
      customers.firstName,
      customers.lastName,
      customers.email
    FROM offers
    LEFT JOIN customers ON offers.customer_id = customers.id
  `,
  INSERT_OFFER: `
    INSERT INTO offers (
      customer_id, 
      hotel_offer, 
      food_offer, 
      bonus_play_offer, 
      offer_start_date, 
      offer_end_date, 
      validity_start_date, 
      validity_end_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  UPDATE_OFFER: `
    UPDATE offers SET 
      hotel_offer = ?, 
      food_offer = ?, 
      bonus_play_offer = ?, 
      offer_start_date = ?, 
      offer_end_date = ?, 
      validity_start_date = ?, 
      validity_end_date = ?
    WHERE id = ?
  `,
  DELETE_OFFER: `DELETE FROM offers WHERE id = ?`,
  GET_BY_ID: `WHERE offers.id = ?`,
  GET_BY_CUSTOMER_ID: `WHERE offers.customer_id = ?`,
};

export interface Offer {
  id?: number;
  customer_id: number;
  hotel_offer?: string;
  food_offer?: string;
  bonus_play_offer?: string;
  offer_start_date: string;
  offer_end_date: string;
  validity_start_date: string;
  validity_end_date: string;
  created_at?: string;
  updated_at?: string;
  // Customer details when joining
  firstName?: string;
  lastName?: string;
  email?: string;
}

export class OfferService {
  private DB: D1Database;

  constructor(DB: D1Database) {
    this.DB = DB;
  }

  async getById(id: number): Promise<Offer | null> {
    const query = `${OFFER_QUERIES.BASE_SELECT} ${OFFER_QUERIES.GET_BY_ID}`;
    const response = await this.DB.prepare(query).bind(id).first();

    if (response) {
      return response as unknown as Offer;
    }
    return null;
  }

  async getByCustomerId(customerId: number): Promise<Offer[]> {
    const query = `${OFFER_QUERIES.BASE_SELECT} ${OFFER_QUERIES.GET_BY_CUSTOMER_ID} ORDER BY offers.offer_start_date DESC`;
    const response = await this.DB.prepare(query).bind(customerId).all();

    if (response.success) {
      return response.results as unknown as Offer[];
    }
    return [];
  }

  async getAll(): Promise<Offer[]> {
    const query = `${OFFER_QUERIES.BASE_SELECT} ORDER BY offers.offer_start_date DESC`;
    const response = await this.DB.prepare(query).all();

    if (response.success) {
      return response.results as unknown as Offer[];
    }
    return [];
  }

  async create(offerData: Omit<Offer, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; offerId?: number }> {
    const {
      customer_id,
      hotel_offer,
      food_offer,
      bonus_play_offer,
      offer_start_date,
      offer_end_date,
      validity_start_date,
      validity_end_date,
    } = offerData;

    const response = await this.DB.prepare(OFFER_QUERIES.INSERT_OFFER)
      .bind(
        customer_id,
        hotel_offer || null,
        food_offer || null,
        bonus_play_offer || null,
        offer_start_date,
        offer_end_date,
        validity_start_date,
        validity_end_date
      )
      .run();

    if (response.success) {
      return { success: true, offerId: response.meta.last_row_id };
    }

    throw new Error("Failed to create offer");
  }

  async update(id: number, offerData: Partial<Omit<Offer, 'id' | 'customer_id' | 'created_at' | 'updated_at'>>): Promise<{ success: boolean }> {
    // Get current offer to fill in missing fields
    const currentOffer = await this.getById(id);
    if (!currentOffer) {
      throw new Error("Offer not found");
    }

    const {
      hotel_offer = currentOffer.hotel_offer,
      food_offer = currentOffer.food_offer,
      bonus_play_offer = currentOffer.bonus_play_offer,
      offer_start_date = currentOffer.offer_start_date,
      offer_end_date = currentOffer.offer_end_date,
      validity_start_date = currentOffer.validity_start_date,
      validity_end_date = currentOffer.validity_end_date,
    } = offerData;

    const response = await this.DB.prepare(OFFER_QUERIES.UPDATE_OFFER)
      .bind(
        hotel_offer || null,
        food_offer || null,
        bonus_play_offer || null,
        offer_start_date,
        offer_end_date,
        validity_start_date,
        validity_end_date,
        id
      )
      .run();

    if (response.success) {
      return { success: true };
    }

    throw new Error("Failed to update offer");
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const response = await this.DB.prepare(OFFER_QUERIES.DELETE_OFFER)
      .bind(id)
      .run();

    if (response.success) {
      return { success: true };
    }

    throw new Error("Failed to delete offer");
  }
}
