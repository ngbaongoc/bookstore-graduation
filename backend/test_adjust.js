const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './.env' });

async function testAdjust() {
  try {
    const token = jwt.sign({ username: 'admin', role: 'admin' }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    
    const booksRes = await fetch('http://localhost:5000/api/books');
    const booksData = await booksRes.json();
    const bookId = booksData[0]._id;
    console.log("Testing on bookId:", bookId);

    const res = await fetch(`http://localhost:5000/api/inventory/adjust/${bookId}`, {
        method: 'PUT',
        headers: { 
            'authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantityToAdd: 5 })
    });
    
    if (!res.ok) {
        throw new Error(await res.text());
    }
    const data = await res.json();
    console.log("Success:", data);
  } catch (error) {
    console.error("Error from backend:");
    console.error(error.message);
  }
}

testAdjust();
