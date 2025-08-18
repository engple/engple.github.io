"""Generate grammatical variations for English expressions."""

from typing import List
from ..models import Expression


class VariationGenerator:
    """Generates grammatical variations for English expressions."""

    def __init__(self):
        # Manual curated variations for known expressions
        self.manual_variations = {
            "get rid of": ["get rid of", "gets rid of", "getting rid of", "got rid of"],
            "hold on to": ["hold on to", "holds on to", "holding on to", "held on to"],
            "choice": ["choice", "choices"],
            "turn into": ["turn into", "turns into", "turning into", "turned into"],
            "attractive": ["attractive"],
            "honestly": ["honestly"],
            "try to": ["try to", "tries to", "trying to", "tried to"],
            "decide to": ["decide to", "decides to", "deciding to", "decided to"],
            "accidentally": ["accidentally"],
            "used to": ["used to"],
            "sometimes": ["sometimes"],
            "go with": ["go with", "goes with", "going with", "went with", "gone with"],
            "available": ["available"],
            "collect": ["collect", "collects", "collecting", "collected"],
            "overnight": ["overnight"],
        }

        # Manual path mappings
        self.manual_paths = {
            "get rid of": "/blog/in-english/398.get-rid-of/",
            "hold on to": "/blog/vocab-1/031.hold-on-to/",
            "choice": "/blog/in-english/399.choice/",
            "turn into": "/blog/in-english/400.turn-into/",
            "attractive": "/blog/in-english/401.attractive/",
            "honestly": "/blog/in-english/336.honestly/",
            "try to": "/blog/in-english/117.try-to/",
            "decide to": "/blog/in-english/062.decide-to/",
            "accidentally": "/blog/in-english/314.accidentally/",
            "used to": "/blog/in-english/143.used-to/",
            "sometimes": "/blog/in-english/270.sometimes/",
            "go with": "/blog/vocab-1/021.go-with/",
            "available": "/blog/in-english/188.available/",
            "collect": "/blog/in-english/350.collect/",
            "overnight": "/blog/in-english/134.overnight/",
        }

    def generate_variations(self, expression: str) -> List[str]:
        """Generate variations for a single expression."""
        # TODO: Implement variation generation logic
        # For now, return manual variations or basic fallback
        if expression in self.manual_variations:
            return self.manual_variations[expression]

        # Fallback for unknown expressions
        return [expression]

    def infer_path(self, expression: str) -> str:
        """Infer the blog path for an expression."""
        # TODO: Implement path inference logic
        if expression in self.manual_paths:
            return self.manual_paths[expression]

        # Fallback path generation
        url_friendly = expression.replace(" ", "-").replace("'", "")
        return f"/blog/in-english/{url_friendly}/"

    def create_expression(self, base_form: str) -> Expression:
        """Create an Expression object with variations and path."""
        variations = self.generate_variations(base_form)
        path = self.infer_path(base_form)

        return Expression(base_form=base_form, path=path, variations=variations)
