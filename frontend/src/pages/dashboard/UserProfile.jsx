import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGetOrdersByEmailQuery } from '../../redux/features/orders/ordersApi';
import { useGetReviewsByUserEmailQuery } from '../../redux/features/reviews/reviewsApi';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

const UserProfile = () => {
    const { currentUser, userProfile, updateUserProfile, profileLoading, startOdysseyBook, completeOdysseyBook } = useAuth();
    const { t } = useTranslation();
    const { data: userOrders = [], isLoading: ordersLoading } = useGetOrdersByEmailQuery(currentUser?.email, { skip: !currentUser?.email });
    const { data: userReviews = [], isLoading: reviewsLoading } = useGetReviewsByUserEmailQuery(currentUser?.email, { skip: !currentUser?.email });

    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [newGoal, setNewGoal] = useState(10);
    const [activeTab, setActiveTab] = useState('bookshelf'); // 'bookshelf', 'diary', 'odyssey'
    const [acceptedThemes, setAcceptedThemes] = useState(() => {
        try { return JSON.parse(localStorage.getItem('odysseyAccepted') || '[]'); } catch { return []; }
    });
    const [expandedTheme, setExpandedTheme] = useState(null);
    const [localStartedThemes, setLocalStartedThemes] = useState({});

    // Sync state when userProfile loads
    React.useEffect(() => {
        if (userProfile) {
            if (userProfile.readingGoal) setNewGoal(userProfile.readingGoal);
        }
    }, [userProfile]);

    // Calculate books read this year
    const currentYear = new Date().getFullYear();
    
    const titlesReadThisYear = useMemo(() => {
        const titlesMap = new Map();
        userOrders.forEach(order => {
            if (order.status === 'Delivered') {
                const orderYear = new Date(order.createdAt).getFullYear();
                if (orderYear === currentYear) {
                    order.productIds.forEach(item => {
                        const book = item.productId;
                        if (book && typeof book === 'object') {
                            titlesMap.set(String(book._id), book);
                        }
                    });
                }
            }
        });
        return titlesMap.size;
    }, [userOrders, currentYear]);

    const purchasedBooks = useMemo(() => {
        const booksMap = new Map();
        userOrders.forEach(order => {
            if (order.status === 'Delivered') {
                order.productIds.forEach(item => {
                    const book = item.productId;
                    if (book && typeof book === 'object') {
                        booksMap.set(String(book._id), book);
                    }
                });
            }
        });
        return Array.from(booksMap.values());
    }, [userOrders]);

    const totalBooksAllTime = useMemo(() => {
        let count = 0;
        userOrders.forEach(order => {
            if (order.status === 'Delivered') {
                order.productIds.forEach(item => {
                    count += (item.quantity || 1);
                });
            }
        });
        return count;
    }, [userOrders]);

    const readerPersona = useMemo(() => {
        const counts = {};
        userOrders.forEach(order => {
            order.productIds.forEach(item => {
                const cat = item.productId?.category;
                if (cat) counts[cat] = (counts[cat] || 0) + 1;
            });
        });
        
        const topCat = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, null);
        
        const personas = {
            'Fiction': { title: 'Tâm hồn nghệ thuật', exp: 'Với bạn, mỗi trang sách là một bức tranh, mỗi câu từ là một giai điệu. Bạn không chỉ đọc, bạn đang "cảm" cái đẹp len lỏi trong từng linh hồn nhân vật.', color: 'bg-pink-100 text-pink-700' },
            'Literature': { title: 'Tâm hồn nghệ thuật', exp: 'Với bạn, mỗi trang sách là một bức tranh, mỗi câu từ là một giai điệu. Bạn không chỉ đọc, bạn đang "cảm" cái đẹp len lỏi trong từng linh hồn nhân vật.', color: 'bg-purple-100 text-purple-700' },
            'Classic Literature': { title: 'Học giả uyên thâm', exp: 'Bạn là người đi tìm những giá trị vượt thời gian. Những bộ óc vĩ đại nhất lịch sử luôn là người bạn đồng hành thân thiết trên hành trình tri thức của bạn.', color: 'bg-amber-100 text-amber-700' },
            'Self-help': { title: 'Người truyền lửa', exp: 'Bạn là phiên bản không ngừng nâng cấp. Bạn đọc để thay đổi, để hành động và để trở thành phiên bản rực rỡ nhất của chính mình mỗi ngày.', color: 'bg-blue-100 text-blue-700' },
            'Mystery, Thriller & Suspense': { title: 'Nhà thám hiểm tâm trí', exp: 'Không bí ẩn nào có thể làm khó được bạn. Bạn yêu những cú twist hack não và luôn sẵn sàng dấn thân vào những góc khuất kịch tính nhất của tâm lý.', color: 'bg-slate-700 text-white' },
            'default': { title: 'Độc giả đa năng', exp: 'Bạn là người đọc cởi mở, thích chiêm nghiệm mọi thể loại, không đóng mình trong trường phái cố định nào. Bạn đọc sách như một nhà thám hiểm.', color: 'bg-[#008080]/10 text-[#008080]' }
        };
        
        return personas[topCat] || personas['default'];
    }, [userOrders]);

    const progress = Math.min(Math.round((titlesReadThisYear / (userProfile?.readingGoal || 10)) * 100), 100);

    const milestoneTitle = useMemo(() => {
        if (progress < 20) return "Người tập sự tò mò";
        if (progress < 50) return "Kẻ lữ hành văn chương";
        if (progress < 80) return "Nhà phê bình chiều sâu";
        return "Bậc thầy tri thức";
    }, [progress]);

    const mentalTags = useMemo(() => {
        const tags = new Set();
        purchasedBooks.forEach(book => {
            if (book.category === 'Fiction') tags.add('Tưởng tượng').add('Cảm xúc');
            if (book.category === 'Classic Literature') tags.add('Học thuật').add('Vĩnh cửu');
            if (book.category === 'Self-help') tags.add('Hành động').add('Cải tiến');
            if (book.category?.includes('Mystery')) tags.add('Logic').add('Bí ẩn');
            if (book.category === 'Literature') tags.add('Nhân bản').add('Nghệ thuật');
        });
        return Array.from(tags).slice(0, 8);
    }, [purchasedBooks]);

    const analyzeSentiment = (text) => {
        const positive = ['hay', 'tốt', 'tuyệt', 'thích', 'đẹp', 'ý nghĩa', 'rất', 'good', 'great', 'love', 'awesome'];
        const negative = ['dở', 'tệ', 'chán', 'không thích', 'thất vọng', 'kém', 'bad', 'disappointed', 'boring'];
        
        const words = text.toLowerCase().split(/\s+/);
        let score = 0;
        words.forEach(w => {
            if (positive.includes(w)) score += 1;
            if (negative.includes(w)) score -= 1;
        });
        return score;
    };

    const sentimentJourney = useMemo(() => {
        return userReviews.map(r => ({
            date: new Date(r.createdAt).toLocaleDateString('vi-VN'),
            score: analyzeSentiment(r.comment)
        })).reverse();
    }, [userReviews]);

    const handleUpdateGoal = async () => {
        try {
            await updateUserProfile(currentUser.email, { 
                username: userProfile.username,
                phone: userProfile.phone,
                readingGoal: parseInt(newGoal),
                odysseyTheme: userProfile.odysseyTheme // preserve theme
            });
            Swal.fire({ title: 'Thành công!', text: 'Đã cập nhật mục tiêu đọc sách.', icon: 'success', confirmButtonColor: '#008080' });
            setIsEditingGoal(false);
        } catch (err) {
            Swal.fire({ title: 'Lỗi', text: 'Không thể cập nhật mục tiêu.', icon: 'error' });
        }
    };

    const handleThemeSelect = async (themeKey) => {
        try {
            // Add to accepted set (multi-mission)
            const updated = acceptedThemes.includes(themeKey) ? acceptedThemes : [...acceptedThemes, themeKey];
            setAcceptedThemes(updated);
            localStorage.setItem('odysseyAccepted', JSON.stringify(updated));

            // Also update the active odyssey theme for the roadmap tracker
            await updateUserProfile(currentUser.email, { 
                username: userProfile.username,
                phone: userProfile.phone,
                readingGoal: userProfile.readingGoal || 10,
                odysseyTheme: themeKey
            });
            Swal.fire({ title: 'Đã nhận nhiệm vụ! 🎯', text: `Hành trình "${odysseyThemes[themeKey].title}" đã được mở.`, icon: 'success', confirmButtonColor: '#4f46e5', timer: 2000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ title: 'Lỗi', text: 'Không thể cập nhật chủ đề Odyssey.', icon: 'error' });
        }
    };

    const handleStartReading = async (themeKey, bookIndex) => {
        try {
            await startOdysseyBook(currentUser.email, themeKey);
            // Immediately flip the button in the UI without waiting for userProfile re-fetch
            setLocalStartedThemes(prev => ({ ...prev, [themeKey]: true }));
            Swal.fire({ title: 'Thành công', text: 'Đã bắt đầu ghi nhận thời gian đọc!', icon: 'success', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire('Lỗi', err.response?.data?.message || 'Không thể bắt đầu đọc', 'error');
        }
    }

    const handleCompleteReading = async (book, bookIndex) => {
        const { value: reflection } = await Swal.fire({
            title: 'Hoàn thành chặng đường',
            text: book.question || "Hãy chia sẻ cảm nhận của bạn về cuốn sách này:",
            input: 'textarea',
            inputPlaceholder: 'Nhập cảm nhận của bạn...',
            showCancelButton: true,
            confirmButtonText: 'Gửi cảm nhận',
            cancelButtonText: 'Đóng',
            inputValidator: (value) => {
                if (!value) return 'Bạn cần chia sẻ cảm nhận để tiếp tục!';
            }
        });

        if (reflection) {
            try {
                const res = await completeOdysseyBook(currentUser.email, {
                    bookIndex, reflection, pageCount: book.pages
                });
                if (res.status === 'Pending') {
                    Swal.fire({ title: 'Velocity Warning ⏱️', text: res.warning, icon: 'warning', confirmButtonColor: '#f59e0b' });
                } else {
                    // Clear local started state so next book shows 'Bắt đầu đọc'
                    setLocalStartedThemes(prev => { const n = { ...prev }; delete n[res.user?.odysseyTheme || '']; return n; });
                    Swal.fire({ title: 'Tuyệt vời! 🎉', text: 'Bạn đã mở khóa cuốn sách tiếp theo.', icon: 'success', confirmButtonColor: '#10b981' });
                }
            } catch (err) {
                Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra', 'error');
            }
        }
    }

    // EARLY RETURN MUST BE AFTER ALL HOOKS
    if (profileLoading || ordersLoading) return <div className="p-10 text-center animate-pulse text-gray-400">Loading your profile...</div>;

    const odysseyThemes = {
        'nihilism': { 
            title: "Vũ điệu của sự Hư vô", 
            desc: "Bạn thức dậy trong một căn phòng trống. Thế giới ngoài kia vẫn vận hành, nhưng bạn bắt đầu hỏi: Để làm gì?", 
            icon: "🌑",
            books: [
                { title: "Kẻ lạ mặt (Albert Camus)", desc: "Để làm quen với sự dửng dưng", cover: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/The_Stranger_%28Camus_novel%29.jpg/220px-The_Stranger_%28Camus_novel%29.jpg", pages: 120, question: "Bạn nghĩ sao về hành động dửng dưng của Meursault trong đám tang?" },
                { title: "Vụ án (Franz Kafka)", desc: "Để lạc lối trong sự phi lý của hệ thống", cover: "https://upload.wikimedia.org/wikipedia/en/7/7c/The_Trial_%28Kafka_novel%29.jpg", pages: 180, question: "K theo đuổi một vụ án mà anh không biết tội của mình. Điều này phản ánh gì về xã hội?" },
                { title: "Phía dưới dòng sông", desc: "Một điểm chạm văn học nội địa về sự chân thực nghiệt ngã.", cover: "https://salt.tikicdn.com/cache/750x750/ts/product/00/c7/44/14f52e5d16a5e4277b0c3fce4206d4e5.jpg", pages: 250, question: "Sự nghiệt ngã của con người trong truyện ngắn này để lại ấn tượng gì trong bạn?" }
            ]
        },
        'british_breeze': { 
            title: "Tiếng vọng từ sương mù Anh quốc", 
            desc: "Vượt ra ngoài những cung điện hoàng gia, hãy lắng nghe tiếng nói từ những khu phố lao động, những con hẻm nhỏ nơi giọng Estuary và Mancunian vang vọng.", 
            icon: "🇬🇧",
            books: [
                { title: "Trainspotting (Irvine Welsh)", desc: "Trải nghiệm nhịp điệu dồn dập, nổi loạn.", cover: "https://upload.wikimedia.org/wikipedia/en/4/47/Trainspotting_cover.jpg", pages: 140, question: "Nhịp điệu dồn dập trong cách kể chuyện của Irvine Welsh mang lại cho bạn cảm giác gì?" },
                { title: "The Gap Into Madness", desc: "Sự chính xác về cấu trúc và kỹ thuật kể chuyện.", cover: "https://m.media-amazon.com/images/I/81xU2yvF1wL._AC_UF1000,1000_QL80_.jpg", pages: 300, question: "Kỹ thuật kể chuyện nào trong tác phẩm này làm bạn ấn tượng nhất?" },
                { title: "Great Expectations", desc: "Quay về với cái nôi của tầng lớp xã hội Anh.", cover: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Great_Expectations_title_page.jpg", pages: 400, question: "Sự phân hóa giai cấp được Dickens miêu tả như thế nào qua góc nhìn của Pip?" }
            ]
        },
        'cave_architect': { 
            title: "Kiến trúc sư trong Hang", 
            desc: "Xây dựng thế giới từ những con số và cấu trúc. Đây là hành trình dành cho những bậc thầy hệ thống muốn kiến tạo thực tại từ bóng tối của căn hang tập trung.", 
            icon: "🛠️",
            books: [
                { title: "Project Hail Mary (Andy Weir)", desc: "Hành trình của một nhà khoa học cô độc trong vũ trụ – khoa học và sự sống còn.", cover: "https://covers.openlibrary.org/b/isbn/9780593135204-M.jpg", pages: 476, question: "Ryland Grace phải đối mặt với sự cô đơn và cái chết như thế nào trong nhiệm vụ tuyệt mật này?" },
                { title: "Dark Matter (Blake Crouch)", desc: "Vật lý lượng tử, bản sắc và những con đường không chọn.", cover: "https://covers.openlibrary.org/b/isbn/9781101904220-M.jpg", pages: 342, question: "Nếu tồn tại vô số phiên bản của bạn trong đa vũ trụ, đâu mới là 'bạn' thật sự?" },
                { title: "The Martian (Andy Weir)", desc: "Tiểu thuyết về một nhà khoa học cô độc sinh tồn trên Sao Hỏa.", cover: "https://upload.wikimedia.org/wikipedia/en/c/c3/The_Martian_2014.jpg", pages: 369, question: "Tinh thần khoa học và kỹ thuật của Mark Watney đã giúp anh sinh tồn như thế nào?" }
            ]
        },
        'tropical_resilience': {
            title: "Nhịp thở của rừng nhiệt đới",
            desc: "Khám phá sự kiên cường và sức sống mãnh liệt của con người qua những biến động lịch sử tại Đông Nam Á.",
            icon: "🌿",
            books: [
                { title: "Tuổi 20 yêu dấu", desc: "Sự kết nối giữa con người và thiên nhiên khắc nghiệt.", cover: "https://salt.tikicdn.com/cache/750x750/ts/product/78/3f/82/35c421712a2dfc83b8a1c93a02bbab38.png", pages: 120, question: "Hình ảnh thiên nhiên khắc nghiệt trong tác phẩm tác động thế nào đến con người?" },
                { title: "Cánh đồng bất tận", desc: "Ký sự lịch sử về một vùng đất kiên cường.", cover: "https://salt.tikicdn.com/cache/750x750/ts/product/0b/df/1f/a1e05a8d9a244b2075fb12b5ccddb8e5.jpg", pages: 160, question: "Sự cô đơn và nỗi đau được tác giả miêu tả qua cảnh sắc miền Tây ra sao?" },
                { title: "Nỗi buồn chiến tranh", desc: "Hồi ký về những năm tháng chiến tranh và hòa bình.", cover: "https://salt.tikicdn.com/cache/750x750/ts/product/df/e0/9a/c0e25b3bb33dd8ba1340b8ee712c589b.png", pages: 350, question: "Tác phẩm này đã thay đổi góc nhìn của bạn về chiến tranh như thế nào?" }
            ]
        }
    };

    const currentTheme = odysseyThemes[userProfile?.odysseyTheme] || odysseyThemes['nihilism'];

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 font-sans">
            <div className="flex flex-col md:flex-row gap-8">
                
                {/* ── Sidebar: Info ── */}
                <div className="md:w-1/3">
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-center sticky top-24">
                        <div className="w-32 h-32 bg-gradient-to-br from-[#008080] to-[#005f5f] rounded-full mx-auto mb-6 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                            {userProfile?.username?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-1">{userProfile?.username}</h2>
                        <p className="text-gray-400 text-sm mb-4">{userProfile?.email}</p>
                        
                        {/* Reader Persona Badge */}
                        <div className="mb-6">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${readerPersona.color}`}>
                                ✦ {readerPersona.title} ✦
                            </span>
                        </div>

                        {/* Persona Explainer */}
                        <div className="mb-8 px-4 text-gray-500 text-[11px] leading-relaxed">
                            <p className="font-semibold text-gray-600 mb-1">Cá tính đọc sách:</p>
                            {readerPersona.exp}
                        </div>
                        
                        <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tổng lượng sách mua</span>
                                <span className="text-sm font-black text-gray-900">{totalBooksAllTime}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tổng tựa đề sách</span>
                                <span className="text-sm font-black text-gray-900">{purchasedBooks.length}</span>
                            </div>
                        </div>

                        {/* Personal Interest Tags (Mind Map) */}
                        <div className="mt-8 text-left">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Bản đồ tư duy (Tags)</p>
                            <div className="flex flex-wrap gap-2">
                                {mentalTags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-md font-medium hover:bg-[#008080]/10 hover:text-[#008080] transition-colors cursor-default">
                                        #{tag}
                                    </span>
                                ))}
                                {mentalTags.length === 0 && <p className="text-[10px] italic text-gray-400">Chưa có đủ dữ liệu để phân tích...</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="md:w-2/3 space-y-6">
                    
                    {/* Navigation Tabs */}
                    <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-2 gap-2">
                        <button 
                            onClick={() => setActiveTab('bookshelf')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'bookshelf' ? 'bg-[#008080] text-white shadow-md transform scale-[1.02]' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            📚 Giá sách ảo
                        </button>
                        <button 
                            onClick={() => setActiveTab('diary')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'diary' ? 'bg-amber-500 text-white shadow-md transform scale-[1.02]' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            ✍️ Nhật ký
                        </button>
                        <button 
                            onClick={() => setActiveTab('odyssey')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'odyssey' ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            🌌 Hành trình Odyssey
                        </button>
                    </div>

                    {/* Conditional Rendering Content */}
                    <div className="transition-all duration-500">
                        
                        {/* TAB 1: Odyssey Challenge */}
                        {activeTab === 'odyssey' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                                    <h3 className="text-2xl font-black text-indigo-900 mb-4 border-l-4 border-indigo-600 pl-4">Khám phá các gói Hành trình Odyssey 🌌</h3>
                                    
                                    {/* What is Odyssey */}
                                    <p className="text-gray-600 mb-5 leading-relaxed">
                                        <strong>Odyssey</strong> là hệ thống đọc sách có chủ đề — nơi bạn không chỉ đọc, mà còn <em>trải nghiệm một hành trình tri thức</em> được dẫn dắt có chủ ý. Mỗi gói là một "thế giới" với 3 cuốn sách được lựa chọn kỹ lưỡng, kết nối với nhau theo một cung bậc cảm xúc và tư tưởng.
                                    </p>

                                    {/* Rules */}
                                    <div className="bg-indigo-50 rounded-2xl p-5 mb-8 border border-indigo-100">
                                        <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3">⚙️ Luật chơi</p>
                                        <ol className="space-y-2.5">
                                            <li className="flex items-start gap-3 text-sm text-gray-700">
                                                <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">1</span>
                                                <span><strong>Nhận nhiệm vụ</strong> — Chọn gói hành trình phù hợp với tâm trạng và mục tiêu đọc của bạn.</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-gray-700">
                                                <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">2</span>
                                                <span><strong>Đọc sách</strong> — Bắt đầu chặng đầu tiên. Hệ thống ghi nhận thời gian bạn bắt đầu đọc.</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-gray-700">
                                                <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">3</span>
                                                <span><strong>Nêu cảm nghĩ</strong> — Sau khi đọc xong, chia sẻ cảm nhận thực sự của bạn về cuốn sách (tối thiểu 1 câu).</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-gray-700">
                                                <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">4</span>
                                                <span><strong>Mở khoá chặng tiếp theo</strong> — Hệ thống đánh giá tốc độ đọc. Nếu đọc <em>quá nhanh so với số trang</em>, bạn sẽ nhận cảnh báo. Nếu hợp lý, chặng kế tiếp sẽ được mở khoá tự động! 🔓</span>
                                            </li>
                                        </ol>
                                    </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(odysseyThemes).map(([key, theme]) => {
                                        const isActive = userProfile?.odysseyTheme === key;
                                        const isAccepted = acceptedThemes.includes(key) || isActive;
                                        const isExpanded = expandedTheme === key;
                                        return (
                                            <div key={key} className={`rounded-2xl border-2 transition-all overflow-hidden ${isActive ? 'border-indigo-500 shadow-md' : isAccepted ? 'border-indigo-200' : 'border-gray-100 hover:border-indigo-200'}`}>
                                                {/* Card Header - clickable */}
                                                <div className={`p-5 ${isExpanded ? 'bg-indigo-50' : 'bg-white'}`}>
                                                    <div
                                                        onClick={() => setExpandedTheme(isExpanded ? null : key)}
                                                        className="flex items-center gap-4 cursor-pointer"
                                                    >
                                                        <div className="text-4xl shrink-0">{theme.icon}</div>
                                                        <div className="flex-1">
                                                            <h5 className={`text-base font-bold ${isActive ? 'text-indigo-900' : 'text-gray-800'}`}>{theme.title}</h5>
                                                            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{theme.desc}</p>
                                                        </div>
                                                        <span className={`text-gray-400 text-xs shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                                                    </div>
                                                    {/* CTA Button - always visible */}
                                                    <div className="mt-3 pl-14">
                                                        {isAccepted ? (
                                                            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-100 py-1.5 px-4 rounded-full inline-flex items-center gap-1.5">
                                                                ✅ Đã nhận nhiệm vụ
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleThemeSelect(key); }}
                                                                className="text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition py-1.5 px-4 rounded-full uppercase tracking-widest shadow-sm"
                                                            >
                                                                🎯 Nhận nhiệm vụ
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Expanded Roadmap Panel */}
                                                {isExpanded && (
                                                    <div className="border-t border-gray-100 bg-gray-50/50 px-5 pb-5 pt-4">
                                                        <p className="text-xs text-gray-500 leading-relaxed mb-4 italic">{theme.desc}</p>

                                                        {theme.books && theme.books.length > 0 && (
                                                            <div className="relative">
                                                                <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-indigo-100"></div>
                                                                <h6 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Lộ trình đọc sách</h6>
                                                                <div className="space-y-3">
                                                                    {theme.books.map((b, idx) => {
                                                                        const prog = userProfile?.odysseyProgresses?.[key] || { currentBookIndex: 0, startedAt: null };
                                                                        const currentIndex = prog.currentBookIndex;
                                                                        const isRevealed = isAccepted ? idx <= currentIndex : idx === 0;
                                                                        const isCurrent = isAccepted && idx === currentIndex;
                                                                        const isCompleted = isAccepted && idx < currentIndex;
                                                                        const hasStarted = isCurrent && (localStartedThemes[key] || prog.startedAt !== null);

                                                                        return (
                                                                            <div key={idx} className="flex gap-3 items-start relative z-10 p-2 rounded-xl bg-white/70 hover:bg-white transition shadow-sm">
                                                                                <div className={`w-12 h-16 rounded-md shrink-0 overflow-hidden flex items-center justify-center text-xl font-bold shadow-sm ${isRevealed ? '' : 'bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400'}`}>
                                                                                    {isRevealed ? <img src={b.cover} alt={b.title} className="w-full h-full object-cover" /> : "?"}
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className={`font-bold text-xs ${isRevealed ? 'text-gray-900' : 'text-gray-400'}`}>{isRevealed ? b.title : '???'}</p>
                                                                                    <p className="text-[10px] text-gray-500 italic mt-0.5">{b.desc}</p>
                                                                                    {isCurrent && (
                                                                                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                                                                                            {!hasStarted ? (
                                                                                                <button onClick={(e) => { e.stopPropagation(); handleStartReading(key, idx); }} className="text-[10px] bg-indigo-600 text-white px-3 py-1 rounded-md font-bold hover:bg-indigo-700 transition shadow-sm">▶ Bắt đầu đọc</button>
                                                                                            ) : (
                                                                                                <button onClick={(e) => { e.stopPropagation(); handleCompleteReading(b, idx); }} className="text-[10px] bg-green-500 text-white px-3 py-1 rounded-md font-bold hover:bg-green-600 transition shadow-sm">✔ Hoàn thành</button>
                                                                                            )}
                                                                                            <Link to="/books" onClick={e => e.stopPropagation()} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 underline underline-offset-2">🛒 Đặt sách</Link>
                                                                                        </div>
                                                                                    )}
                                                                                    {isCompleted && (
                                                                                        <div className="mt-1 flex items-center gap-3">
                                                                                            <span className="text-[10px] text-green-600 font-bold">✔ Đã hoàn thành</span>
                                                                                            <Link to="/books" onClick={e => e.stopPropagation()} className="text-[10px] text-indigo-500 hover:text-indigo-700 font-bold">🛒 Mua bản giấy</Link>
                                                                                        </div>
                                                                                    )}
                                                                                    {!isAccepted && idx === 0 && (
                                                                                        <p className="text-[10px] text-amber-500 italic mt-1">⚠️ Nhận nhiệm vụ để bắt đầu theo dõi tiến độ</p>
                                                                                    )}
                                                                                    {isAccepted && !isCurrent && !isCompleted && isRevealed && (
                                                                                        <div className="mt-2 flex flex-col gap-1.5">
                                                                                            {idx === 0 && (
                                                                                                <>
                                                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                                                        <button
                                                                                                            onClick={async (e) => {
                                                                                                                e.stopPropagation();
                                                                                                                await handleThemeSelect(key);
                                                                                                            }}
                                                                                                            className="text-[10px] bg-indigo-500 text-white px-3 py-1 rounded-md font-bold hover:bg-indigo-700 transition shadow-sm"
                                                                                                        >🔀 Chuyển sang gói này</button>
                                                                                                        <Link to="/books" onClick={e => e.stopPropagation()} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 underline underline-offset-2">🛒 Đặt sách tại đây</Link>
                                                                                                    </div>
                                                                                                    <p className="text-[9px] text-gray-400 italic">💡 Mỗi lúc chỉ có thể theo dõi tiến độ 1 gói. Gói đã nhận vẫn được lưu lại.</p>
                                                                                                </>
                                                                                            )}
                                                                                            {idx !== 0 && (
                                                                                                <Link to="/books" onClick={e => e.stopPropagation()} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 underline underline-offset-2">🛒 Đặt sách tại đây</Link>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* CTA Button */}
                                                        <div className="mt-4">
                                                            {isAccepted ? (
                                                                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-100 py-1.5 px-4 rounded-full flex items-center gap-1.5 w-fit">
                                                                    ✅ Đã nhận nhiệm vụ
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleThemeSelect(key); }}
                                                                    className="text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition py-1.5 px-4 rounded-full uppercase tracking-widest shadow-sm"
                                                                >
                                                                    🎯 Nhận nhiệm vụ
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        )}

                        {/* TAB 2: Virtual Bookshelf & Reading Goal */}
                        {activeTab === 'bookshelf' && (
                            <div className="space-y-6">
                                {/* Reading Challenge Card */}
                                <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
                                    <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                                        <span className="text-[150px]">{currentTheme.icon}</span>
                                    </div>
                                    <div className="flex justify-end items-start mb-8 relative z-10">
                                        <div className="text-right">
                                            {!isEditingGoal ? (
                                                <button onClick={() => setIsEditingGoal(true)} className="text-[10px] font-bold text-indigo-400 hover:text-white transition-colors uppercase tracking-widest bg-white/5 hover:bg-white/10 py-2 px-3 rounded-md">Chỉnh sửa mục tiêu</button>
                                            ) : (
                                                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                                                    <input 
                                                        type="number" 
                                                        value={newGoal} 
                                                        onChange={(e) => setNewGoal(e.target.value)}
                                                        className="w-14 bg-white/10 border border-white/20 rounded-md px-2 py-1 text-sm focus:outline-none text-center"
                                                    />
                                                    <button onClick={handleUpdateGoal} className="text-[10px] font-bold text-green-400 uppercase hover:text-green-300">Lưu</button>
                                                    <button onClick={() => setIsEditingGoal(false)} className="text-[10px] font-bold text-red-400 uppercase hover:text-red-300">Hủy</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-6 relative z-10">
                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Danh hiệu hiện tại</p>
                                        <p className="text-3xl font-black">{milestoneTitle}</p>
                                    </div>

                                    <div className="flex items-end gap-2 mb-2 relative z-10">
                                        <span className="text-5xl font-black text-indigo-300">{titlesReadThisYear}</span>
                                        <span className="text-xl font-bold text-gray-500 mb-1">/ {userProfile?.readingGoal || 10} chặng</span>
                                    </div>

                                    <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-4 shadow-inner z-10">
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-400 italic relative z-10">
                                        {progress >= 100 
                                            ? "Chúc mừng! Bạn đã hoàn thành cuộc viễn chinh tri thức của năm! 🎉" 
                                            : `Bạn đã đi được ${progress}% lộ trình. Hãy kiên định với con đường đã chọn! 🧭`}
                                    </p>
                                </div>

                                {/* Bookshelf Grid */}
                                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                                    <h3 className="text-2xl font-black text-gray-900 mb-8 border-l-4 border-[#008080] pl-4">Giá sách ảo của bạn 📚</h3>
                                
                                {purchasedBooks.length === 0 ? (
                                    <div className="py-20 text-center bg-gray-50 rounded-3xl">
                                        <span className="text-5xl mb-4 block">🏜️</span>
                                        <p className="text-gray-500 font-medium">Giá sách của bạn còn trống.</p>
                                        <p className="text-xs text-gray-400 mt-1">Hãy bắt đầu hành trình đọc sách bằng cuốn sách đầu tiên!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {purchasedBooks.map((book) => (
                                            <div key={book._id} className="group relative cursor-pointer">
                                                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-md transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:rotate-1">
                                                    <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                                                        <p className="text-white text-[10px] font-bold text-center leading-snug">{book.title}</p>
                                                    </div>
                                                </div>
                                                {/* Wooden Shelf Shadow Effect */}
                                                <div className="h-2 w-[90%] mx-auto bg-gray-200 rounded-full blur-[2px] mt-2 opacity-50"></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                        {/* TAB 3: Reading Diary */}
                        {activeTab === 'diary' && (
                            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                                <div className="flex justify-between items-start mb-8 border-l-4 border-amber-500 pl-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">Nhật ký đọc sách ✍️</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ghi lại dòng chảy cảm xúc</p>
                                    </div>
                                    
                                    {sentimentJourney.length > 1 && (
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Hành trình cảm xúc (Sentiment Map)</p>
                                            <div className="flex items-end gap-1 h-12">
                                                {sentimentJourney.map((point, i) => {
                                                    const height = Math.max(10, Math.min(40, Math.abs(point.score) * 10 + 10));
                                                    return (
                                                        <div 
                                                            key={i} 
                                                            className={`w-3 rounded-full transition-all duration-500 ${point.score > 0 ? 'bg-green-400' : point.score < 0 ? 'bg-red-400' : 'bg-gray-300'}`}
                                                            style={{ height: `${height}px` }}
                                                            title={`${point.date}: ${point.score > 0 ? 'Tích cực' : point.score < 0 ? 'Tiêu cực' : 'Trung lập'}`}
                                                        ></div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {reviewsLoading ? (
                                    <div className="text-center text-gray-400 py-10 animate-pulse">Đang tải nhật ký...</div>
                                ) : userReviews.length === 0 ? (
                                    <div className="py-16 text-center bg-gray-50 rounded-3xl">
                                        <span className="text-5xl mb-4 block">📝</span>
                                        <p className="text-gray-500 font-medium">Nhật ký của bạn chưa có trang nào.</p>
                                        <p className="text-xs text-gray-400 mt-1">Hãy để lại cảm nhận sau khi đọc xong một cuốn sách nhé!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {userReviews.map((review) => (
                                            <div key={review._id} className="flex gap-6 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                                                {review.bookId?.thumbnail ? (
                                                    <img src={review.bookId.thumbnail} alt={review.bookId.title} className="w-16 h-24 object-cover rounded-lg shadow-sm shrink-0" />
                                                ) : (
                                                    <div className="w-16 h-24 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center text-gray-400 text-xs text-center p-2">No Cover</div>
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-900 mb-1">{review.bookId?.title || 'Sách đã xóa'}</h4>
                                                    <div className="flex items-center gap-1 mb-3">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className={`text-sm ${i < review.rating ? 'text-amber-400' : 'text-gray-300'}`}>★</span>
                                                        ))}
                                                        <span className="text-[10px] text-gray-400 ml-2">
                                                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 leading-relaxed italic border-l-2 border-gray-300 pl-3">"{review.comment}"</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
