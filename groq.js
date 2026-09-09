import Groq from "groq-sdk";

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Models listed in priority order — first available wins.
// Update this list if Groq deprecates a model in the future.
const MODELS = [
    "openai/gpt-oss-20b",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
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
            console.warn(`⚠️  Model "${model}" failed: ${error.message}. Trying next...`);
            continue; // Try next model in the list
        }
    }

    console.error("❌ All Groq models failed or are decommissioned.");
    return "Error with Groq API";
}

export default askGroq;
