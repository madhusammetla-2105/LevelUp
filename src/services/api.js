import axios from "axios";

// Using the URL from your backend setup
const WEBHOOK_URL = "https://workflow.ccbp.in/webhook/ai-coach";

export const sendMessageToAI = async (message) => {
  try {
    const response = await axios.post(WEBHOOK_URL, {
      message,
    });
    // Let's log the exact response so you can see its structure in the browser console
    console.log("Full Backend Response:", response.data);

    // We try to extract the response data dynamically based on common n8n webhook outputs
    return response.data.reply || response.data.response || response.data.output || response.data.message || response.data.text || "Message received, but no text found in response.";
  } catch (error) {
    console.error("Error communicating with AI backend:", error);
    return "Something went wrong. Make sure your n8n backend is running!";
  }
};
