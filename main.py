from registry import DatasetRegistry
from file_loader import FileLoader
from processor import PhotoProcessor
import logging

def main():
    # Initialize modules
    registry = DatasetRegistry()
    loader = FileLoader()
    processor = PhotoProcessor(registry)

    # Step 1: Discover datasets and register new ones
    datasets = loader.discover_datasets()
    for dataset_id, photo_ids in datasets.items():
        if dataset_id not in registry.registry["minor_datasets"]:
            registry.register_dataset(dataset_id, photo_ids)

    # Step 2: Process each dataset
    for dataset_id in datasets.keys():
        logging.info(f"Processing dataset: {dataset_id}")
        results = processor.process_dataset(dataset_id)
        if results:
            processor.save_results(results, f"results_{dataset_id}.json")

    logging.info("Pipeline completed!")

if __name__ == "__main__":
    main()