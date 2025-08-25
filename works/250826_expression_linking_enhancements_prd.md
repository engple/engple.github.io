# Expression Linking System Enhancements

## Product Requirements Document (PRD)

### 📅 **Document Information**

- **Created**: 2025년 8월 26일
- **Version**: 1.0
- **Status**: Draft

---

## 🎯 **Executive Summary**

This PRD outlines enhancements to the existing Expression Linking System to add link limit controls and batch processing capabilities. The enhancements focus on preventing over-linking while enabling efficient bulk processing of all blog posts.

### **Current State**

- Single expression linking via CLI command
- Manual expression specification required
- No link quantity controls
- Limited to one-at-a-time processing

### **Target State**

- Configurable link limits per post
- Batch processing of all expressions found in blog posts
- Automated expression discovery and cross-linking
- Enhanced CLI with new commands and options

---

## 🚀 **Feature Requirements**

### **Feature 1: Maximum Link Limit (max-link option)**

#### **User Story**

> As a content manager, I want to limit the number of links added to any single post so that my content doesn't become cluttered with excessive linking.

#### **Functional Requirements**

**FR-1.1: CLI Option Implementation**

- Add `--max-links` option to existing `link_expression` command
- Default value: 7
- Accept integer values (1, 2, 3, etc.)
- Validate input (must be positive integer)
- None is acceptable, and it means infinite.

**FR-1.2: Link Counting Logic**

- Count existing links in target post before adding new ones
- Support both markdown `[text](url)` and HTML `<a href="">text</a>` format counting
- Skip linking if adding would exceed the limit

**FR-1.3: Link Detection Patterns**

- Detect existing markdown links: `[text](url)`
- Detect existing HTML links: `<a href="url">text</a>`
- Exclude links in code blocks and comments
- Handle nested and malformed links gracefully

**FR-1.4: Behavior Specification**

- When limit reached: skip the file and log warning
- Count only expression links (not external links like references)
- Option to count all links vs. only expression links

#### **CLI Usage Examples**

```bash
# Limit to maximum 5 links per post
python main.py link_expression "get rid of" --max-links 5

# Unlimited linking (current behavior)
python main.py link_expression "get rid of"

# Dry run with link limits
python main.py link_expression "choice" --max-links 3 --dry-run
```

#### **Acceptance Criteria**

- ✅ CLI accepts `--max-links` parameter
- ✅ System counts existing links accurately
- ✅ Skips files that would exceed limit
- ✅ Logs appropriate warnings when skipping
- ✅ Maintains backward compatibility (unlimited by default)

---

### **Feature 2: Batch Expression Linking Command**

#### **User Story**

> As a content manager, I want to automatically discover all expressions in my blog posts and link each expression to its dedicated post throughout my content library without manual intervention.

#### **Functional Requirements**

**FR-2.1: Expression Discovery**

- Scan all blog post files in target directory
- Extract expressions using existing pattern: `## 🌟 영어 표현 - {expression}`
- Build list of all unique expressions with their file paths and url paths
- Handle variations and duplicates

**FR-2.2: Batch Processing Logic**

