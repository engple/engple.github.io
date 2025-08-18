"""Backup functionality for safe file processing."""

import zipfile
from datetime import datetime
from pathlib import Path
from loguru import logger


class BackupManager:
    """Manages backup creation for safe file processing."""

    def create_backup(self, target_dir: Path, backup_dir: Path = None) -> bool:
        """Create a timestamped backup of markdown files."""
        # TODO: Implement backup creation

        if not target_dir.exists():
            logger.warning(
                f"Target directory {target_dir} not found. No backup created."
            )
            return True

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"backup_{timestamp}.zip"

        if backup_dir:
            backup_path = backup_dir / backup_name
        else:
            backup_path = Path(backup_name)

        try:
            logger.info(f"Creating backup: {backup_path}")
            with zipfile.ZipFile(backup_path, "w", zipfile.ZIP_DEFLATED) as zipf:
                for md_file in target_dir.rglob("*.md"):
                    arcname = md_file.relative_to(target_dir)
                    zipf.write(md_file, arcname)

            logger.success(f"Backup created: {backup_path}")
            return True

        except Exception as e:
            logger.error(f"Error creating backup: {e}")
            return False
