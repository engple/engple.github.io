# Integration Tests for apply_link Method

## Overview

This file contains **24 essential integration tests** for the `ExpressionLinker.apply_link` method, focusing on the most important functionality and edge cases.

## Test Categories

### Basic Functionality (5 tests)

- **Basic markdown linking**: Simple text → `[text](url)`
- **HTML context linking**: HTML content → `<a href="url">text</a>`
- **Case insensitive matching**: Handles different cases
- **First match only**: Only links first occurrence
- **No matches**: Returns unchanged content

### Context Detection - Skip Scenarios (7 tests)

- **Skip existing markdown links**: `[text](url)` preserved
- **Skip existing HTML links**: `<a href="">text</a>` preserved
- **Skip code blocks**: Triple backtick blocks ignored
- **Skip inline code**: Single backtick code ignored
- **Skip headers**: `#` headers ignored
- **Skip YAML frontmatter**: `---` sections ignored
- **Skip HTML comments**: `<!-- -->` ignored

### HTML Context (2 tests)

- **Nested HTML**: Complex HTML structures
- **Mixed content**: Markdown + HTML combination

### Edge Cases (8 tests)

- **Word boundaries**: Prevents partial matches
- **Punctuation handling**: Works with punctuation
- **Expression variations**: Different forms (gets, got, etc.)
- **Regex special chars**: Handles `.`, `+`, etc.
- **Empty content**: Handles empty strings
- **Multiline content**: Spans multiple lines
- **Malformed HTML**: Graceful error handling
- **Code within HTML**: Nested contexts

### Performance (2 tests)

- **Malformed HTML robustness**
- **Complex nested scenarios**

## How to Run

```bash
# Run all tests
pytest works/test_apply_link_integration.py -v

# Run with coverage
pytest works/test_apply_link_integration.py --cov=engple.core.expression_linker --cov-report=html
```

## Expected Results

- **All 24 tests should pass** if implementation is correct
- Tests verify both positive cases (linking works) and negative cases (linking skipped)
- Integration between `ExpressionLinker` and `ContextDetector` works correctly

## Key Integration Points

- **Context detection**: Uses actual `ContextDetector` methods
- **HTML context detection**: Determines correct link format
- **Skip logic**: Prevents linking in inappropriate contexts
- **Link formatting**: Generates correct markdown/HTML syntax

This streamlined test suite covers all essential functionality while being maintainable and focused on the most important scenarios.
