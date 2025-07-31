export interface PhoneCall {
  id: number;
  customer_id: number;
  to_number: string;
  from_number: string;
  agent_id?: string;
  agent_template_id?: string;
  initialization_values?: string;
  gigaml_call_id?: string;
  status: 'pending' | 'initiating' | 'initiated' | 'connected' | 'completed' | 'failed';
  duration_seconds?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePhoneCallParams {
  customer_id: number;
  to_number: string;
  from_number: string;
  agent_id?: string;
  agent_template_id?: string;
  initialization_values?: Record<string, any>;
}

export class PhoneCallService {
  constructor(private db: D1Database) {}

  async getPhoneCallsByCustomer(customerId: number): Promise<PhoneCall[]> {
    const result = await this.db
      .prepare("SELECT * FROM phone_calls WHERE customer_id = ? ORDER BY created_at DESC")
      .bind(customerId)
      .all();
    
    return result.results as unknown as PhoneCall[];
  }

  async getAllPhoneCalls(limit = 50, offset = 0): Promise<PhoneCall[]> {
    const result = await this.db
      .prepare("SELECT * FROM phone_calls ORDER BY created_at DESC LIMIT ? OFFSET ?")
      .bind(limit, offset)
      .all();
    
    return result.results as unknown as PhoneCall[];
  }

  async getPhoneCallById(id: number): Promise<PhoneCall | null> {
    const result = await this.db
      .prepare("SELECT * FROM phone_calls WHERE id = ?")
      .bind(id)
      .first();
    
    return result as unknown as PhoneCall | null;
  }

  async updatePhoneCallStatus(
    id: number, 
    status: PhoneCall['status'], 
    gigamlCallId?: string,
    errorMessage?: string
  ): Promise<boolean> {
    let query = "UPDATE phone_calls SET status = ?, updated_at = CURRENT_TIMESTAMP";
    const params: any[] = [status];

    if (gigamlCallId) {
      query += ", gigaml_call_id = ?";
      params.push(gigamlCallId);
    }

    if (errorMessage) {
      query += ", error_message = ?";
      params.push(errorMessage);
    }

    query += " WHERE id = ?";
    params.push(id);

    const result = await this.db.prepare(query).bind(...params).run();
    return result.success;
  }

  async getPhoneCallStats(): Promise<{
    total: number;
    pending: number;
    completed: number;
    failed: number;
  }> {
    const result = await this.db
      .prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
        FROM phone_calls
      `)
      .first();

    return result as any;
  }
}
