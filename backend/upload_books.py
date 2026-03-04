import csv
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB configuration
DB_URL = os.getenv("DB_URL")
DATABASE_NAME = "bookstore"  # Default database name
COLLECTION_NAME = "books"

# CSV Configuration
CSV_FILE_PATH = os.path.join("..", "frontend", "public", "books.csv")

def upload_books():
    if not DB_URL:
        print("Error: DB_URL not found in .env file.")
        return

    try:
        # Connect to MongoDB
        client = MongoClient(DB_URL)
        db = client[DATABASE_NAME]
        collection = db[COLLECTION_NAME]

        # Read CSV file
        books_to_insert = []
        with open(CSV_FILE_PATH, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            # Ingest only the first 5 rows
            for i, row in enumerate(reader):
                if i >= 5:
                    break
                
                # Transform row to match the Book schema
                book_doc = {
                    "isbn": int(row["isbn"]),
                    "title": row["title"],
                    "author": row["author"],
                    "category": row["category"],
                    "thumbnail": row["thumbnail"],
                    "description": row["description"],
                    "published_year": int(row["published_year"]),
                    "num_pages": int(row["num_pages"]),
                    "price": float(row["price"])
                }
                books_to_insert.append(book_doc)

        if books_to_insert:
            # Insert many
            result = collection.insert_many(books_to_insert)
            print(f"Successfully uploaded {len(result.inserted_ids)} books to MongoDB.")
            for drug_id in result.inserted_ids:
                print(f"Inserted ID: {drug_id}")
        else:
            print("No books found in CSV to upload.")

    except FileNotFoundError:
        print(f"Error: CSV file not found at {CSV_FILE_PATH}")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    upload_books()
