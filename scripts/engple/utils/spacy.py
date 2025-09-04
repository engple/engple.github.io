from loguru import logger
import subprocess
import sys
import spacy


def _install_spacy_model() -> None:
    """Install the en_core_web_sm spaCy model."""
    logger.info("Installing en_core_web_sm spaCy model...")
    try:
        subprocess.check_call(
            [sys.executable, "-m", "spacy", "download", "en_core_web_sm"]
        )
        logger.info("Successfully installed en_core_web_sm")
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install en_core_web_sm: {e}")
        raise


def load_spacy_model():
    """Load the spaCy model, installing it if necessary."""
    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        logger.warning("en_core_web_sm not found, attempting to install...")
        _install_spacy_model()
        # Try loading again after installation
        try:
            return spacy.load("en_core_web_sm")
        except OSError as e:
            logger.error(f"Failed to load en_core_web_sm even after installation: {e}")
            raise
    except Exception as e:
        logger.error(f"Unexpected error loading spaCy model: {e}")
        raise
