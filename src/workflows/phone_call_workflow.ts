import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers";
import type { WorkflowEvent } from "cloudflare:workers";

type Env = {
  PHONE_CALL_WORKFLOW: WorkflowEntrypoint<Env, PhoneCallParams>;
  DB: D1Database;
  GIGAML_API_KEY: string;
};

type PhoneCallParams = {
  phoneCallId: number;
  toNumber: string;
  fromNumber: string;
  agentId?: string;
  agentTemplateId?: string;
  initializationValues?: Record<string, any>;
};

type GigaMLCallResponse = {
  call_id: string;
};

export class PhoneCallWorkflow extends WorkflowEntrypoint<Env, PhoneCallParams> {
  async run(event: WorkflowEvent<PhoneCallParams>, step: WorkflowStep) {
    const { DB, GIGAML_API_KEY } = this.env;
    const { phoneCallId, toNumber, fromNumber, agentId, agentTemplateId, initializationValues } = event.payload;

    // Step 1: Update status to 'initiating'
    await step.do("update status to initiating", async () => {
      await DB.prepare(`
        UPDATE phone_calls 
        SET status = 'initiating', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(phoneCallId).run();
    });

    // Step 2: Make the API call to GigaML
    const callResult = await step.do("make gigaml api call", async () => {
      try {
        const payload: any = {
          to_number: toNumber,
          from_number: fromNumber,
        };

        if (agentId) {
          payload.agent_id = agentId;
        } else if (agentTemplateId) {
          payload.agent_template_id = agentTemplateId;
        } else {
          throw new Error("Either agent_id or agent_template_id must be provided");
        }

        if (initializationValues) {
          payload.initialization_values = initializationValues;
        }

        const response = await fetch("https://agents.gigaml.com/voice/make-call", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GIGAML_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`GigaML API error: ${response.status} - ${errorText}`);
        }

        const result: GigaMLCallResponse = await response.json();
        return { success: true, callId: result.call_id };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        };
      }
    });

    // Step 3: Update the database with the result
    await step.do("update call record", async () => {
      if (callResult.success) {
        await DB.prepare(`
          UPDATE phone_calls 
          SET status = 'initiated', gigaml_call_id = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).bind(callResult.callId, phoneCallId).run();
      } else {
        await DB.prepare(`
          UPDATE phone_calls 
          SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).bind(callResult.error, phoneCallId).run();
      }
    });

    // Step 4: Optional - Poll for call status updates (you might want to implement this)
    if (callResult.success) {
      await step.do("log success", async () => {
        console.log(`Phone call ${phoneCallId} initiated successfully with GigaML call ID: ${callResult.callId}`);
      });
    } else {
      await step.do("log failure", async () => {
        console.log(`Phone call ${phoneCallId} failed: ${callResult.error}`);
      });
    }
  }
}
