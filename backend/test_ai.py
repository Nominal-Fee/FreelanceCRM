import ai_service
import sys

print("Testing summarize_client...")
try:
    res1 = ai_service.summarize_client({"name": "Test"}, [{"title": "X"}], [{"total": 100}])
    print("Summarize result:", repr(res1))
except Exception as e:
    print("Summarize Error:", type(e), e)

print("\nTesting parse_mission...")
try:
    res2 = ai_service.parse_natural_language_mission("Test mission")
    print("Parse result:", repr(res2))
except Exception as e:
    print("Parse Error:", type(e), e)
