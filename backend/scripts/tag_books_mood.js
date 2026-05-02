const mongoose = require('mongoose');
const Book = require('../src/books/book.model');
require('dotenv').config();

const clusterMappings = {
    // 1. Trầm tư trước thời đại
    'Chí Phèo': ['bitter_reality', 'existential_crisis'],
    'Số Đỏ': ['bitter_reality', 'existential_crisis'],
    'Tướng Về Hưu': ['bitter_reality', 'existential_crisis'],
    '1984': ['bitter_reality', 'existential_crisis'],
    'The Road': ['bitter_reality', 'existential_crisis'],
    'To Kill a Mockingbird': ['bitter_reality', 'existential_crisis'],

    // 2. Lịch thiệp kiểu Hà Nội xưa / Buồn lơ lửng
    'Vang Bóng Một Thời': ['hanoi_polite', 'french_sadness'],
    'Gió Đầu Mùa': ['hanoi_polite', 'french_sadness'],
    'Thơ Thơ': ['hanoi_polite', 'french_sadness'],
    'The Great Gatsby': ['hanoi_polite', 'french_sadness'],
    'Pride and Prejudice': ['hanoi_polite', 'french_sadness'],
    'Tàn Ngày Để Lại': ['hanoi_polite', 'french_sadness'],

    // 3. Người cô đơn trong thành thị / Thế giới đi ngủ và bạn ngồi bên cửa sổ
    'The Catcher in the Rye': ['urban_loneliness', 'window_staring'],
    'The Invisible Life of Addie LaRue': ['urban_loneliness', 'window_staring'],
    'The Midnight Library': ['urban_loneliness', 'window_staring'],
    'Yellowface': ['urban_loneliness', 'window_staring'],
    'Tomorrow, and Tomorrow, and Tomorrow': ['urban_loneliness', 'window_staring'],
    'Anxious People': ['urban_loneliness', 'window_staring'],

    // 4. Khô lạnh như người Đức / Trầm tư kiểu Camus
    'Austerlitz': ['german_cold', 'camus_contemplation'],
    'Cái Trống Thiếc': ['german_cold', 'camus_contemplation'],
    'Người Đọc': ['german_cold', 'camus_contemplation'],
    'Demon Copperhead': ['german_cold', 'camus_contemplation'],

    // 5. Trinh thám kiểu phim noir
    'The Silent Patient': ['noir_detective'],
    'Verity': ['noir_detective'],
    'The Guest List': ['noir_detective'],
    'The Maid': ['noir_detective'],
    'Miss Marple': ['noir_detective'],
    'Spider': ['noir_detective'],

    // 6. Đi tìm điều chưa có trên Trái Đất
    'Harry Potter': ['not_on_earth'],
    'The Hobbit': ['not_on_earth'],
    'Fourth Wing': ['not_on_earth'],
    'Project Hail Mary': ['not_on_earth'],
    'Happy Place': ['not_on_earth'],
    'Dark Matter': ['not_on_earth'],
};

const tagBooks = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB");

        const books = await Book.find({});
        for (const book of books) {
            let assignedMoods = [];
            
            // Exclude Lessons in Chemistry and Atomic Habits as per instruction
            if (book.title.includes('Lessons in Chemistry') || book.title.includes('Atomic Habits')) {
                book.moods = [];
                await book.save();
                console.log(`Skipped (wait for categorization): ${book.title}`);
                continue;
            }
            
            // Check manual mapping
            for (const [key, moods] of Object.entries(clusterMappings)) {
                if (book.title.includes(key)) {
                    assignedMoods = [...assignedMoods, ...moods];
                }
            }

            // Simple heuristic if not matched explicitly
            if (assignedMoods.length === 0) {
                if (book.category === 'Fantasy' || book.category === 'Science Fiction') {
                    assignedMoods.push('not_on_earth');
                } else if (book.category === 'Mystery, Thriller & Suspense' || book.category === 'Detective and mystery stories') {
                    assignedMoods.push('noir_detective');
                } else if (book.category === 'Literary Fiction') {
                    assignedMoods.push('bitter_reality');
                } else if (book.category === 'Contemporary Fiction') {
                    assignedMoods.push('urban_loneliness');
                } else if (book.category === 'Poetry' || book.category === 'Classic Literature') {
                    assignedMoods.push('french_sadness');
                }
            }

            // Deduplicate
            assignedMoods = [...new Set(assignedMoods)];

            book.moods = assignedMoods;
            await book.save();
            console.log(`Tagged: ${book.title} -> ${assignedMoods}`);
        }
        console.log("Tagging complete!");
        process.exit(0);
    } catch (err) {
        console.error("Error during tagging:", err);
        process.exit(1);
    }
};

tagBooks();
