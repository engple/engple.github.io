from dataclasses import dataclass
import os
import re

from pathlib import Path

@dataclass
class ExprPath:
    """Represents the file path for an expression."""
    expr: str
    url_path: str
    file_path: Path

def get_expr_path(expr: str) -> ExprPath | None:
    """Infer the file path for a given expression."""
    relative_path = "../../../src/posts/blog"
    blog_dir = os.path.join(os.path.dirname(__file__), relative_path)
    for root, _, files in os.walk(blog_dir):
        for filename in files:
            if filename.endswith(".md"): 
                full_path = os.path.join(root, filename)
                with open(full_path, "r") as f:
                    content = f.read()
                    match = re.search(r"영어 표현 - (.*)", content)
                    if not match:
                        continue
                    if expr.lower() == match.group(1).lower().strip():
                        url_path = f"/blog/{full_path.split(relative_path)[-1].strip(".md").lstrip("/season-1")}/"
                        file_path = Path(full_path)
                        return ExprPath(expr=expr, url_path=url_path, file_path=file_path)
    return None
