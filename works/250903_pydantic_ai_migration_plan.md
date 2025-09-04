# engple Blog Writer: Migration Plan to pydantic-ai

Date: 2025-09-03
Owner: engple
Scope: Migrate `scripts/engple/core/blog_writer.py` from LangChain/LangGraph to pydantic-ai agents.

## Goals
- Drop LangChain/LangGraph dependencies for this flow.
- Keep existing behavior, prompts, and output format identical.
- Use pydantic-ai Agents with typed outputs and simple orchestrator.
- Improve testability via FunctionModel stubs and output validators.
- Add small observability and config improvements.

## Current flow (LangChain/LangGraph)
1) generate_examples -> NumberedListOutputParser => list[str]
2) translate_examples -> NumberedListOutputParser => list[str]
3) format_examples -> pure Python HTML list builder
4) write_a_blog -> PydanticOutputParser => BlogContent
5) write_blog_meta -> PydanticOutputParser => BlogMeta (desc + FAQs)
6) recommend_expressions -> PydanticOutputParser => Recommendation.data (list[RelatedExpression])
7) assemble final markdown (frontmatter + sections)

Notable dependencies: BLOG_PROMPT (toml), llm_model_factory/LLMModel, BlogMeta (not shown), datetime, ZoneInfo, loguru.

## Target design (pydantic-ai)
- Agents
  - ExamplesAgent: output_type=list[str]. Prompt uses BLOG_PROMPT["example"].
  - TranslateAgent: output_type=list[str]. Prompt uses BLOG_PROMPT["translation"].
  - ContentAgent: output_type=BlogContent.
  - MetaAgent: output_type=BlogMeta.
  - RecommendAgent: output_type=list[RelatedExpression].
- Orchestrator: simple sequential run, passing intermediate values.
- Deterministic formatter: unchanged pure python helper.
- Config: model ids, temperature, usage limits via env or constants.

## Data models
- BlogContent(title: str, body: str)
- FAQ(question: str, answer: str)
- RelatedExpression(expression: str, explanation: str, example: str, translation: str)
- Recommendation(data: list[RelatedExpression]) – used only for backwards compat; agent returns list[RelatedExpression].
- BlogMeta(description: str, faqs: list[FAQ])

## Agent wiring with pydantic-ai
- Use `Agent(model_id, output_type=...)` and pass `system_prompt` for each step.
- For list[str] outputs, prefer `output_type=list[str]` and instruct model to return a numbered list of exactly N items.
- Alternative: NativeOutput/PromptedOutput if needed; start with basic output_type + instructions.
- Consider `UsageLimits(response_tokens_limit=...)`.

## Orchestrator contract
Input: expression: str, expression_count: int = 20
Outputs: final_markdown: str, plus structured pieces for debugging (optional)
Error modes: validation failures -> retry by model; missing prompt -> raise; mismatched lengths -> raise.

## Edge cases
- Model returns fewer/more examples than count => enforce via prompt; if mismatch, raise ModelRetry or post-validate.
- Translation list length mismatch => validate and retry.
- Blog body missing delimiter `---` => handle gracefully (already does).
- Escaping quotes in YAML frontmatter.

## Testing
- Unit tests for formatter and escape function.
- Agent tests with FunctionModel stubs (no real API calls).
- Orchestrator test with fully stubbed agents.

## Rollout
- Introduce new module `scripts/engple/core/blog_writer_pai.py` alongside existing file.
- Keep existing BlogWriter API: generate() -> str.
- Add CLI script for manual run.
- After validation, replace old implementation and remove LC/LG deps.

## Open questions / assumptions
- Model provider: OpenAI? We’ll parameterize via env var (e.g., PAI_MODEL_EXAMPLES, etc.).
- Where is BlogMeta defined? We will add it locally.
- Keep loguru; optionally add Logfire if available.

## Work items
1. Code audit & prompt availability
2. Define Pydantic models (BlogContent, FAQ, RelatedExpression, BlogMeta)
3. Load BLOG_PROMPT from toml (reuse)
4. Implement ExamplesAgent
5. Implement TranslateAgent
6. Implement ContentAgent
7. Implement MetaAgent
8. Implement RecommendAgent
9. Formatter helper (HTML list)
10. Orchestrator class `BlogWriterPAI` with generate()
11. Config module for model ids/temperature/limits
12. Logging & optional Logfire
13. Tests with FunctionModel
14. CLI entrypoint
15. Docs and migration notes

## Acceptance criteria
- `BlogWriterPAI(expression).generate()` produces valid markdown same structure as current.
- Lists lengths match; YAML escapes safe; recommendations rendered.
- Unit tests pass locally without network using FunctionModel.
