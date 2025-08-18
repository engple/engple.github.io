# English Expression Linking Automation Project

## Product Requirements Document (PRD) Summary

### 🎯 **Project Vision**

Automate the process of linking English expressions within markdown and HTML blog posts to eliminate manual linking effort and improve content consistency.

### 📋 **Core Requirements**

#### 1. **Linking Formats**

- **Markdown**: Use `[text](url)` format
- **HTML**: Use `<a href="url">text</a>` format
- **Context-Aware**: Automatically detect whether to use markdown or HTML format based on surrounding context

#### 2. **Expression Variations**

- **Grammatical Forms**: Handle tense and grammatical transformations (e.g., "get rid of" → "gets rid of", "getting rid of", "got rid of")
- **Conservative Approach**: Avoid aggressive linking (e.g., "choose" should NOT link to "choice")

#### 3. **Data Structure**

```python
{
    "expression": str,      # Base form (e.g., "get rid of")
    "file_path": str       # Target URL (e.g., "/blog/vocab-1/031.hold-on-to/")
}
```

#### 4. **Duplicate Prevention**

- Link only the **first occurrence** of each expression per file
- Avoid creating nested or duplicate links within the same section

#### 5. **Context Awareness**

- **Skip linking in**:
  - Code blocks (` ``` ` and `` ` ``)
  - Headers (`# ## ###`)
  - Existing links (`[text](url)` and `<a href="">`)
  - HTML tags and attributes
- **Respect word boundaries**: "getridof" should not match "get rid of"

---

## 🏗️ **Implementation Architecture**

### **CLI Interface**

```bash
python main.py link_expression "get rid of" [OPTIONS]
```

**Options:**

- `--target-dir`: Directory containing markdown files (default: `../src/posts/blog`)
- `--dry-run`: Preview changes without applying them
- `--verbose`: Enable detailed logging

### **Modular Structure**

```
engple/
├── models/
│   └── expression.py          # Expression, LinkMatch data models
├── core/
│   ├── variation_generator.py # Generate grammatical variations
│   ├── expression_linker.py   # Main linking logic
│   └── file_processor.py      # File handling utilities
├── utils/
│   ├── context_detector.py    # HTML/Markdown context detection
│   └── backup.py              # Backup functionality
└── main.py                    # CLI entry point
```

### **Key Components**

#### 1. **VariationGenerator**

- Uses `lemminflect` library for grammatical inflections
- Includes manual variation overrides for common expressions
- Filters out nonsensical variations (e.g., "choiced", "honestlied")

#### 2. **ExpressionLinker**

- Processes markdown files in target directory
- Detects HTML vs Markdown contexts
- Prevents duplicate and nested links

#### 3. **ContextDetector**

- Identifies code blocks, headers, existing links
- Distinguishes HTML contexts (`<span>`, `<div>`) from markdown
- Handles word boundary detection

---

## 🧪 Tests

### **Test Coverage**

1. **Phrasal Verb Linking**: Complete workflow with "get rid of"
2. **HTML Context Detection**: Proper `<a href="">` vs `[text](url)` usage
3. **Edge Cases**: Existing links, code blocks, word boundaries
4. **CLI Integration**: All command options and error handling

### **Test Fixtures**

- **`comprehensive.md`**: 64 lines covering all linking scenarios
- **`html_contexts.md`**: HTML-heavy content with mixed contexts
- **`edge_cases.md`**: 80+ lines of boundary conditions and conflicts

---

## 📊 **Implementation Progress**

### ✅ **Phase 1: Discovery & Initial Prototyping** (Completed)

- **Manual Analysis**: Examined existing blog posts (`399.choice.md`, `398.get-rid-of.md`)
- **Initial Script**: Created basic `generate_variations.py` and `link_expressions.py`
- **Problem Discovery**: Found issues with weird variations and duplicate links
- **Iterative Fixes**: Added filtering, manual overrides, and improved context detection

### ✅ **Phase 2: Architecture Redesign** (Completed)

- **CLI Migration**: Moved from standalone scripts to Typer-based CLI
- **Modular Design**: Split functionality into reusable components
- **Test-First Approach**: Created comprehensive E2E tests before implementation
- **Project Structure**: Established clean, maintainable codebase

### 🔄 **Phase 3: Core Implementation** (In Progress)

- **Test Framework**: 9 E2E tests created and failing (expected in TDD)
- **Implementation Status**: All core logic needs to be implemented to make tests pass

---

## 🛠️ **Technical Implementation Details**

### **Dependencies**

```toml
[project.dependencies]
lemminflect = "^0.2.3"    # Grammatical inflection generation
loguru = "^0.7.2"         # Structured logging
typer = "^0.12.5"         # CLI framework
pytest = "^8.4.1"         # Testing framework
```

### **Key Algorithms**

#### **Variation Generation**

1. Use `lemminflect` for basic grammatical forms
2. Apply manual overrides for common expressions
3. Filter nonsensical results with heuristics
4. Store precomputed variations for efficiency

#### **Linking Strategy**

1. **Find all variations** of the target expression
2. **Sort by length** (longest first to avoid partial matches)
3. **Process each file** sequentially
4. **Link first occurrence only** per file
5. **Apply appropriate format** based on context

---

## 🧩 **Problem-Solving Journey**

### **Challenge 1: Weird Variations**

- **Problem**: `lemminflect` generated nonsensical words ("choiced", "honestlied")
- **Solution**: Added filtering heuristics and manual variation dictionary

### **Challenge 2: Duplicate Links**

- **Problem**: Created nested links like `[choices](/blog/in-english/399.[choice](/blog/in-english/399.choice/)/)`
- **Solution**: Improved existing link detection with bracket counting logic

### **Challenge 3: HTML vs Markdown Context**

- **Problem**: Used wrong link format in HTML contexts
- **Solution**: Implemented HTML tag detection to choose appropriate format

### **Challenge 4: Code Maintainability**

- **Problem**: Monolithic scripts became hard to maintain
- **Solution**: Refactored into modular, testable components with CLI interface

---

## 🚀 **Usage Examples**

### **Basic Usage**

```bash
# Link "get rid of" across all blog posts
python main.py link_expression "get rid of"

# Output:
# 🔧 Generating variations for: get rid of
# 📝 Generated 4 variations: get rid of, gets rid of, getting rid of, got rid of
# 🔍 Processing 150 markdown files...
# ✅ Linked 12 occurrences across 8 files
```

### **Advanced Options**

```bash
# Preview changes without applying
python main.py link_expression "choice" --dry-run

# Process specific directory with verbose output
python main.py link_expression "honestly" --target-dir ./custom/path --verbose
```

---

## 📈 **Project Impact**

### **Before: Manual Process**

- ⏰ Time-consuming manual linking
- 🔄 Inconsistent link formats
- ❌ Easy to miss opportunities
- 🐛 Error-prone nested links

### **After: Automated Solution**

- ⚡ One-command automation
- 🎯 Consistent formatting
- 📊 Comprehensive coverage
- 🛡️ Safe with backups and dry-run

---

## 🔮 **Future Enhancements**

### **Technical Improvements**

1. **Performance**: Parallel file processing for large content sets
2. **Accuracy**: Machine learning for better context detection
