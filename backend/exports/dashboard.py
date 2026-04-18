import streamlit as st
import pandas as pd
from pathlib import Path

# Configure the Streamlit page
st.set_page_config(page_title="Bookstore Analytics", page_icon="📚", layout="wide")

export_dir = Path(__file__).parent

@st.cache_data
def load_data():
    # Load the flat CSV exports we generated
    orders = pd.read_csv(export_dir / "orders.csv")
    order_items = pd.read_csv(export_dir / "order_items.csv")
    books = pd.read_csv(export_dir / "books.csv")
    
    # Filter out cancelled orders seamlessly
    orders['cancelOrder'] = orders['cancelOrder'].astype(str).str.lower()
    completed = orders[orders['cancelOrder'] != 'true']
    
    return orders, completed, order_items, books

st.title("📚 Bookstore Sales & Analytics")
st.markdown("A real-time snapshot of the database exports leveraging Pandas and Streamlit.")

try:
    orders, completed, order_items, books = load_data()

    # Calculate core KPIs
    total_revenue = completed['totalPrice'].sum()
    total_orders = len(completed)
    avg_order = total_revenue / total_orders if total_orders > 0 else 0

    # Render top-level metrics
    col1, col2, col3 = st.columns(3)
    col1.metric("Total Revenue", f"{total_revenue:,.0f} ₫")
    col2.metric("Completed Orders", f"{total_orders}")
    col3.metric("Average Order Value", f"{avg_order:,.0f} ₫")

    st.markdown("---")

    # Render visual chart of top selling books
    col_chart, col_data = st.columns([2, 1])
    
    with col_chart:
        st.subheader("📈 Top 10 Best Selling Books")
        # Join the order items with the books directory
        merged = pd.merge(order_items, books, left_on="bookId", right_on="_id", how="left")
        
        # Aggregate by title
        top_books = merged.groupby("title")["quantity"].sum().sort_values(ascending=False).head(10)
        
        # Streamlit out-of-the-box bar chart
        st.bar_chart(top_books)
        
    with col_data:
        st.subheader("📦 Order Status Distribution")
        status_dist = completed['status'].value_counts()
        st.dataframe(status_dist, use_container_width=True)

    st.markdown("---")

    # Raw Data Table
    st.subheader("Recent Completed Orders")
    
    # Format and order data table
    recent = completed[['_id', 'totalPrice', 'createdAt', 'status']].copy()
    recent['totalPrice'] = recent['totalPrice'].apply(lambda x: f"{x:,.0f} ₫")
    recent = recent.sort_values('createdAt', ascending=False).head(25)
    recent.rename(columns={'_id': 'Order UUID', 'totalPrice': 'Price', 'createdAt': 'Date', 'status': 'Shipping Status'}, inplace=True)
    
    st.dataframe(recent, use_container_width=True)

except Exception as e:
    st.error(f"Failed to load the dataset. Ensure your CSV files are in the same folder. Error: {e}")
