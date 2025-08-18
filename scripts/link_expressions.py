#!/usr/bin/env python3
"""
Link Expressions Script - Part of Automated Expression Linking System

This script processes markdown files and automatically inserts links to English
expressions based on the variations defined in expressions.json.

Usage: python link_expressions.py
"""

import json
import os
import re
import sys
import zipfile
from datetime import datetime


class ExpressionLinker:
    """Links expressions in markdown files based on configuration."""

    def __init__(
        self,
        expressions_file="expressions.json",
        target_dir="posts/blog",
        log_file="linking.log",
    ):
        self.expressions_file = expressions_file
        self.target_dir = target_dir
        self.log_file = log_file
        self.expressions_data = {}
        self.stats = {
            "files_processed": 0,
            "files_modified": 0,
            "links_added": 0,
            "expressions_linked": {},
        }

        # Open log file for writing
        self.log_handle = None

    def setup_logging(self):
        """Initialize logging."""
        try:
            self.log_handle = open(self.log_file, "w", encoding="utf-8")
            self.log(
                f"=== Expression Linking Session Started: {datetime.now().isoformat()} ==="
            )
            return True
        except Exception as e:
            print(f"Error setting up logging: {e}")
            return False

    def log(self, message):
        """Write a message to both console and log file."""
        print(message)
        if self.log_handle:
            self.log_handle.write(f"{message}\n")
            self.log_handle.flush()

    def load_expressions(self):
        """Load expressions configuration from JSON file."""
        if not os.path.exists(self.expressions_file):
            self.log(f"Error: {self.expressions_file} not found.")
            self.log(
                "Please run generate_variations.py first to create the expressions file."
            )
            return False

        try:
            with open(self.expressions_file, "r", encoding="utf-8") as f:
                self.expressions_data = json.load(f)
            self.log(
                f"Loaded {len(self.expressions_data)} expressions from {self.expressions_file}"
            )
            return True
        except json.JSONDecodeError as e:
            self.log(f"Error parsing {self.expressions_file}: {e}")
            return False
        except Exception as e:
            self.log(f"Error loading {self.expressions_file}: {e}")
            return False

    def create_backup(self):
        """Create a timestamped backup of the target directory."""
        if not os.path.exists(self.target_dir):
            self.log(
                f"Warning: Target directory {self.target_dir} not found. No backup created."
            )
            return True

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"backup_{timestamp}.zip"

        try:
            self.log(f"Creating backup: {backup_name}")
            with zipfile.ZipFile(backup_name, "w", zipfile.ZIP_DEFLATED) as zipf:
                for root, _, files in os.walk(self.target_dir):
                    for file in files:
                        if file.endswith(".md"):
                            file_path = os.path.join(root, file)
                            arcname = os.path.relpath(file_path, self.target_dir)
                            zipf.write(file_path, arcname)

            self.log(f"✅ Backup created successfully: {backup_name}")
            return True
        except Exception as e:
            self.log(f"Error creating backup: {e}")
            return False

    def is_inside_existing_link(self, text, position):
        """Check if a position is inside an existing markdown or HTML link."""
        # Look backwards and forwards from position to see if we're inside a link

        # Check for markdown links [text](url)
        before_text = text[:position]
        after_text = text[position:]

        # Count unmatched opening brackets before position
        open_brackets = before_text.count("[") - before_text.count("]")
        if open_brackets > 0:
            # We might be inside a markdown link
            if (
                "](" in after_text and after_text.index("](") < after_text.find("\n", 0)
                if "\n" in after_text
                else len(after_text)
            ):
                return True

        # Check for HTML links <a href="url">text</a>
        last_open_tag = before_text.rfind("<a ")
        last_close_tag = before_text.rfind("</a>")

        if last_open_tag > last_close_tag:
            # We might be inside an HTML link
            next_close_tag = after_text.find("</a>")
            if next_close_tag != -1:
                return True

        return False

    def is_inside_html_context(self, text, match_start):
        """Check if we're inside an HTML context that requires <a href> format."""
        # Look backwards to see if we're inside HTML tags
        before_text = text[:match_start]

        # Look for unclosed HTML tags before our position
        # Common HTML contexts where we'd want <a href> format
        html_tags = ["<span", "<div", "<p", "<li", "<td", "<th"]

        for tag in html_tags:
            last_open = before_text.rfind(tag)
            if last_open != -1:
                # Find corresponding closing tag
                tag_name = tag[1:]  # Remove the '<'
                close_tag = f"</{tag_name}>"
                last_close = before_text.rfind(close_tag)

                # If we found an opening tag more recently than a closing tag,
                # we're inside HTML context
                if last_open > last_close:
                    return True

        # Also check if we're inside data-answer attribute specifically
        if "data-answer" in before_text:
            # Find the last data-answer opening
            last_data_answer = before_text.rfind("<span data-answer>")
            if last_data_answer != -1:
                # Check if there's a closing span after it
                remaining_text = text[last_data_answer:]
                if "</span>" not in remaining_text[: match_start - last_data_answer]:
                    return True

        return False

    def should_skip_context(self, text, match_start, match_end):
        """Check if we should skip linking in this context (code blocks, headers, etc.)."""
        # Get the line containing the match
        lines_before = text[:match_start].split("\n")
        current_line = lines_before[-1] + text[match_start:match_end]

        # Get more context to check for code blocks
        lines_around_start = max(0, len(lines_before) - 5)
        lines_around = "\n".join(lines_before[lines_around_start:])

        # Skip if inside code blocks (``` or ```)
        if "```" in lines_around:
            # Count triple backticks before our position
            triple_ticks_before = lines_around.count("```")
            if (
                triple_ticks_before % 2 == 1
            ):  # Odd number means we're inside a code block
                return True

        # Skip if inside inline code (`text`)
        line_before_match = lines_before[-1]
        backticks_before = line_before_match.count("`")
        if backticks_before % 2 == 1:  # Odd number means we're inside inline code
            return True

        # Skip if in headers (lines starting with #)
        if current_line.strip().startswith("#"):
            return True

        # Skip if in YAML front matter
        if match_start < 100 and "---" in text[:match_start]:
            return True

        return False

    def process_file(self, file_path):
        """Process a single markdown file."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                original_content = f.read()
        except Exception as e:
            self.log(f"Error reading {file_path}: {e}")
            return False

        content = original_content
        linked_expressions = set()  # Track base expressions already linked in this file
        file_modified = False

        # Process each expression and its variations
        for base_expression, expr_data in self.expressions_data.items():
            if base_expression in linked_expressions:
                continue  # Already linked this base expression in this file

            path = expr_data["path"]
            variations = expr_data["variations"]

            # Try to link one of the variations (prefer longer ones first)
            variations_sorted = sorted(variations, key=len, reverse=True)

            for variation in variations_sorted:
                # Create regex pattern for whole word matching
                pattern = r"\b" + re.escape(variation) + r"\b"

                # Find all matches
                matches = list(re.finditer(pattern, content, re.IGNORECASE))

                if matches:
                    # Check each match to see if it's linkable
                    for match in matches:
                        match_start = match.start()
                        match_end = match.end()
                        matched_text = match.group()

                        # Skip if inside existing link
                        if self.is_inside_existing_link(content, match_start):
                            continue

                        # Skip if in code blocks, headers, etc.
                        if self.should_skip_context(content, match_start, match_end):
                            continue

                        # This is a good match - create the link
                        # Check if we're in HTML context to decide link format
                        if self.is_inside_html_context(content, match_start):
                            link = f'<a href="{path}">{matched_text}</a>'
                        else:
                            link = f"[{matched_text}]({path})"

                        # Replace only this occurrence
                        content = content[:match_start] + link + content[match_end:]

                        # Update stats and tracking
                        linked_expressions.add(base_expression)
                        self.stats["links_added"] += 1
                        if base_expression not in self.stats["expressions_linked"]:
                            self.stats["expressions_linked"][base_expression] = 0
                        self.stats["expressions_linked"][base_expression] += 1

                        file_modified = True

                        # Log the successful linking
                        rel_path = os.path.relpath(file_path)
                        line_num = content[:match_start].count("\n") + 1
                        link_format = (
                            "HTML"
                            if self.is_inside_html_context(content, match_start)
                            else "Markdown"
                        )
                        self.log(
                            f"  Linked '{matched_text}' -> '{base_expression}' ({link_format}) in {rel_path}:{line_num}"
                        )

                        # Break out of variations loop since we've linked this expression
                        break

                    # If we linked this expression, break out of variations loop
                    if base_expression in linked_expressions:
                        break

        # Save the file if it was modified
        if file_modified:
            try:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                self.stats["files_modified"] += 1
            except Exception as e:
                self.log(f"Error writing {file_path}: {e}")
                return False

        return True

    def find_markdown_files(self):
        """Find all markdown files in the target directory."""
        markdown_files = []

        if not os.path.exists(self.target_dir):
            self.log(f"Error: Target directory {self.target_dir} not found.")
            return markdown_files

        for root, _, files in os.walk(self.target_dir):
            for file in files:
                if file.endswith(".md"):
                    markdown_files.append(os.path.join(root, file))

        return sorted(markdown_files)

    def run(self):
        """Main execution method."""
        self.log("=== Automated Expression Linking Script ===")
        self.log(f"Target directory: {self.target_dir}")
        self.log(f"Expressions file: {self.expressions_file}")
        self.log("")

        # Setup logging
        if not self.setup_logging():
            return False

        # Load expressions
        if not self.load_expressions():
            return False

        # Create backup
        if not self.create_backup():
            return False

        # Find markdown files
        markdown_files = self.find_markdown_files()
        if not markdown_files:
            self.log("No markdown files found in target directory.")
            return True

        self.log(f"Found {len(markdown_files)} markdown files to process.")
        self.log("")

        # Process each file
        for i, file_path in enumerate(markdown_files, 1):
            rel_path = os.path.relpath(file_path)
            self.log(f"[{i}/{len(markdown_files)}] Processing: {rel_path}")

            if self.process_file(file_path):
                self.stats["files_processed"] += 1
            else:
                self.log(f"  ❌ Failed to process {rel_path}")

        # Print summary
        self.log("")
        self.log("=== SUMMARY ===")
        self.log(f"Files processed: {self.stats['files_processed']}")
        self.log(f"Files modified: {self.stats['files_modified']}")
        self.log(f"Total links added: {self.stats['links_added']}")

        if self.stats["expressions_linked"]:
            self.log("")
            self.log("Links added by expression:")
            for expr, count in sorted(self.stats["expressions_linked"].items()):
                self.log(f"  '{expr}': {count} links")

        self.log("")
        self.log("✅ Expression linking completed successfully!")

        return True

    def __del__(self):
        """Cleanup: close log file handle."""
        if self.log_handle:
            self.log_handle.close()


if __name__ == "__main__":
    linker = ExpressionLinker()
    success = linker.run()
    sys.exit(0 if success else 1)
