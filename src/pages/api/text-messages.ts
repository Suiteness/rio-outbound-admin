import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body: any = await request.json();
    const { 
      customer_id, 
      to_number, 
      from_number,
      message_content,
      agent_id, 
      agent_template_id, 
      initialization_values 
    } = body;

    // Validate required fields
    if (!customer_id || !to_number || !from_number || !message_content) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: customer_id, to_number, from_number, message_content' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(to_number) || !phoneRegex.test(from_number)) {
      return new Response(
        JSON.stringify({ 
          error: 'Phone numbers must be in international format (+1234567890)' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { DB, TEXT_MESSAGE_WORKFLOW } = locals.runtime.env as any;

    // Insert text message record into database
    const insertResult = await DB.prepare(`
      INSERT INTO text_messages (
        customer_id, to_number, from_number, message_content, agent_id, agent_template_id, 
        initialization_values, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      customer_id,
      to_number,
      from_number,
      message_content,
      agent_id || null,
      agent_template_id || null,
      initialization_values ? JSON.stringify(initialization_values) : null
    ).run();

    if (!insertResult.success) {
      return new Response(
        JSON.stringify({ error: 'Failed to create text message record' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const textMessageId = insertResult.meta.last_row_id;

    // Trigger the text message workflow
    const workflowInstance = await TEXT_MESSAGE_WORKFLOW.create({
      params: {
        textMessageId: textMessageId,
        toNumber: to_number,
        fromNumber: from_number,
        messageContent: message_content,
        agentId: agent_id,
        agentTemplateId: agent_template_id,
        initializationValues: initialization_values,
      },
    });

    return new Response(
      JSON.stringify({
        text_message_id: textMessageId,
        workflow_instance_id: workflowInstance.id,
        status: 'pending'
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating text message:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
