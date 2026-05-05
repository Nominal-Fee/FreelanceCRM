import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
    default_headers={
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "FreelanceFlow CRM",
    }
)
MODEL = os.getenv("LLM_MODEL", "nvidia/nemotron-3-super-120b-a12b:free")

def _chat(system_prompt, user_prompt, parse_json=False):
    import sys
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
        )
        text = response.choices[0].message.content.strip()
        if parse_json:
            # Strip markdown code fences if present
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            return json.loads(text)
        return text
    except Exception as e:
        print(f"DeepSeek API Error: {e}", file=sys.stderr)
        raise e


def summarize_client(client_data, missions_data, invoices_data):
    system = (
        "You are a business analyst assistant. Write a concise 3-4 sentence professional brief "
        "about this freelance client. Cover: total revenue generated, number of projects, "
        "payment reliability, and any notable patterns. Be specific with numbers."
    )
    user = (
        f"Client: {json.dumps(client_data)}\n"
        f"Missions: {json.dumps(missions_data)}\n"
        f"Invoices: {json.dumps(invoices_data)}"
    )
    return _chat(system, user)


def parse_natural_language_mission(user_input):
    system = (
        "You are a data extraction assistant. Parse the user's natural language description "
        "of a freelance mission and return ONLY a JSON object with these keys:\n"
        "- client_name (string or null)\n"
        "- title (string or null)\n"
        "- description (string or null)\n"
        "- start_date (YYYY-MM-DD string or null)\n"
        "- end_date (YYYY-MM-DD string or null)\n"
        "- amount (number or null)\n"
        "- currency (string, default USD)\n\n"
        "Use null for any field you cannot determine. Return ONLY valid JSON, no extra text."
    )
    return _chat(system, user_input, parse_json=True)


def generate_invoice_message(client_name, mission_title, amount, tone="professional"):
    system = (
        "You are a professional business writer. Write a 3-5 sentence invoice cover message. "
        f"Tone: {tone}. Be concise and professional. Do not include subject lines or greetings, "
        "just the message body."
    )
    user = (
        f"Client: {client_name}\n"
        f"Project: {mission_title}\n"
        f"Amount: ${amount}"
    )
    return _chat(system, user)


def generate_followup_email(client_name, invoice_number, amount, days_overdue, tone="friendly"):
    tone_guide = {
        "friendly": "casual, warm, and understanding — assume it's an oversight",
        "firm": "direct and professional — clearly state the payment is expected promptly",
        "final": "formal with consequences — mention potential service suspension or late fees",
    }
    system = (
        f"You are a professional business writer. Write a payment reminder email body. "
        f"Tone: {tone_guide.get(tone, tone_guide['friendly'])}. "
        f"Keep it under 100 words. Do not include subject lines, just the message body."
    )
    user = (
        f"Client: {client_name}\n"
        f"Invoice: {invoice_number}\n"
        f"Amount: ${amount}\n"
        f"Days overdue: {days_overdue}"
    )
    return _chat(system, user)


def chat_with_data(user_question, business_context):
    system = (
        "You are a helpful AI business assistant for a freelancer. "
        "Answer questions about their business using ONLY the data provided below. "
        "Be specific, cite numbers, and keep answers concise.\n\n"
        f"Business Data:\n{json.dumps(business_context, indent=2)}"
    )
    return _chat(system, user_question)
