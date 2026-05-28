from collections.abc import Callable, Iterable
from pathlib import Path

from engple.models import Expression
from engple.utils import generate_variations
from engple.utils.expr_path import ExprPath, iter_expr_path


def build_linkable_expressions(
    *,
    excluded_exprs: Iterable[str] = (),
    excluded_paths: Iterable[Path] = (),
    excluded_path: Callable[[Path], bool] | None = None,
) -> list[Expression]:
    """Build expression link targets from published expression posts."""
    excluded_expr_set = set(excluded_exprs)
    excluded_path_set = {path.resolve() for path in excluded_paths}
    expressions: list[Expression] = []

    for expr_path in iter_expr_path():
        if expr_path.expr in excluded_expr_set:
            continue
        if expr_path.file_path.resolve() in excluded_path_set:
            continue
        if excluded_path is not None and excluded_path(expr_path.file_path):
            continue

        expressions.append(_build_expression(expr_path))

    return expressions


def _build_expression(expr_path: ExprPath) -> Expression:
    return Expression(
        base_form=expr_path.expr,
        url_path=expr_path.url_path,
        file_path=expr_path.file_path,
        variations=generate_variations(expr_path.expr),
    )


__all__ = ["build_linkable_expressions"]
