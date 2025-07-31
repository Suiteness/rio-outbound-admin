import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body: any = await request.json();
    const { 
      customer_id, 
      to_number, 
      from_number, 
      agent_id, 
      agent_template_id, 
      initialization_values 
    } = body;

    // Validate required fields
    if (!customer_id || !to_number || !from_number) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: customer_id, to_number, from_number' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate that either agent_id or agent_template_id is provided
    if (!agent_id && !agent_template_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Either agent_id or agent_template_id must be provided' 
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

    const { DB, PHONE_CALL_WORKFLOW } = locals.runtime.env as any;

    // Insert phone call record into database
    const insertResult = await DB.prepare(`
      INSERT INTO phone_calls (
        customer_id, to_number, from_number, agent_id, agent_template_id, 
        initialization_values, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      customer_id,
      to_number,
      from_number,
      agent_id || null,
      agent_template_id || null,
      initialization_values ? JSON.stringify(initialization_values) : null
    ).run();

    if (!insertResult.success) {
      return new Response(
        JSON.stringify({ error: 'Failed to create phone call record' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const phoneCallId = insertResult.meta.last_row_id;

    // Trigger the phone call workflow
    const workflowInstance = await PHONE_CALL_WORKFLOW.create({
      params: {
        phoneCallId: phoneCallId,
        toNumber: to_number,
        fromNumber: from_number,
        agentId: agent_id,
        agentTemplateId: agent_template_id,
        initializationValues: initialization_values,
      },
    });

    return new Response(
      JSON.stringify({
        phone_call_id: phoneCallId,
        workflow_instance_id: workflowInstance.id,
        status: 'pending'
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating phone call:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
