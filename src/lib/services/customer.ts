export const CUSTOMER_QUERIES = {
  BASE_SELECT: `
    SELECT 
      customers.*,
      offers.id as offer_id,
      offers.hotel_offer,
      offers.food_offer,
      offers.bonus_play_offer,
      offers.offer_start_date,
      offers.offer_end_date,
      offers.validity_start_date,
      offers.validity_end_date
    FROM customers 
    LEFT JOIN offers 
      ON customers.id = offers.customer_id
  `,
  INSERT_CUSTOMER: `INSERT INTO customers (firstName, lastName, email, phoneNumber, playerId, playerTier, optPhone, optText, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  GET_BY_ID: `WHERE customers.id = ?`,
  GET_BY_EMAIL: `WHERE customers.email = ?`,
};

const processCustomerResults = (rows: any[]) => {
  const customersMap = new Map();

  rows.forEach((row) => {
    if (!customersMap.has(row.id)) {
      const customer = { ...row };
      customer.offers = [];
      customersMap.set(row.id, customer);
    }

    const customer = customersMap.get(row.id);
    
    if (row.offer_id) {
      customer.offers.push({
        id: row.offer_id,
        hotel_offer: row.hotel_offer,
        food_offer: row.food_offer,
        bonus_play_offer: row.bonus_play_offer,
        offer_start_date: row.offer_start_date,
        offer_end_date: row.offer_end_date,
        validity_start_date: row.validity_start_date,
        validity_end_date: row.validity_end_date,
      });
    }

    // Clean up raw join fields
    delete customer.offer_id;
    delete customer.hotel_offer;
    delete customer.food_offer;
    delete customer.bonus_play_offer;
    delete customer.offer_start_date;
    delete customer.offer_end_date;
    delete customer.validity_start_date;
    delete customer.validity_end_date;
  });

  return Array.from(customersMap.values());
};

export class CustomerService {
  private DB: D1Database;

  constructor(DB: D1Database) {
    this.DB = DB;
  }

  async getById(id: number) {
    const query = `${CUSTOMER_QUERIES.BASE_SELECT} ${CUSTOMER_QUERIES.GET_BY_ID}`;
    const response = await this.DB.prepare(query).bind(id).all();

    if (response.success) {
      const [customer] = processCustomerResults(response.results);
      return customer;
    }
    return null;
  }

  async getByEmail(email: string) {
    const query = `${CUSTOMER_QUERIES.BASE_SELECT} ${CUSTOMER_QUERIES.GET_BY_EMAIL}`;
    const response = await this.DB.prepare(query).bind(email).all();

    if (response.success) {
      const [customer] = processCustomerResults(response.results);
      return customer;
    }
    return null;
  }

  async getAll() {
    const query = `${CUSTOMER_QUERIES.BASE_SELECT} ORDER BY customers.id ASC`;
    const response = await this.DB.prepare(query).all();

    if (response.success) {
      return processCustomerResults(response.results);
    }
    return [];
  }

  async create(customerData: {
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    playerId?: number;
    playerTier?: string;
    optPhone: boolean;
    optText: boolean;
    notes?: string;
  }) {
    const { firstName, lastName, email, phoneNumber, playerId, playerTier, optPhone, optText, notes } = customerData;

    const customerResponse = await this.DB.prepare(
      CUSTOMER_QUERIES.INSERT_CUSTOMER,
    )
      .bind(firstName, lastName, email || null, phoneNumber || null, playerId || null, playerTier || null, optPhone ? 1 : 0, optText ? 1 : 0, notes || null)
      .run();

    if (!customerResponse.success) {
      throw new Error("Failed to create customer");
    }

    const customerId = customerResponse.meta.last_row_id;

    return { success: true, customerId };
  }
}
