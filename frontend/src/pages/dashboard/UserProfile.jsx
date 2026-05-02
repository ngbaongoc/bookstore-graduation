import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGetOrdersByEmailQuery } from '../../redux/features/orders/ordersApi';
import { useGetReviewsByUserEmailQuery } from '../../redux/features/reviews/reviewsApi';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

const UserProfile = () => {
    const { currentUser, userProfile, updateUserProfile, profileLoading } = useAuth();
    const { t } = useTranslation();
    const { data: userOrders = [], isLoading: ordersLoading } = useGetOrdersByEmailQuery(currentUser?.email, { skip: !currentUser?.email });
    const { data: userReviews = [], isLoading: reviewsLoading } = useGetReviewsByUserEmailQuery(currentUser?.email, { skip: !currentUser?.email });

    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [newGoal, setNewGoal] = useState(10);

    // Sync newGoal when userProfile loads
    React.useEffect(() => {
        if (userProfile?.readingGoal) {
            setNewGoal(userProfile.readingGoal);
        }
    }, [userProfile]);

    // Calculate books read this year
    const currentYear = new Date().getFullYear();
    // Calculate unique titles this year
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

    // Gather all unique purchased books for the bookshelf
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

    // Calculate total books across all time (sum of quantities)
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

    // Determine Reader Persona based on top category
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

    const handleUpdateGoal = async () => {
        try {
            await updateUserProfile(currentUser.email, { 
                username: userProfile.username,
                phone: userProfile.phone,
                readingGoal: parseInt(newGoal) 
            });
            Swal.fire({ title: 'Success!', text: 'Your reading goal has been updated.', icon: 'success', confirmButtonColor: '#008080' });
            setIsEditingGoal(false);
        } catch (err) {
            Swal.fire({ title: 'Error', text: 'Failed to update goal.', icon: 'error' });
        }
    };

    if (profileLoading || ordersLoading) return <div className="p-10 text-center animate-pulse text-gray-400">Loading your profile...</div>;

    const progress = Math.min(Math.round((titlesReadThisYear / (userProfile?.readingGoal || 10)) * 100), 100);

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
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="md:w-2/3 space-y-8">
                    
                    {/* Reading Challenge Card */}
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-3xl shadow-2xl p-8 text-white">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black mb-1">Chinh phục tựa đề sách {currentYear} 🏆</h3>
                                <p className="text-gray-400 text-sm">Hành trình chinh phục tri thức của bạn.</p>
                            </div>
                            <div className="text-right">
                                {!isEditingGoal ? (
                                    <button onClick={() => setIsEditingGoal(true)} className="text-[10px] font-bold text-blue-400 hover:underline uppercase tracking-widest">Thay đổi mục tiêu</button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={newGoal} 
                                            onChange={(e) => setNewGoal(e.target.value)}
                                            className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm focus:outline-none"
                                        />
                                        <button onClick={handleUpdateGoal} className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Lưu</button>
                                        <button onClick={() => setIsEditingGoal(false)} className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Hủy</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-5xl font-black text-blue-400">{titlesReadThisYear}</span>
                            <span className="text-xl font-bold text-gray-500 mb-1">/ {userProfile?.readingGoal || 10} tựa đề</span>
                        </div>

                        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-4 shadow-inner">
                            <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        
                        <p className="text-sm text-gray-400 italic">
                            {progress >= 100 
                                ? "Chúc mừng! Bạn đã hoàn thành thử thách xuất sắc! 🎉" 
                                : `Bạn đã hoàn thành ${progress}% mục tiêu. Tiếp tục cố gắng nhé! 💪`}
                        </p>
                    </div>

                    {/* Virtual Bookshelf */}
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
                                    <div key={book._id} className="group relative">
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

                    {/* Reading Diary (Reviews) */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                        <h3 className="text-2xl font-black text-gray-900 mb-8 border-l-4 border-amber-500 pl-4">Nhật ký đọc sách ✍️</h3>
                        
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
                                                    <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
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

                </div>
            </div>
        </div>
    );
};

export default UserProfile;
