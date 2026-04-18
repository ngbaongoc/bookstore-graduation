import csv
import collections
from pathlib import Path

export_dir = Path("/Users/admin/Desktop/bookstore-graduation-main/backend/exports")

def load_csv(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

try:
    print("Loading CSV datasets...")
    orders = load_csv(export_dir / "orders.csv")
    order_items = load_csv(export_dir / "order_items.csv")
    books = load_csv(export_dir / "books.csv")
    
    # Map book id to title
    book_titles = { b['_id']: b['title'] for b in books }
    
    print("\n--- SAMPLE SALES ANALYSIS ---")
    
    # 1. Total Revenue
    total_revenue = 0.0
    for o in orders:
        if o.get('cancelOrder', 'false').lower() != 'true':
            try:
                total_revenue += float(o.get('totalPrice', 0))
            except ValueError:
                pass
    print(f"Total Completed Revenue: ${total_revenue:,.2f}")
    
    # 2. Total Orders
    completed_orders = sum(1 for o in orders if o.get('cancelOrder', 'false').lower() != 'true')
    print(f"Total Completed Orders: {completed_orders}")
    if completed_orders > 0:
        print(f"Average Order Value: ${total_revenue / completed_orders:,.2f}")
    
    # 3. Top 5 Best Selling Books by Quantity
    book_sales = collections.defaultdict(int)
    for row in order_items:
        book_id = row['bookId']
        try:
            qty = int(row['quantity'])
            book_sales[book_id] += qty
        except ValueError:
            pass
            
    print("\nTop 5 Most Demanded Books (All-Time):")
    top_books = sorted(book_sales.items(), key=lambda x: x[1], reverse=True)[:5]
    for i, (b_id, count) in enumerate(top_books, 1):
        title = book_titles.get(b_id, "Unknown Title")
        print(f"  {i}. {title} - {count} copies")
        
except Exception as e:
    print(f"Error during analysis: {e}")
