const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
});

const analyzeTicket = async (subject, description) => {
    const prompt = `
You are an AI customer support ticket triage assistant.

Analyze the following customer support ticket.

Subject:
${subject}

Description:
${description}

Return ONLY valid JSON.

The JSON must have exactly these fields:
{
  "category": "Billing | Technical | Account | Order | Delivery | Other",
  "priority": "Low | Medium | High",
  "summary": "Short summary of the customer's issue"
}

Rules:
- Category must be exactly one of the allowed categories.
- Priority must be exactly Low, Medium, or High.
- Summary must be short and clear.
- Do not include markdown.
- Do not include explanations outside the JSON.
`;

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    return JSON.parse(response);
};

module.exports = {
    analyzeTicket
};