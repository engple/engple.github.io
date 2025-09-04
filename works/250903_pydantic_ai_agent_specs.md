# Pydantic-AI Agent Specs for Blog Writer

Date: 2025-09-03

This document defines each agent, input/output contracts, prompt mapping, validation, and orchestrator pseudocode.

## Shared
- BLOG_PROMPT: loaded from `./prompts/engple/blog.toml`
- Logging: `loguru`
- Optional: Logfire instrumentation
- Env-driven model IDs & settings:
  - PAI_MODEL_EXAMPLES (default: openai:gpt-4o-mini)
  - PAI_MODEL_TRANSLATION (default: openai:gpt-4o-mini)
  - PAI_MODEL_CONTENT (default: openai:gpt-4o)
  - PAI_MODEL_META (default: openai:gpt-4o-mini)
  - PAI_MODEL_RECOMMEND (default: openai:gpt-4o-mini)
  - PAI_TEMPERATURE_* (float or None)
  - PAI_RESPONSE_TOKENS_LIMIT (int, optional)

## Data Models
- BlogContent(title: str, body: str)
- FAQ(question: str, answer: str)
- RelatedExpression(expression: str, explanation: str, example: str, translation: str)
- BlogMeta(description: str, faqs: list[FAQ])

## Agent: ExamplesAgent
- Purpose: Create N usage examples for expression
- Input:
  - expression: str
  - count: int
- Prompt source: `BLOG_PROMPT["example"]["prompt"]`
- Output: list[str] (exactly `count` items)
- Validation:
  - Enforce non-empty items
  - Length == count; otherwise ModelRetry with guidance
- Model config:
  - id: PAI_MODEL_EXAMPLES
  - temperature: PAI_TEMPERATURE_EXAMPLES or 0.9
  - usage limit: optional

## Agent: TranslateAgent
- Purpose: Translate examples into Korean (or target language per prompt)
- Input: newline-joined examples
- Prompt source: `BLOG_PROMPT["translation"]["prompt"]`
- Output: list[str] (same length as examples)
- Validation:
  - Non-empty items
  - Length match with examples; else retry
- Model config: PAI_MODEL_TRANSLATION, temperature 0

## Agent: ContentAgent
- Purpose: Write blog content (title + body)
- Input: expression
- Prompt source: `BLOG_PROMPT["blog_content"]["prompt"]`
- Output: BlogContent
- Validation: Ensure both title and body are non-empty; encourage `---` section split but not required.
- Model config: PAI_MODEL_CONTENT, temperature ~0.9

## Agent: MetaAgent
- Purpose: Write description and FAQs
- Input: content (BlogContent) and expression
- Prompt source: `BLOG_PROMPT["blogmeta"]["prompt"]`
- Output: BlogMeta(description: str, faqs: list[FAQ])
- Validation: Description length 50..200 chars (soft), FAQs up to 4 items
- Model config: PAI_MODEL_META, temperature default

## Agent: RecommendAgent
- Purpose: Recommend related expressions (3 similar + 2 opposite)
- Input: expression
- Prompt source: `BLOG_PROMPT["recommendation"]["prompt"]`
- Output: list[RelatedExpression] (total 5)
- Validation: 5 items exactly; each with non-empty fields
- Model config: PAI_MODEL_RECOMMEND, temperature default

## Formatter Helper
- `format_interactive_examples(examples: list[str], translations: list[str]) -> str`
- Builds:
```
<ul data-interactive-list>
  <li data-interactive-item>
    <span data-toggler>{translation}</span>
    <span data-answer>{example}</span>
  </li>
</ul>
```
- Strict zip with equal length (validated earlier)

## Orchestrator: BlogWriterPAI
- Inputs: expression: str, expression_count: int = 20
- Steps:
  1. examples = ExamplesAgent.run_sync({expression, count})
  2. translations = TranslateAgent.run_sync(joined examples)
  3. formatted_examples = format_interactive_examples(examples, translations)
  4. content = ContentAgent.run_sync(expression)
  5. meta = MetaAgent.run_sync({input=content, expression})
  6. recs = RecommendAgent.run_sync(expression)
  7. final = assemble_markdown(expression, formatted_examples, content, meta, recs)
  8. return final

- Assembly rules:
  - Frontmatter fields mirror existing impl (category, date Asia/Seoul, thumbnail, alt, title, desc, faqs)
  - Image markdown `!['{expression}' 영어표현](./000.png)`
  - Sections: "영어 표현", "연습해보기", "함께 알아두면 좋은 표현들"
  - Recommendations rendered as:
    - ### expression
    - explanation
    - "example"
    - "translation"

## Output Validators (examples)
- ExamplesAgent
```
@agent.output_validator
async def validate(ctx, output: list[str]) -> list[str]:
    if len(output) != ctx.deps.expected_count:
        raise ModelRetry(f"Return exactly {ctx.deps.expected_count} items, one per line, numbered.")
    if any(not s.strip() for s in output):
        raise ModelRetry("All examples must be non-empty.")
    return output
```
- TranslateAgent: same length as `ctx.deps.examples`

## Config & Defaults
- Provide `scripts/engple/config/pai.py` exporting model ids and temperatures with env fallbacks.
- Provide `UsageLimits(response_tokens_limit=...)` optional.

## Testing Strategy
- Use `pydantic_ai.models.function.FunctionModel` to stub model behavior for each agent.
- Unit tests:
  - Formatter edge cases
  - Validators enforce counts and handle retries
  - Orchestrator end-to-end with stubs

## Migration Mapping
- LangGraph -> Orchestrator run order
- NumberedListOutputParser -> output_type=list[str] + validator
- PydanticOutputParser -> output_type=Pydantic models
- llm_model_factory/LLMModel -> env-configured model ids

## Risks & Mitigations
- Model deviates from expected list length -> strict validators & clear instructions
- TOML prompt drift -> add unit tests reading TOML keys
- YAML escaping issues -> reuse `_escape_text` and add tests

