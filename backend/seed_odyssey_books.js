require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./src/books/book.model');

const DB_URL = process.env.DB_URL;

const odysseyBooks = [
  // Nihilism
  {
    isbn: "ODY-NIH-001",
    title: "Kẻ lạ mặt (Albert Camus)",
    author: "Albert Camus",
    category: "Kinh điển",
    thumbnail: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/The_Stranger_%28Camus_novel%29.jpg/220px-The_Stranger_%28Camus_novel%29.jpg",
    description: "Một kiệt tác về sự phi lý của tồn tại, nơi Meursault đối diện với thế giới bằng một sự dửng dưng tột độ.",
    summary: "Để làm quen với sự dửng dưng",
    published_year: 1942,
    num_pages: 120,
    price: 85000,
    featuredQuote: "Mẹ chết hôm nay. Hoặc có thể hôm qua, tôi không biết rõ.",
    moods: ["Trầm tư", "Hư vô"]
  },
  {
    isbn: "ODY-NIH-002",
    title: "Vụ án (Franz Kafka)",
    author: "Franz Kafka",
    category: "Tiểu thuyết",
    thumbnail: "https://upload.wikimedia.org/wikipedia/en/7/7c/The_Trial_%28Kafka_novel%29.jpg",
    description: "Câu chuyện về Josef K. bị bắt và xét xử vì một tội danh mà anh không hề biết, phản ánh sự phi lý và mắc kẹt của con người trong các hệ thống quyền lực.",
    summary: "Để lạc lối trong sự phi lý của hệ thống",
    published_year: 1925,
    num_pages: 180,
    price: 95000,
    featuredQuote: "Có người chắc đã vu khống Josef K...",
    moods: ["Bí ẩn", "Hư vô"]
  },
  {
    isbn: "ODY-NIH-003",
    title: "Phía dưới dòng sông",
    author: "Nguyễn Huy Thiệp",
    category: "Văn học Việt Nam",
    thumbnail: "https://salt.tikicdn.com/cache/750x750/ts/product/00/c7/44/14f52e5d16a5e4277b0c3fce4206d4e5.jpg",
    description: "Những truyện ngắn đầy ám ảnh về thân phận con người và sự nghiệt ngã của đời sống hiện thực.",
    summary: "Một điểm chạm văn học nội địa về sự chân thực nghiệt ngã.",
    published_year: 1990,
    num_pages: 250,
    price: 110000,
    featuredQuote: "Bản chất con người là một dòng sông trôi dưới lớp vỏ bọc bình yên.",
    moods: ["Trầm tư"]
  },

  // British Breeze
  {
    isbn: "ODY-BRI-001",
    title: "Trainspotting (Irvine Welsh)",
    author: "Irvine Welsh",
    category: "Tiểu thuyết",
    thumbnail: "https://upload.wikimedia.org/wikipedia/en/4/47/Trainspotting_cover.jpg",
    description: "Một góc nhìn chân thực, trần trụi và đầy nổi loạn về giới trẻ ở ngoại ô Edinburgh.",
    summary: "Trải nghiệm nhịp điệu dồn dập, nổi loạn.",
    published_year: 1993,
    num_pages: 140,
    price: 125000,
    featuredQuote: "Choose life. Choose a job. Choose a career.",
    moods: ["Nổi loạn"]
  },
  {
    isbn: "ODY-BRI-002",
    title: "The Gap Into Madness",
    author: "Stephen R. Donaldson",
    category: "Khoa học viễn tưởng",
    thumbnail: "https://m.media-amazon.com/images/I/81xU2yvF1wL._AC_UF1000,1000_QL80_.jpg",
    description: "Một hành trình tăm tối vào tâm lý tội phạm và giới hạn của đạo đức con người ngoài không gian.",
    summary: "Sự chính xác về cấu trúc và kỹ thuật kể chuyện.",
    published_year: 1994,
    num_pages: 300,
    price: 155000,
    featuredQuote: "Không gian không làm ta phát điên, chính sự cô độc mới là thủ phạm.",
    moods: ["Căng thẳng"]
  },
  {
    isbn: "ODY-BRI-003",
    title: "Great Expectations",
    author: "Charles Dickens",
    category: "Kinh điển",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Great_Expectations_title_page.jpg",
    description: "Hành trình trưởng thành của Pip, từ một cậu bé mồ côi trở thành một quý tộc với những mộng tưởng vụn vỡ.",
    summary: "Quay về với cái nôi của tầng lớp xã hội Anh.",
    published_year: 1861,
    num_pages: 400,
    price: 145000,
    featuredQuote: "Tôi chưa bao giờ thấy một thế giới nào hoàn hảo hơn thế giới trong trí tưởng tượng của mình.",
    moods: ["Lãng mạn"]
  },

  // Cave Architect
  {
    isbn: "ODY-CAV-001",
    title: "System Design Interview",
    author: "Alex Xu",
    category: "Công nghệ thông tin",
    thumbnail: "https://m.media-amazon.com/images/I/61mIq2iJUXL._AC_UF1000,1000_QL80_.jpg",
    description: "Cẩm nang toàn diện về kiến trúc hệ thống phần mềm, từ phân tán đến lưu trữ dữ liệu quy mô lớn.",
    summary: "Khám phá bản vẽ kiến trúc của các hệ thống phức tạp.",
    published_year: 2020,
    num_pages: 180,
    price: 280000,
    featuredQuote: "Thiết kế hệ thống không phải là chọn cái tốt nhất, mà là đưa ra sự đánh đổi phù hợp nhất.",
    moods: ["Logic"]
  },
  {
    isbn: "ODY-CAV-002",
    title: "Clean Architecture",
    author: "Robert C. Martin",
    category: "Công nghệ thông tin",
    thumbnail: "https://m.media-amazon.com/images/I/61r5T6rCdbL._AC_UF1000,1000_QL80_.jpg",
    description: "Nguyên tắc thiết kế phần mềm sạch, tách rời sự phụ thuộc và giúp ứng dụng sống thọ hơn.",
    summary: "Hiểu sâu về cấu trúc dữ liệu và thuật toán.",
    published_year: 2017,
    num_pages: 350,
    price: 320000,
    featuredQuote: "Kiến trúc tốt cho phép hệ thống trì hoãn các quyết định liên quan đến công cụ.",
    moods: ["Logic"]
  },
  {
    isbn: "ODY-CAV-003",
    title: "The Martian",
    author: "Andy Weir",
    category: "Khoa học viễn tưởng",
    thumbnail: "https://upload.wikimedia.org/wikipedia/en/c/c3/The_Martian_2014.jpg",
    description: "Câu chuyện sinh tồn phi thường của một nhà thực vật học bị bỏ lại trên Sao Hỏa.",
    summary: "Tiểu thuyết về một nhà khoa học cô độc.",
    published_year: 2011,
    num_pages: 300,
    price: 165000,
    featuredQuote: "Tôi sẽ phải tính toán một cách khoa học để thoát khỏi chuyện này.",
    moods: ["Logic"]
  },

  // Tropical Resilience
  {
    isbn: "ODY-TRO-001",
    title: "Tuổi 20 yêu dấu",
    author: "Nguyễn Huy Thiệp",
    category: "Văn học Việt Nam",
    thumbnail: "https://salt.tikicdn.com/cache/750x750/ts/product/78/3f/82/35c421712a2dfc83b8a1c93a02bbab38.png",
    description: "Hành trình hoang mang và kiếm tìm ý nghĩa cuộc sống của thanh niên Việt Nam hiện đại.",
    summary: "Sự kết nối giữa con người và thiên nhiên khắc nghiệt.",
    published_year: 2003,
    num_pages: 120,
    price: 75000,
    featuredQuote: "Tuổi hai mươi là tuổi của những ảo tưởng và sự vỡ mộng.",
    moods: ["Trầm tư"]
  },
  {
    isbn: "ODY-TRO-002",
    title: "Cánh đồng bất tận",
    author: "Nguyễn Ngọc Tư",
    category: "Văn học Việt Nam",
    thumbnail: "https://salt.tikicdn.com/cache/750x750/ts/product/0b/df/1f/a1e05a8d9a244b2075fb12b5ccddb8e5.jpg",
    description: "Bức tranh buồn về những phận người trôi nổi trên vùng sông nước miền Tây Nam Bộ.",
    summary: "Ký sự lịch sử về một vùng đất kiên cường.",
    published_year: 2005,
    num_pages: 160,
    price: 85000,
    featuredQuote: "Những con vịt chết để lại cánh đồng một khoảng trống vô hình.",
    moods: ["Buồn"]
  },
  {
    isbn: "ODY-TRO-003",
    title: "Nỗi buồn chiến tranh",
    author: "Bảo Ninh",
    category: "Văn học Việt Nam",
    thumbnail: "https://salt.tikicdn.com/cache/750x750/ts/product/df/e0/9a/c0e25b3bb33dd8ba1340b8ee712c589b.png",
    description: "Một góc nhìn khác về chiến tranh Việt Nam, qua ký ức đầy đau thương và mất mát của người lính.",
    summary: "Hồi ký về những năm tháng chiến tranh và hòa bình.",
    published_year: 1987,
    num_pages: 350,
    price: 135000,
    featuredQuote: "Những người chết không già đi, chỉ có người sống là chịu đựng sự tàn phá của thời gian.",
    moods: ["Trầm tư"]
  }
];

mongoose.connect(DB_URL)
  .then(async () => {
    console.log("Connected to MongoDB");
    for (const book of odysseyBooks) {
      try {
        const exists = await Book.findOne({ isbn: book.isbn });
        if (!exists) {
          const newBook = new Book(book);
          await newBook.save();
          console.log(`Added: ${book.title}`);
        } else {
          // Update the book to make sure thumbnail is perfect
          await Book.updateOne({ isbn: book.isbn }, { $set: book });
          console.log(`Updated: ${book.title}`);
        }
      } catch (err) {
        console.error(`Error with ${book.title}:`, err.message);
      }
    }
    console.log("Seed completed!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
