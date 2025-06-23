import json
import os
from pathlib import Path
from typing import Dict, List, Optional

class DatasetRegistry:
    def __init__(self, registry_file: str = "registry.json"):
        self.registry_file = Path(registry_file)
        self.registry = self._load_or_init_registry()

    def _load_or_init_registry(self) -> Dict:
        """Load registry or initialize with empty structure."""
        if self.registry_file.exists():
            with open(self.registry_file, "r") as f:
                return json.load(f)
        return {
            "minor_datasets": {},
            "progress": {}  # Format: {"dataset_id": {"processed": ["001", "002"], "pending": ["003"]}}
        }

    def register_dataset(self, dataset_id: str, photo_ids: List[str]) -> None:
        """Add a new dataset with its photo IDs."""
        if dataset_id not in self.registry["minor_datasets"]:
            self.registry["minor_datasets"][dataset_id] = photo_ids
            self.registry["progress"][dataset_id] = {
                "processed": [],
                "pending": photo_ids.copy()
            }
            self._save_registry()

    def update_progress(self, dataset_id: str, photo_id: str) -> None:
        """Mark a photo as processed."""
        if photo_id in self.registry["progress"][dataset_id]["pending"]:
            self.registry["progress"][dataset_id]["pending"].remove(photo_id)
            self.registry["progress"][dataset_id]["processed"].append(photo_id)
            self._save_registry()

    def get_pending_photos(self, dataset_id: str) -> List[str]:
        """Return pending photo IDs for a dataset."""
        return self.registry["progress"][dataset_id]["pending"]

    def _save_registry(self) -> None:
        """Save registry to JSON."""
        with open(self.registry_file, "w") as f:
            json.dump(self.registry, f, indent=2)

# Example usage
if __name__ == "__main__":
    registry = DatasetRegistry()
    registry.register_dataset("dataset_001", ["001", "002"])
    print(registry.get_pending_photos("dataset_001"))  # Output: ["001", "002"]