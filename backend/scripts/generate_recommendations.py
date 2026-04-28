import pandas as pd
from mlxtend.frequent_patterns import fpgrowth, association_rules
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import sys
import certifi

def main():
    print("Initiating RecSys Engine (Market Basket Analysis)...")
    
    # 1. Connect to MongoDB (certifi resolves macOS SSL cert verification issue)
    mongo_url = os.environ.get("DB_URL", "mongodb+srv://ngobaongoc053_db_user:053_db@cluster0.k4u8xjm.mongodb.net/bookstore?retryWrites=true&w=majority&appName=Cluster0")
    client = MongoClient(mongo_url, tlsCAFile=certifi.where())
    db = client.get_database("bookstore")
    
    order_items_col = db.orderitems
    
    # 2. Extract Data
    print("Extracting transaction data from order items...")
    items = list(order_items_col.find({}, {"orderId": 1, "bookId": 1, "_id": 0}))
    
    if len(items) == 0:
        print("No transactions found. Insufficient dataset to generate recommendations.")
        sys.exit(0)
        
    df = pd.DataFrame(items)
    
    # Convert ObjectIds to strings
    df['orderId'] = df['orderId'].astype(str)
    df['bookId'] = df['bookId'].astype(str)
    
    # Transform to pivot table (One-Hot Encoding)
    print("Pivoting item sets via One-Hot Extraction...")
    basket = (df.groupby(['orderId', 'bookId'])['bookId']
              .count().unstack().reset_index().fillna(0)
              .set_index('orderId'))
              
    # MLxtend expects boolean array for modern standard FPGrowth performance
    basket_sets = basket > 0
    
    print(f"Total isolated cart transactions: {len(basket_sets)}")
    
    # Run FP-growth pattern matching (much faster than Apriori for extensive datasets)
    print("Mining frequent itemsets utilizing FP-Growth Algorithm...")
    frequent_itemsets = fpgrowth(basket_sets, min_support=0.01, use_colnames=True)
    
    if frequent_itemsets.empty:
        print("Dataset support is below minimum threshold (1%). No significant patterns found.")
        sys.exit(0)
        
    # Generate Rules
    print("Generating association rules via conditional Lift analysis...")
    rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.2)
    
    if rules.empty:
        print("No rules met the lifting criteria.")
        sys.exit(0)
        
    # Sort by raw confidence metric mapping
    top_rules = rules.sort_values('confidence', ascending=False)
    
    # 3. Format and save into MongoDB lookup table
    rule_dict = {}
    
    for index, row in top_rules.iterrows():
        # Antecedents maps item A; Consequents maps highly probable item B
        antecedents = list(row['antecedents'])
        consequents = list(row['consequents'])
        
        # We handle discrete pairwise relations to serve item detail pages effectively
        for ant in antecedents:
            if ant not in rule_dict:
                rule_dict[ant] = []
            for con in consequents:
                if con not in rule_dict[ant]:
                    rule_dict[ant].append(con)
                    
    print(f"Generated comprehensive relational recommendations for {len(rule_dict)} baseline items.")
    
    insert_payload = []
    for base_book_id, recs in rule_dict.items():
        # Store exclusively the top 5 highest confidence targets mapped per item
        insert_payload.append({
            "base_book_id": ObjectId(base_book_id),
            "recommendations": [ObjectId(r) for r in recs[:5]]
        })
        
    rec_col = db.recommendationrules
    if insert_payload:
        print("Staging batch replacement of historic association rules...")
        rec_col.delete_many({}) # Clear historical stale rules
        rec_col.insert_many(insert_payload)
        print("Successfully deployed ML pipeline recommendations to DB!")
    else:
        print("Empty payload generated. No changes committed.")

if __name__ == "__main__":
    main()
