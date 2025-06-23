import json
from pathlib import Path
from typing import Dict, Optional

class PhotoProcessor:
    def __init__(self, registry, local_model: str = "yolov8n.pt"):
        self.registry = registry
        self.local_model = local_model
        self.online_available = False

    def _process_local(self, image_path: Path) -> Optional[str]:
        """Run local YOLOv8 model (simplified)."""
        from ultralytics import YOLO
        try:
            model = YOLO(self.local_model)
            results = model.predict(image_path, conf=0.7)
            return results[0].names[results[0].probs.top1]
        except Exception as e:
            logging.error(f"Local model failed on {image_path}: {e}")
            return None

    def process_dataset(self, dataset_id: str) -> Dict[str, Dict]:
        """Process all pending photos in a dataset."""
        results = {}
        pending_photos = self.registry.get_pending_photos(dataset_id)
        
        for photo_id in pending_photos:
            photo_path = Path(f"datasets/{dataset_id}/{photo_id}.jpg")
            if not photo_path.exists():
                logging.warning(f"Photo {photo_id} not found in {dataset_id}")
                continue

            dominant_obj = self._process_local(photo_path)
            unique_key = f"{dataset_id}_{photo_id}"
            results[unique_key] = {
                "dataset_id": dataset_id,
                "photo_id": photo_id,
                "dominant_object": dominant_obj,
                "timestamp": photo_path.stat().st_mtime
            }
            self.registry.update_progress(dataset_id, photo_id)
            logging.info(f"Processed {unique_key} -> {dominant_obj}")

        return results

    def save_results(self, results: Dict, output_file: str) -> None:
        """Save results to a JSON file."""
        with open(output_file, "w") as f:
            json.dump(results, f, indent=2)
        logging.info(f"Saved results to {output_file}")

# Example usage
if __name__ == "__main__":
    from registry import DatasetRegistry
    registry = DatasetRegistry()
    processor = PhotoProcessor(registry)
    processor.process_dataset("dataset_001")