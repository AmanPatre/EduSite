import { getGeminiModel, EXPERIMENTAL_MODEL } from "./gemini";

export async function validateTopic(topic: string, context: 'LEARNING' | 'TECH_SKILL' = 'LEARNING'): Promise<{ isValid: boolean; reason: string }> {
    const model = getGeminiModel(EXPERIMENTAL_MODEL);

    let prompt = "";
    if (context === 'TECH_SKILL') {
        prompt = `Task: Determine if "${topic}" is a legitimate software development, IT, data science, or professional technical skill.
        If it is a general science topic (like photosynthesis), a food item (like dairymilk), a person, or a general hobby, mark it as INVALID.
        Return JSON: { "isValid": boolean, "reason": "reason" }`;
    } else {
        prompt = `Task: Determine if "${topic}" is an educational, academic, or professional learning topic.
        If it is entertainment, vlogs, gossip, gaming (non-dev), or general non-educational content, mark it as INVALID.
        Return JSON: { "isValid": boolean, "reason": "reason" }`;
    }

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(text);
        return { isValid: data.isValid ?? data.isEducational ?? false, reason: data.reason || "" };
    } catch (e) {
        console.error("Topic Guard Error:", e);
        return { isValid: false, reason: "Validation service unavailable, please try again." };
    }
}
