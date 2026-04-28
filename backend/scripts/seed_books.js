const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Book = require('../src/books/book.model');
const Inventory = require('../src/inventory/inventory.model');

const booksData = [
    {
        isbn: "9781250301697",
        title: "The Silent Patient",
        author: "Alex Michaelides",
        category: "Mystery, Thriller & Suspense",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1668784661i/40024139.jpg",
        description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows overlooking a park in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.",
        published_year: 2019,
        num_pages: 336,
        price: 250000
    },
    {
        isbn: "9780593135204",
        title: "Project Hail Mary",
        author: "Andy Weir",
        category: "Science Fiction",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg",
        description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish. Except that right now, he doesn't know that. He can't even remember his own name, let alone the nature of his assignment or how to complete it.",
        published_year: 2021,
        num_pages: 476,
        price: 320000
    },
    {
        isbn: "9781501161933",
        title: "The Seven Husbands of Evelyn Hugo",
        author: "Taylor Jenkins Reid",
        category: "Contemporary Fiction",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1664458703i/32620332.jpg",
        description: "Aging and reclusive Hollywood movie icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life. But when she chooses unknown magazine reporter Monique Grant for the job, no one is more astounded than Monique herself. Why her? Why now?",
        published_year: 2017,
        num_pages: 389,
        price: 280000
    },
    {
        isbn: "9780316556347",
        title: "Circe",
        author: "Madeline Miller",
        category: "Fantasy",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1508879575i/35959740.jpg",
        description: "In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe is a strange child—not powerful, like her father, nor viciously alluring like her mother. Turning to the world of mortals for companionship, she discovers that she does possess power—the power of witchcraft, which can transform rivals into monsters and menace the gods themselves.",
        published_year: 2018,
        num_pages: 393,
        price: 275000
    },
    {
        isbn: "9781501160837",
        title: "Anxious People",
        author: "Fredrik Backman",
        category: "Contemporary Fiction",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1596436034i/53799686.jpg",
        description: "Looking at real estate isn't usually a life-or-death situation, but an apartment open house becomes just that when a failed bank robber bursts in and takes a group of strangers hostage. The captives include a recently retired couple who relentlessly hunt down fixer-uppers to avoid the painful truth that they can't fix their own marriage.",
        published_year: 2020,
        num_pages: 336,
        price: 245000
    },
    {
        isbn: "9780525559474",
        title: "The Midnight Library",
        author: "Matt Haig",
        category: "Fantasy",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602190253i/52578297.jpg",
        description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices . . . Would you have done anything different, if you had the chance to undo your regrets?",
        published_year: 2020,
        num_pages: 304,
        price: 260000
    },
    {
        isbn: "9780765387561",
        title: "The Invisible Life of Addie LaRue",
        author: "V.E. Schwab",
        category: "Fantasy",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1584633432i/50623864.jpg",
        description: "France, 1714: in a moment of desperation, a young woman makes a Faustian bargain to live forever—and is cursed to be forgotten by everyone she meets. Thus begins the extraordinary life of Addie LaRue, and a dazzling adventure that will play out across centuries and continents, across history and art, as a young woman learns how far she will go to leave her mark on the world.",
        published_year: 2020,
        num_pages: 444,
        price: 295000
    },
    {
        isbn: "9781524798659",
        title: "Malibu Rising",
        author: "Taylor Jenkins Reid",
        category: "Contemporary Fiction",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1612358840i/55404546.jpg",
        description: "Malibu: August 1983. It’s the day of Nina Riva’s annual end-of-summer party, and anticipation is at a fever pitch. Everyone wants to be around the famous Rivas: Nina, the talented surfer and supermodel; Jay, the championship surfer; Hud, the renowned photographer; and their adored baby sister, Kit.",
        published_year: 2021,
        num_pages: 369,
        price: 270000
    },
    {
        isbn: "9780525559412",
        title: "The Guest List",
        author: "Lucy Foley",
        category: "Mystery, Thriller & Suspense",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1574351330i/48663872.jpg",
        description: "On an island off the coast of Ireland, guests gather to celebrate two people joining their lives together as one. The groom: handsome and charming, a rising television star. The bride: smart and ambitious, a magazine publisher. It’s a wedding for a magazine, or for a celebrity: the designer dress, the remote location, the luxe party favors, the whiskey boutique.",
        published_year: 2020,
        num_pages: 330,
        price: 255000
    },
    {
        isbn: "9780735211292",
        title: "Atomic Habits",
        author: "James Clear",
        category: "Literature & Fiction",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/3735293.jpg",
        description: "No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
        published_year: 2018,
        num_pages: 306,
        price: 290000
    },
    {
        isbn: "9780735219090",
        title: "Where the Crawdads Sing",
        author: "Delia Owens",
        category: "Literary Fiction",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582135632i/36809135.jpg",
        description: "For years, rumors of the 'Marsh Girl' have haunted Barkley Cove, a quiet town on the North Carolina coast. So in late 1969, when handsome Chase Andrews is found dead, the locals immediately suspect Kya Clark, the so-called Marsh Girl. But Kya is not what they say. Sensitive and intelligent, she has survived for years alone in the marsh that she calls home, finding friends in the gulls and lessons in the sand.",
        published_year: 2018,
        num_pages: 368,
        price: 265000
    },
    {
        isbn: "9780062060624",
        title: "The Song of Achilles",
        author: "Madeline Miller",
        category: "Historical Mystery",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1331154603i/11250317.jpg",
        description: "Greece in the age of heroes. Patroclus, an awkward young prince, has been exiled to the court of King Peleus and his perfect son Achilles. Despite their differences, Achilles befriends the shamed prince, and as they grow into young men skilled in the arts of war and medicine, their bond blossoms into something deeper—despite the displeasure of Achilles's mother Thetis, a cruel sea goddess.",
        published_year: 2011,
        num_pages: 378,
        price: 270000
    },
    {
        isbn: "9781538724736",
        title: "Verity",
        author: "Colleen Hoover",
        category: "Mystery, Thriller & Suspense",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1634158237i/41957713.jpg",
        description: "Lowen Ashleigh is a struggling writer on the brink of financial ruin when she accepts the job offer of a lifetime. Jeremy Crawford, husband of bestselling author Verity Crawford, has hired Lowen to complete the remaining books in a successful series his injured wife is unable to finish.",
        published_year: 2018,
        num_pages: 336,
        price: 240000
    },
    {
        isbn: "9781101904220",
        title: "Dark Matter",
        author: "Blake Crouch",
        category: "Science Fiction",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1472119680i/27833670.jpg",
        description: "Jason Dessen is walking home through the chilly Chicago streets one night, looking forward to a quiet evening in front of the fireplace with his wife, Daniela, and their son, Charlie—when his reality shatters. 'Are you happy with your life?' Those are the last words Jason Dessen hears before the masked abductor knocks him unconscious.",
        published_year: 2016,
        num_pages: 342,
        price: 285000
    },
    {
        isbn: "9781984820921",
        title: "The Maid",
        author: "Nita Prose",
        category: "Mystery, Thriller & Suspense",
        thumbnail: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1643228100i/55196813.jpg",
        description: "Molly Gray is not like everyone else. She struggles with social skills and misinterprets the intentions of others. Her gran used to interpret the world for her, codifying it into simple rules that Molly could live by. Since Gran died a few months ago, twenty-five-year-old Molly has been navigating life's complexities all by herself.",
        published_year: 2022,
        num_pages: 304,
        price: 250000
    }
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected successfully!');

        for (const bookInfo of booksData) {
            // Check if book already exists
            const existing = await Book.findOne({ isbn: bookInfo.isbn });
            if (existing) {
                console.log(`Book with ISBN ${bookInfo.isbn} already exists. Skipping.`);
                continue;
            }

            // Create Book
            const newBook = new Book(bookInfo);
            const savedBook = await newBook.save();
            console.log(`Saved book: ${savedBook.title}`);

            // Create Inventory
            const inventory = new Inventory({
                bookId: savedBook._id,
                inHouseQuantity: Math.floor(Math.random() * 50) + 10, // 10 to 60 copies
                reservedQuantity: 0,
                binLocation: `Shelf-${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 10) + 1}`
            });
            await inventory.save();
            console.log(`Created inventory for: ${savedBook.title}`);
        }

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.connection.close();
    }
}

seed();
