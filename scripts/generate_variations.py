#!/usr/bin/env python3
"""
Generate Variations Script - Part of Automated Expression Linking System

This script reads a list of base expressions and generates their grammatical
variations using the lemminflect library. The output is stored in expressions.json
for use by the linking script.

Usage: python generate_variations.py
"""

import json
import os
import sys

try:
    import lemminflect
except ImportError:
    print("Error: lemminflect library not found.")
    print("Please install it using: pip install lemminflect")
    sys.exit(1)


class VariationGenerator:
    """Generates grammatical variations for English expressions."""

    def __init__(
        self,
        expressions_list_file="expressions_list.txt",
        output_file="expressions.json",
    ):
        self.expressions_list_file = expressions_list_file
        self.output_file = output_file
        self.expressions_data = {}

        # Manual curated variations for common expressions
        self.manual_variations = {}

    def load_existing_data(self):
        """Load existing expressions.json if it exists."""
        if os.path.exists(self.output_file):
            try:
                with open(self.output_file, "r", encoding="utf-8") as f:
                    self.expressions_data = json.load(f)
                print(f"Loaded existing data from {self.output_file}")
            except json.JSONDecodeError:
                print(f"Warning: Could not parse {self.output_file}. Starting fresh.")
                self.expressions_data = {}
        else:
            print(f"No existing {self.output_file} found. Creating new file.")

    def generate_verb_variations(self, verb):
        """Generate variations for a single verb."""
        variations = {verb}  # Start with the base form

        # Get inflections for different verb forms, but be selective
        verb_tags = [
            "VBD",
            "VBG",
            "VBZ",
        ]  # past, present participle, 3rd person singular

        for tag in verb_tags:
            inflections = lemminflect.getInflection(verb, tag=tag)
            if inflections:
                # Only add if it looks like a real word (basic validation)
                for inflection in inflections:
                    if self._is_reasonable_word(inflection):
                        variations.add(inflection)

        return list(variations)

    def generate_phrasal_verb_variations(self, phrase):
        """Generate variations for phrasal verbs like 'get rid of'."""
        words = phrase.split()
        variations = []

        if len(words) >= 2:
            # Find the main verb (usually the first word)
            main_verb = words[0]
            rest_of_phrase = " ".join(words[1:])

            # Generate variations of the main verb
            verb_variations = self.generate_verb_variations(main_verb)

            # Combine with the rest of the phrase
            for verb_form in verb_variations:
                variations.append(f"{verb_form} {rest_of_phrase}")

        # Also add the original phrase
        variations.append(phrase)

        return list(set(variations))  # Remove duplicates

    def _is_reasonable_word(self, word):
        """Basic validation to filter out nonsensical inflections."""
        # Don't allow words that are too long or have repeated suffixes
        if len(word) > 20:
            return False

        # Don't allow obvious nonsense patterns
        nonsense_patterns = [
            "ing" + word[-3:],  # avoid double suffixes like "runninged"
            "ed" + word[-2:],  # avoid patterns like "walkeded"
        ]

        for pattern in nonsense_patterns:
            if pattern in word:
                return False

        # Don't allow adverbs to be inflected (they shouldn't change)
        if word.endswith("ly") and word != word.lower():
            return False

        return True

    def generate_single_word_variations(self, word):
        """Generate variations for single words."""
        variations = {word}

        # For adverbs ending in -ly, don't try to inflect them
        if word.endswith("ly"):
            return [word]

        # For other words, try limited inflections
        if self._looks_like_verb(word):
            # Try verb forms only
            verb_tags = ["VBD", "VBG", "VBZ"]
            for tag in verb_tags:
                inflections = lemminflect.getInflection(word, tag=tag)
                if inflections:
                    for inflection in inflections:
                        if self._is_reasonable_word(inflection):
                            variations.add(inflection)
        elif self._looks_like_noun(word):
            # Try plural form only
            inflections = lemminflect.getInflection(word, tag="NNS")
            if inflections:
                for inflection in inflections:
                    if self._is_reasonable_word(inflection):
                        variations.add(inflection)

        return list(variations)

    def _looks_like_verb(self, word):
        """Simple heuristic to check if a word might be a verb."""
        # This is a simple heuristic - could be improved
        verb_endings = ["ate", "ize", "ify", "en"]
        return any(word.endswith(ending) for ending in verb_endings) or len(word) <= 8

    def _looks_like_noun(self, word):
        """Simple heuristic to check if a word might be a noun."""
        # This is a simple heuristic
        return not word.endswith("ly") and not self._looks_like_verb(word)

    def generate_variations(self, expression):
        """Generate variations for any expression."""
        # First check if we have manual variations
        if expression in self.manual_variations:
            print(f"    Using manual variations for '{expression}'")
            return self.manual_variations[expression]

        # Otherwise try to generate automatically
        words = expression.split()

        if len(words) == 1:
            # Single word
            return self.generate_single_word_variations(expression)
        else:
            # Multi-word expression (likely phrasal verb)
            return self.generate_phrasal_verb_variations(expression)

    def infer_path(self, expression):
        """Infer the likely blog path for an expression."""
        # Manual path mappings for known expressions
        manual_paths = {}

        if expression in manual_paths:
            return manual_paths[expression]

        # Convert expression to URL-friendly format for unknown expressions
        url_friendly = expression.replace(" ", "-").replace("'", "")

        # Check if it might be in vocab-1 or in-english based on common patterns
        if len(expression.split()) > 2 or any(
            word in expression for word in ["get", "hold", "go"]
        ):
            return f"/blog/vocab-1/{url_friendly}/"
        else:
            return f"/blog/in-english/{url_friendly}/"

    def process_expressions(self):
        """Process all expressions from the input file."""
        if not os.path.exists(self.expressions_list_file):
            print(f"Error: {self.expressions_list_file} not found.")
            return False

        with open(self.expressions_list_file, "r", encoding="utf-8") as f:
            expressions = [line.strip() for line in f if line.strip()]

        print(f"Processing {len(expressions)} expressions...")

        for expression in expressions:
            if expression in self.expressions_data:
                print(f"  Skipping '{expression}' (already exists)")
                continue

            print(f"  Generating variations for '{expression}'...")
            variations = self.generate_variations(expression)

            # Clean and deduplicate variations
            variations = list(set([v.strip().lower() for v in variations if v.strip()]))
            variations.sort()

            self.expressions_data[expression] = {
                "path": self.infer_path(expression),
                "variations": variations,
            }

            print(
                f"    Generated {len(variations)} variations: {', '.join(variations[:5])}{'...' if len(variations) > 5 else ''}"
            )

        return True

    def save_data(self):
        """Save the expressions data to JSON file."""
        try:
            with open(self.output_file, "w", encoding="utf-8") as f:
                json.dump(self.expressions_data, f, indent=2, ensure_ascii=False)
            print(f"\nSaved expressions data to {self.output_file}")
            return True
        except Exception as e:
            print(f"Error saving to {self.output_file}: {e}")
            return False

    def run(self):
        """Main execution method."""
        print("=== Expression Variations Generator ===")
        print(f"Input file: {self.expressions_list_file}")
        print(f"Output file: {self.output_file}")
        print()

        # Load existing data
        self.load_existing_data()

        # Process expressions
        if not self.process_expressions():
            return False

        # Save data
        if not self.save_data():
            return False

        print(f"\n✅ Successfully processed {len(self.expressions_data)} expressions.")
        print(
            f"📝 Review and edit {self.output_file} if needed, then run link_expressions.py"
        )

        return True


if __name__ == "__main__":
    generator = VariationGenerator()
    success = generator.run()
    sys.exit(0 if success else 1)
