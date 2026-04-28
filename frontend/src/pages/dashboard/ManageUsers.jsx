import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDeleteUserMutation, useFetchAllUsersQuery, useSendVouchersMutation } from '../../redux/features/users/usersApi';
import Swal from 'sweetalert2';

const SEGMENT_COLORS = {
    "Champions": "bg-green-100 text-green-800",
    "Loyal Customers": "bg-blue-100 text-blue-800",
    "Potential Loyalist": "bg-cyan-100 text-cyan-800",
    "New Customers": "bg-purple-100 text-purple-800",
    "Promising": "bg-indigo-100 text-indigo-800",
    "Needs Attention": "bg-yellow-100 text-yellow-800",
    "About to Sleep": "bg-orange-100 text-orange-800",
    "At Risk": "bg-red-100 text-red-800",
    "Can't Lose Them": "bg-pink-100 text-pink-800",
    "Hibernating": "bg-gray-100 text-gray-800",
    "Lost": "bg-gray-200 text-gray-500",
    "No Orders": "bg-gray-50 text-gray-400",
};

const ManageUsers = () => {
    const navigate = useNavigate();
    const { data: users = [], isLoading, isError, refetch } = useFetchAllUsersQuery();
    const [deleteUser] = useDeleteUserMutation();
    const [sendVouchers, { isLoading: isSending }] = useSendVouchersMutation();
    const [selectedSegment, setSelectedSegment] = useState("All");

    // Get unique segments from users for filter options
    const segments = useMemo(() => {
        const unique = [...new Set(users.map(u => u.segment || "No Orders"))];
        unique.sort();
        return ["All", ...unique];
    }, [users]);

    // Filter users by selected segment
    const filteredUsers = useMemo(() => {
        if (selectedSegment === "All") return users;
        return users.filter(u => (u.segment || "No Orders") === selectedSegment);
    }, [users, selectedSegment]);

    const handleDeleteUser = async (id) => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
            });

            if (result.isConfirmed) {
                await deleteUser(id).unwrap();
                Swal.fire("Deleted!", "User account has been deleted.", "success");
                refetch();
            }
        } catch (error) {
            console.error("Failed to delete user", error);
            Swal.fire("Error", "Failed to delete user. Please try again.", "error");
        }
    };

    const handleSendEmail = (user) => {
        const segment = user.segment || "No Orders";
        let subject = "";
        let body = "";

        if (["Champions", "Loyal Customers"].includes(segment)) {
            subject = "A little something for our favorite reader... 🎁";
            body = `Hi ${user.username},\n\nWe couldn’t help but notice you’ve been tearing through your reading list lately! As one of our most dedicated readers, we wanted to say thank you.\n\nWe’ve just added a 20% "Champion Discount" to your account for your next purchase. Plus, since you’re a top-tier member, you now have early access to our upcoming signed editions arriving next week.\n\n[View Early Access Collection]\n\nHappy reading,\nThe Bookshare Team`;
        } else if (["New Customers", "Potential Loyalist", "Promising"].includes(segment)) {
            subject = "What’s next on your bookshelf? 📚";
            body = `Hi ${user.username},\n\nWe hope you enjoyed your recent purchase of [Last Product Name]!\n\nDid you know that readers who liked that book also couldn't put these down? We’ve hand-picked a few recommendations just for you based on your taste.\n\n[Personalized Recommendation 1]\n[Personalized Recommendation 2]\n\nUse code CHAPTER2 for free shipping on your second order!\n\n[Browse Recommendations]`;
        } else if (["At Risk", "Can't Lose Them"].includes(segment)) {
            const genre = user.favoriteGenre || "your favorite genre";
            subject = "We miss you (and so do these books) ☕";
            body = `Hi ${user.username},\n\nIt’s been a while since we saw you browsing our shelves. We know life gets busy, but we’ve missed having you in the community.\n\nBecause you’ve been such a great supporter of Bookshare in the past, we’ve reserved a special 30% discount just for you to help you jump back into your next adventure.\n\nCheck out what's new in ${genre} since you last visited!\n\n[Come Back & Save 30%]\n\nCheers,\n[Store Owner Name]`;
        } else {
            // "About to Sleep", "Hibernating", "Lost", "Needs Attention", "No Orders"
            subject = "Top 10 Books of 2026 (So Far) 📈";
            body = `Hi ${user.username},\n\nA lot has changed in the book world since your last visit! We’ve compiled a list of the Top 10 Trending Titles that everyone in Da Nang is talking about this month.\n\nWhether you’re looking for a beach read or a deep dive into data engineering, there’s something here for you.\n\n[See the Top 10 List]\n\nP.S. If you’re not looking for books right now, no worries! We’ll be here when you’re ready for your next story.`;
        }

        navigate('/admin/compose-email', { 
            state: { 
                email: user.email, 
                subject: subject, 
                body: body 
            } 
        });
    };

    const handleSendVouchers = async () => {
        if (filteredUsers.length === 0) return;

        try {
            const result = await Swal.fire({
                title: 'Send Vouchers?',
                text: `Send a 20% discount voucher to ${filteredUsers.length} customers in the "${selectedSegment}" segment?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3b82f6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, send them!'
            });

            if (result.isConfirmed) {
                const emails = filteredUsers.map(u => u.email);
                const response = await sendVouchers(emails).unwrap();
                
                Swal.fire(
                    'Sent!',
                    `${response.successful} vouchers sent successfully. ${response.failed > 0 ? `${response.failed} failed.` : ''}`,
                    'success'
                );
            }
        } catch (error) {
            console.error("Failed to send vouchers", error);
            Swal.fire("Error", "Failed to send vouchers. Please try again.", "error");
        }
    };

    if (isLoading) return <div className="p-6">Loading users...</div>;
    if (isError) return <div className="p-6 text-red-500">Error fetching users.</div>;

    return (
        <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-150px)]">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Manage Users</h2>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedSegment}
                        onChange={(e) => setSelectedSegment(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {segments.map(seg => (
                            <option key={seg} value={seg}>{seg}</option>
                        ))}
                    </select>
                    <p className="text-sm text-gray-500">
                        Showing: {filteredUsers.length} / {users.length} users
                    </p>
                    {selectedSegment === "Loyal Customers" && (
                        <button
                            onClick={handleSendVouchers}
                            disabled={isSending || filteredUsers.length === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:bg-blue-300 flex items-center gap-2"
                        >
                            {isSending ? (
                                <>
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Send 20% Voucher
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                            <th className="px-6 py-4 text-left">User ID</th>
                            <th className="px-6 py-4 text-left">Username</th>
                            <th className="px-6 py-4 text-left">Email</th>
                            <th className="px-6 py-4 text-left">Phone</th>
                            <th className="px-6 py-4 text-left">RFM Score</th>
                            <th className="px-6 py-4 text-left">Segment</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-blue-600">{user.userId}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <Link to={`/admin/users/${user.userId}/orders`} className="hover:text-blue-600 hover:underline transition-colors cursor-pointer" title="View Delivered Orders">
                                        {user.username}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                                <td className="px-6 py-4 font-mono text-sm text-gray-700">
                                    {user.rfmCode || "—"}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${SEGMENT_COLORS[user.segment] || SEGMENT_COLORS["No Orders"]}`}>
                                        {user.segment || "No Orders"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleSendEmail(user)}
                                        disabled={isSending}
                                        className="text-blue-600 hover:text-blue-900 font-medium transition-colors disabled:opacity-50"
                                    >
                                        Send Email
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-10 text-center text-gray-400 italic">
                                    No users found{selectedSegment !== "All" ? ` in "${selectedSegment}" segment` : " in the database"}.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default ManageUsers;
