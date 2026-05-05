const mongoose = require('mongoose');
const Book = require('../src/books/book.model');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const updateAestheticData = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to DB...");

        // 1. Update a classic book (Vietnamese Intellectual theme)
        await Book.findOneAndUpdate(
            { title: { $regex: /Lão Hạc|Chí Phèo|Sống Mòn/i } },
            {
                moodPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DWZqdYm90Ao3z", // Classical music
                cinemaLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Example trailer
                cinemaComparison: "Phiên bản điện ảnh đã lột tả xuất sắc nỗi đau của Lão Hạc, nhưng cái 'đói' trong văn Nam Cao vẫn mang một sức nặng ám ảnh hơn trên từng con chữ.",
                featuredQuote: "Làm người thế này thì khổ quá. Một người như thế ấy không bao giờ có thể sung sướng được."
            }
        );

        // 2. Update a Mystery book
        await Book.findOneAndUpdate(
            { category: { $regex: /Mystery|Detective/i } },
            {
                moodPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DX6fO6yM66OIn", // Dark Academia
                cinemaLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                cinemaComparison: "Sự kịch tính trên màn ảnh rất lôi cuốn, nhưng những suy luận nội tâm tinh vi của thám tử chỉ có thể cảm nhận trọn vẹn qua trang sách.",
                featuredQuote: "Khi bạn đã loại bỏ những điều không thể, bất cứ điều gì còn lại, dù khó tin đến đâu, phải là sự thật."
            }
        );

        // 3. Update a Fiction/Literature book
        await Book.findOneAndUpdate(
            { category: { $regex: /Fiction|Literature/i }, featuredQuote: "" },
            {
                moodPlaylistUrl: "https://open.spotify.com/playlist/37i9dQZF1DX8Ueb990u307", // Jazz for reading
                featuredQuote: "Chúng ta là những gì chúng ta chọn để trở thành."
            }
        );

        console.log("✅ Aesthetic metadata updated for sample books!");
        mongoose.disconnect();
    } catch (error) {
        console.error("Error updating aesthetic data:", error);
        process.exit(1);
    }
};

updateAestheticData();