- For each discovered expression, link all occurrences in other posts to its dedicated post
- Apply max-links constraint (if specified) per target file
- Skip self-referencing (don't link expression to its own post)
- Process in deterministic order (alphabetical by expression)
- Each expression links to exactly one target (its own dedicated post)

**FR-2.3: Progress Reporting**

- Show progress bar or counter during processing
- Report statistics for each expression processed
- Aggregate final statistics
- Handle and report errors gracefully

**FR-2.4: CLI Command Design**

```bash
python main.py link_all_expressions [OPTIONS]
```

#### **CLI Usage Examples**

```bash
# Discover all expressions and link each to its dedicated post
python main.py link_all_expressions

# Process with link limits per target file
python main.py link_all_expressions --max-links 5

# Dry run to preview changes
python main.py link_all_expressions --dry-run --verbose

# Process specific target directory
python main.py link_all_expressions --target-dir ./test/posts
```

#### **Acceptance Criteria**

- ✅ Discovers all expressions from blog posts automatically
- ✅ Links each expression to its own dedicated post (not cross-linking)
- ✅ Respects max-links constraints per target file
- ✅ Shows clear progress indication
- ✅ Provides comprehensive final report
- ✅ Handles errors without stopping entire process

---

## 🏗️ **Implementation Plan**

### **Phase 1: Max-Links Feature (Week 1)**

1. Enhance `ExpressionLinker` class

   - Add `max_links` parameter to constructor
   - Implement `_count_existing_links()` method
   - Implement `_should_skip_file()` method

2. Update CLI interface

   - Add `--max-links` option to `link_expression` command
   - Update help documentation
   - Add input validation

3. Testing and refinement
   - Unit tests for link counting
   - Integration tests with various file types
   - Edge case handling

### **Phase 2: Batch Processing Feature (Week 2)**

> **Note**: This feature discovers all expressions and links each expression to its own dedicated post only (not cross-linking between expressions).

1. Expression Discovery Module

   - Create `ExpressionDiscovery` class
   - Implement file scanning and expression extraction
   - Handle edge cases and error conditions

2. Batch Linking Module

   - Create `BatchLinker` class
   - Implement progress reporting
   - Integrate with existing linking system (one expression → one target post)

3. CLI Integration
   - Add `link_all_expressions` command
   - Implement options and help documentation
   - Final testing and documentation

## 📈 **Success Metrics**

### **Functional Metrics**

- ✅ 100% accurate link counting
- ✅ Zero false positives in expression discovery
- ✅ Successful processing of existing blog library (1000+ posts)
- ✅ Processing time under 2 minutes for full blog library

### **User Experience Metrics**

- ✅ Clear progress indication during batch processing
- ✅ Informative error messages and warnings
- ✅ Intuitive CLI interface requiring minimal learning

---

## 🔒 **Risk Assessment**

### **Technical Risks**

**High Priority**

- **Risk**: Over-linking making content unreadable
- **Mitigation**: Conservative default max-links, extensive testing

- **Risk**: Performance issues with large content sets
- **Mitigation**: Incremental processing, progress indication, memory optimization

**Medium Priority**

- **Risk**: Expression extraction accuracy
- **Mitigation**: Robust regex patterns, manual validation of results

- **Risk**: File corruption during batch processing
- **Mitigation**: Backup creation, dry-run mode, atomic file operations

### **User Experience Risks**

**Medium Priority**

- **Risk**: Complex CLI interface
- **Mitigation**: Clear documentation, intuitive defaults, help text

- **Risk**: Long processing times
- **Mitigation**: Progress indication, background processing option

---

## 📝 **Appendix**

### **A. CLI Reference**

#### **Enhanced link_expression Command**

```bash
python main.py link_expression [EXPRESSION] [OPTIONS]

Arguments:
  EXPRESSION    The expression to link [required]

Options:
  --target-dir TEXT     Target directory containing markdown files
                        [default: ../src/posts/blog]
  --dry-run             Preview changes without applying them
  --verbose, -v         Enable verbose logging
  --max-links INTEGER   Maximum links per post [default: 7]
  --help               Show this message and exit
```

#### **New link_all_expressions Command**

```bash
python main.py link_all_expressions [EXPRESSION] [OPTIONS]

Arguments:
  EXPRESSION    The target expression to link other expressions to [required]

Options:
  --target-dir TEXT     Target directory containing markdown files
                        [default: ../src/posts/blog]
  --dry-run             Preview changes without applying them
  --verbose, -v         Enable verbose logging
  --max-links INTEGER   Maximum links per post [default: 7]
  --help               Show this message and exit
```

### **B. Expression Pattern Examples**

**Valid Expression Headers**

```markdown
## 🌟 영어 표현 - get rid of

## 🌟 영어 표현 - half as ... as / twice as ... as

## 🌟 영어 표현 - honestly
```

**File Structure Example**

```
src/posts/blog/
├── season-1/
│   ├── get-rid-of-영어표현.md      # Contains: "영어 표현 - get rid of"
│   ├── honestly-영어표현.md         # Contains: "영어 표현 - honestly"
│   └── choice-영어표현.md           # Contains: "영어 표현 - choice"
└── season-2/
    └── ...
```
