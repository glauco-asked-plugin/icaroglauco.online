#!/usr/bin/env python3
import json
import os
import sys

from openai import OpenAI


def main() -> int:
    api_key = os.environ.get("NVIDIA_API_KEY", "").strip()
    model = os.environ.get("NVIDIA_MODEL", "openai/gpt-oss-20b").strip()

    if not api_key:
        print("NVIDIA_API_KEY is not set.", file=sys.stderr)
        return 2

    client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=api_key,
    )

    completion = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": (
                    "Return JSON only with keys title, summary, tone and sections. "
                    "The tone must be emerald."
                ),
            },
            {
                "role": "user",
                "content": (
                    "Create a compact knowledge card explaining that a wizard "
                    "transforms ambiguous requirements into software architecture."
                ),
            },
        ],
        temperature=0.25,
        top_p=0.8,
        max_tokens=700,
        stream=False,
    )

    message = completion.choices[0].message
    content = message.content or getattr(message, "reasoning_content", "") or ""

    try:
        parsed = json.loads(content)
        print(json.dumps(parsed, indent=2, ensure_ascii=False))
    except json.JSONDecodeError:
        print(content)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
