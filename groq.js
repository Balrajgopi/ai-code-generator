import Groq from "groq-sdk";

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Models listed in priority order — first available wins.
// Update this list if Groq deprecates a model in the future.
const MODELS = [
    "llama-3.1-8b-instant",      // Fast, lightweight — primary choice
    "llama-3.3-70b-versatile",   // More capable fallback
    "mixtral-8x7b-32768",        // Last resort fallback
];

async function askGroq(prompt) {
    for (const model of MODELS) {
        try {
            console.log(`🤖 Trying Groq model: ${model}`);

            const response = await client.chat.completions.create({
                model,
                messages: [
                    {
                        role: "system",
                        content: "You are a professional full-stack developer. Write clean, working code only.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.7,
            });

            return response.choices[0].message.content;

        } catch (error) {
            const isDeprecated =
                error.message?.includes("decommissioned") ||
                error.message?.includes("deprecated") ||
                error.message?.includes("not supported");

            if (isDeprecated) {
                console.warn(`⚠️  Model "${model}" is no longer available. Trying next...`);
                continue; // Try the next model in the list
            }

            // Unexpected error — stop and report immediately
            console.error("❌ Groq Error:", error.message);
            return "Error with Groq API";
        }
    }

    console.error("❌ All Groq models failed or are decommissioned.");
    return "Error with Groq API";
}

export default askGroq;
