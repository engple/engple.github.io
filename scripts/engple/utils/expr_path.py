import os
import re


def get_expr_path(expr: str) -> str | None:
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
                        return f"/blog/{full_path.split(relative_path)[-1].strip(".md").lstrip("/season-1")}/"
    return None
