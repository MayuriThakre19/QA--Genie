import os
from google import genai

def generate_test_cases(requirements_text: str):
    """
    Sends software requirements to Gemini and returns structured test cases.
    """
    # Hardcoded key for bulletproof hackathon execution
    api_key = "AIzaSyAOoTbVUUBojd-zCIEC9cZF1-E01x8tZXM"
    
    # Opening a fresh client inside the function prevents the server from crashing on the 2nd run
    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are an expert QA Engineering Lead. Analyze the following product requirement and generate:
    1. Unit Tests
    2. Integration Tests
    3. Crucial Edge Cases
    4. Priority Levels (High/Medium/Low)
    5. Risk Analysis
    
    Format the output cleanly with clear headings.
    
    Product Requirement:
    {requirements_text}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text
    except Exception as e:
        return f"Error talking to AI: {str(e)}"