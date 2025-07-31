export interface TextMessage {
  id: number;
  customer_id: number;
  to_number: string;
  from_number: string;
  message_content: string;
  agent_id?: string;
  agent_template_id?: string;
  initialization_values?: string;
  gigaml_message_id?: string;
  status: 'pending' | 'sending' | 'sent' | 'delivered' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTextMessageParams {
  customer_id: number;
  to_number: string;
  from_number: string;
  message_content: string;
  agent_id?: string;
  agent_template_id?: string;
  initialization_values?: Record<string, any>;
}

export class TextMessageService {
  constructor(private db: D1Database) {}

  async getTextMessagesByCustomer(customerId: number): Promise<TextMessage[]> {
    const result = await this.db
      .prepare("SELECT * FROM text_messages WHERE customer_id = ? ORDER BY created_at DESC")
      .bind(customerId)
      .all();
    
    return result.results as unknown as TextMessage[];
  }

  async getAllTextMessages(limit = 50, offset = 0): Promise<TextMessage[]> {
    const result = await this.db
      .prepare("SELECT * FROM text_messages ORDER BY created_at DESC LIMIT ? OFFSET ?")
      .bind(limit, offset)
      .all();
    
    return result.results as unknown as TextMessage[];
  }

  async getTextMessageById(id: number): Promise<TextMessage | null> {
    const result = await this.db
      .prepare("SELECT * FROM text_messages WHERE id = ?")
      .bind(id)
      .first();
    
    return result as unknown as TextMessage | null;
  }

  async updateTextMessageStatus(
    id: number, 
    status: TextMessage['status'], 
    gigamlMessageId?: string,
    errorMessage?: string
  ): Promise<boolean> {
    let query = "UPDATE text_messages SET status = ?, updated_at = CURRENT_TIMESTAMP";
    const params: any[] = [status];

    if (gigamlMessageId) {
      query += ", gigaml_message_id = ?";
      params.push(gigamlMessageId);
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

  async getTextMessageStats(): Promise<{
    total: number;
    pending: number;
    sent: number;
    failed: number;
  }> {
    const result = await this.db
      .prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'sent' OR status = 'delivered' THEN 1 ELSE 0 END) as sent,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
        FROM text_messages
      `)
      .first();

    return result as any;
  }
}
