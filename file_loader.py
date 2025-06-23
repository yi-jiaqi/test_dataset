import logging
from pathlib import Path
from typing import Dict, List

class FileLoader:
    def __init__(self, datasets_dir: str = "datasets"):
        self.datasets_dir = Path(datasets_dir)
        self._setup_logging()

    def _setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s [%(levelname)s] %(message)s",
            handlers=[
                logging.FileHandler("logs/processing.log"),
                logging.StreamHandler()
            ]
        )

    def discover_datasets(self) -> Dict[str, List[str]]:
        """Find all datasets and their photo IDs."""
        datasets = {}
        for dataset_dir in self.datasets_dir.glob("*"):
            if dataset_dir.is_dir():
                dataset_id = dataset_dir.name
                photo_ids = [
                    f.stem for f in dataset_dir.glob("*.*") 
                    if f.suffix.lower() in (".jpg", ".png", ".jpeg")
                    and f.stem.isdigit()  # Ensure 3-digit ID
                ]
                if photo_ids:
                    datasets[dataset_id] = sorted(photo_ids)
                    logging.info(f"Discovered dataset: {dataset_id} ({len(photo_ids)} photos)")
        return datasets

    def get_photo_path(self, dataset_id: str, photo_id: str) -> Path:
        """Get full path to a photo."""
        return self.datasets_dir / dataset_id / f"{photo_id}.jpg"  # Adjust extension if needed

# Example usage
if __name__ == "__main__":
    loader = FileLoader()
    datasets = loader.discover_datasets()  # Logs to file + console
    print(datasets)  # Output: {"dataset_001": ["001", "002"], ...}