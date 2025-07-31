// This is a wrapper file for exporting both the Astro application as well as
// the workflow classes. This is necessary because Astro does not allow
// us to manually export non-Astro stuff as part of the bundle file.
import astroEntry, { pageMap } from "./_worker.js/index.js";
import { PhoneCallWorkflow } from "../src/workflows/phone_call_workflow.js";
import { TextMessageWorkflow } from "../src/workflows/text_message_workflow.js";
export default astroEntry;
export { PhoneCallWorkflow, TextMessageWorkflow, pageMap };
