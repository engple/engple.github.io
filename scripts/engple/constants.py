from pathlib import Path
import tomllib

ROOT_DIR = Path(__file__).parent.parent.parent
SCRIPT_DIR = ROOT_DIR / "scripts"
ENGPLE_DIR = SCRIPT_DIR / "engple"
BLOG_DIR = ROOT_DIR / "src" / "posts" / "blog"
BLOG_IN_ENGLISH_DIR = BLOG_DIR / "in-english"
PROMPTS_PATH = ENGPLE_DIR / "prompts" / "blog.toml"
DATA_DIR = SCRIPT_DIR / "data"

EXAMPLE_SENTENCES_PATH = DATA_DIR / "example_sentences.json"
BLOG_EXAMPLE_PATH = DATA_DIR / "blog_example-delay.md"
BLOGMETA_EXAMPLE_PATH = DATA_DIR / "blogmeta_example.json"
RECOMMENDATION_EXAMPLES_PATH = DATA_DIR / "recommendation_examples.json"

BLOG_PROMPT = tomllib.loads(PROMPTS_PATH.read_text())
