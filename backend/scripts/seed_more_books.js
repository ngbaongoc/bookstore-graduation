const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Book = require('../src/books/book.model');
const Inventory = require('../src/inventory/inventory.model');

const moreBooksData = [
    {
        isbn: "9780593465271",
        title: "Tomorrow, and Tomorrow, and Tomorrow",
        author: "Gabrielle Zevin",
        category: "Literary Fiction",
        thumbnail: "https://covers.openlibrary.org/b/isbn/9780593465271-M.jpg",
        description: "Spanning thirty years, from Cambridge, Massachusetts, to Venice Beach, California, and lands in between and far beyond, Gabrielle Zevin’s Tomorrow, and Tomorrow, and Tomorrow is a dazzling and intricately imagined novel that examines the multifarious nature of identity, disability, failure, the redemptive possibilities in play, and above all, our need to connect: to be loved and to love.",
        published_year: 2022,
        num_pages: 416,
        price: 280000
    },
    {
        isbn: "9780385547345",
        title: "Lessons in Chemistry",
        author: "Bonnie Garmus",
        category: "Contemporary Fiction",
        thumbnail: "https://covers.openlibrary.org/b/isbn/9780385547345-M.jpg",
        description: "Chemist Elizabeth Zott is not your average woman. In fact, Elizabeth Zott would be the first to point out that there is no such thing as an average woman. But it’s the early 1960s and her all-male team at Hastings Research Institute takes a very unscientific view of equality. Except for one: Calvin Evans; the lonely, brilliant, Nobel–prize nominated grudge-holder who falls in love with—of all things—her mind. True chemistry results.",
        published_year: 2022,
        num_pages: 400,
        price: 265000
    },
    {
        isbn: "9780063250833",
        title: "Yellowface",
        author: "R.F. Kuang",
        category: "Contemporary Fiction",
        thumbnail: "https://covers.openlibrary.org/b/isbn/9780063250833-M.jpg",
        description: "Authors June Hayward and Athena Liu were supposed to be twin rising stars: same year at Yale, same debut year in publishing. But Athena’s a cross-genre literary darling, and June didn’t even get a paperback release. Nobody wants stories about white girls, June thinks. So when June witnesses Athena’s death in a freak accident, she acts on impulse: she steals Athena’s just-finished masterpiece, an experimental novel about the unsung contributions of Chinese laborers during World War I.",
        published_year: 2023,
        num_pages: 336,
        price: 275000
    },
    {
        isbn: "9781649374042",
        title: "Fourth Wing",
        author: "Rebecca Yarros",
        category: "Fantasy",
        thumbnail: "https://covers.openlibrary.org/b/isbn/9781649374042-M.jpg",
        description: "Twenty-year-old Violet Sorrengail was supposed to enter the Scribe Quadrant, living a quiet life among books and history. Now, the commanding general—also known as her tough-as-talons mother—has ordered Violet to join the hundreds of candidates striving to become the elite of Navarre: dragon riders.",
        published_year: 2023,
        num_pages: 528,
        price: 350000
    },
    {
        isbn: "9781649374172",
        title: "Iron Flame",
        author: "Rebecca Yarros",
        category: "Fantasy",
        thumbnail: "https://covers.openlibrary.org/b/isbn/9781649374172-M.jpg",
        description: "“The first year is when some of us lose our lives. The second year is when the rest of us lose our humanity.” —Xaden Riorson. Everyone expected Violet Sorrengail to die during her first year at Basgiath War College—Violet included. But Threshing was only the first impossible test meant to weed out the weak-willed, the unworthy, and the unlucky.",
        published_year: 2023,
        num_pages: 624,
        price: 360000
    },
    {
        isbn: "9780593441275",
        title: "Happy Place",
        author: "Emily Henry",
        category: "Contemporary Fiction",
        thumbnail: "https://covers.openlibrary.org/b/isbn/9780593441275-M.jpg",
        description: "Harriet and Wyn have been the perfect couple since they met in college—they go together like salt and pepper, honey and tea, lobster and rolls. Except, now—for reasons they’re still not discussing—they don’t. They broke up five months ago. And still haven’t told their best friends.",
        published_year: 2023,
        num_pages: 400,
        price: 245000
    },
    {
        isbn: "9781982185770",
        title: "None of This is True",
        author: "Lisa Jewell",
        category: "Mystery, Thriller & Suspense",
        thumbnail: "https://covers.openlibrary.org/b/isbn/9781982185770-M.jpg",
        description: "Celebrating her forty-fifth birthday at her local pub, popular podcaster Alix Summer crosses paths with an unassuming woman called Josie Fair. Josie, it turns out, is also celebrating her forty-fifth birthday. They are, in fact, birthday twins. A few days later, Alix and Josie bump into each other again, this time outside Alix’s children’s school.",
        published_year: 2023,
        num_pages: 384,
        price: 255000
    },
    {
        isbn: "9780593448786",
        title: "The Heaven & Earth Grocery Store",
        author: "James McBride",
        category: "Literary Fiction",
        thumbnail: "https://covers.openlibrary.org/b/isbn/9780593448786-M.jpg",
        description: "In 1972, when workers in Pottstown, Pennsylvania, were digging the foundations for a new development, the last thing they expected to find was a skeleton at the bottom of a well. Who the skeleton was and how it got there were two of the long-held secrets kept by the residents of Chicken Hill, the dilapidated neighborhood where immigrant Jews and African Americans lived side by side and shared ambitions and sorrows.",
        published_year: 2023,
        num_pages: 400,
        price: 290000
    },
    {
        isbn: "9780063251922",
        title: "Demon Copperhead",
        author: "Barbara Kingsolver",
        category: "Literary Fiction",
        thumbnail: "https://covers.openlibrary.org/b/isbn/9780063251922-M.jpg",
        description: "Set in the mountains of southern Appalachia, Demon Copperhead is the story of a boy born to a teenaged single mother in a single-wide trailer, with no assets beyond his dead father’s good looks and copper-colored hair, a caustic wit, and a fierce talent for survival. Relayed in his own unsparing voice, Demon braves the modern perils of foster care, child labor, derelict schools, athletic success, addiction, disastrous loves, and crushing losses.",
        published_year: 2022,
        num_pages: 560,
        price: 310000
    },
    {
        isbn: "9781035013654",
        title: "The Covenant of Water",
        author: "Abraham Verghese",
        category: "Literary Fiction",
        thumbnail: "https://covers.openlibrary.org/b/isbn/9781035013654-M.jpg",
        description: "Spanning the years 1900 to 1977, The Covenant of Water is set in Kerala, on South India’s Malabar Coast, and follows three generations of a family that suffers a peculiar affliction: in every generation, at least one person dies by drowning—and in Kerala, water is everywhere. At the turn of the century, a twelve-year-old girl from Kerala's long-existing Christian community, grieving the death of her father, is sent by boat to her wedding, where she will meet her forty-year-old husband for the first time.",
        published_year: 2023,
        num_pages: 736,
        price: 340000
    }
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.DB_URL);
        
        for (const bookInfo of moreBooksData) {
            const existing = await Book.findOne({ isbn: bookInfo.isbn });
            if (existing) {
                console.log(`Book with ISBN ${bookInfo.isbn} already exists. Skipping.`);
                continue;
            }

            const newBook = new Book(bookInfo);
            const savedBook = await newBook.save();
            console.log(`Saved book: ${savedBook.title}`);

            const inventory = new Inventory({
                bookId: savedBook._id,
                inHouseQuantity: Math.floor(Math.random() * 40) + 15,
                reservedQuantity: 0,
                binLocation: `Shelf-${String.fromCharCode(71 + Math.floor(Math.random() * 4))}${Math.floor(Math.random() * 10) + 1}`
            });
            await inventory.save();
            console.log(`Created inventory for: ${savedBook.title}`);
        }

        console.log('Seeding 10 more books completed successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.connection.close();
    }
}

seed();
