import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers";
import type { WorkflowEvent } from "cloudflare:workers";

type Env = {
  TEXT_MESSAGE_WORKFLOW: WorkflowEntrypoint<Env, TextMessageParams>;
  DB: D1Database;
  GIGAML_API_KEY: string;
};

type TextMessageParams = {
  textMessageId: number;
  toNumber: string;
  fromNumber: string;
  messageContent: string;
  agentId?: string;
  agentTemplateId?: string;
  initializationValues?: Record<string, any>;
};

// Note: This assumes GigaML has a text message API similar to voice calls
// You'll need to update this based on their actual SMS/text API specification
export class TextMessageWorkflow extends WorkflowEntrypoint<Env, TextMessageParams> {
  async run(event: WorkflowEvent<TextMessageParams>, step: WorkflowStep) {
    const { DB, GIGAML_API_KEY } = this.env;
    const { 
      textMessageId, 
      toNumber, 
      fromNumber, 
      messageContent, 
      agentId, 
      agentTemplateId, 
      initializationValues 
    } = event.payload;

    // Step 1: Update status to 'sending'
    await step.do("update status to sending", async () => {
      await DB.prepare(`
        UPDATE text_messages 
        SET status = 'sending', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(textMessageId).run();
    });

    // Step 2: Send the text message via GigaML API
    const messageResult = await step.do("send gigaml text message", async () => {
      try {
        // Note: Update this URL to match GigaML's actual SMS/text API endpoint
        const payload: any = {
          to_number: toNumber,
          from_number: fromNumber,
          message: messageContent,
        };

        if (agentId) {
          payload.agent_id = agentId;
        } else if (agentTemplateId) {
          payload.agent_template_id = agentTemplateId;
        }

        if (initializationValues) {
          payload.initialization_values = initializationValues;
        }

        // TODO: Update this endpoint when you have GigaML's text message API details
        const response = await fetch("https://agents.gigaml.com/sms/send-message", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GIGAML_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`GigaML SMS API error: ${response.status} - ${errorText}`);
        }

        const result: any = await response.json();
        return { 
          success: true, 
          messageId: result.message_id || result.id || "unknown" 
        };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        };
      }
    });

    // Step 3: Update the database with the result
    await step.do("update message record", async () => {
      if (messageResult.success) {
        await DB.prepare(`
          UPDATE text_messages 
          SET status = 'sent', gigaml_message_id = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).bind(messageResult.messageId, textMessageId).run();
      } else {
        await DB.prepare(`
          UPDATE text_messages 
          SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).bind(messageResult.error, textMessageId).run();
      }
    });

    // Step 4: Log the result
    await step.do("log result", async () => {
      if (messageResult.success) {
        console.log(`Text message ${textMessageId} sent successfully with GigaML message ID: ${messageResult.messageId}`);
      } else {
        console.log(`Text message ${textMessageId} failed: ${messageResult.error}`);
      }
    });
  }
}
