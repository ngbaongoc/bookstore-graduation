import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ComposeEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');

    useEffect(() => {
        if (location.state) {
            setTo(location.state.email || '');
            setSubject(location.state.subject || '');
            if (editorRef.current && location.state.body) {
                // Pre-fill editor with converted line-breaks to <br/> tags
                editorRef.current.innerHTML = location.state.body.replace(/\n/g, '<br/>');
            }
        }
    }, [location.state]);

    const handleSend = (e) => {
        e.preventDefault();
        
        // Final email body including inline base64 images
        const finalHtml = editorRef.current.innerHTML;

        Swal.fire({
            title: 'Mock Email Sent!',
            text: 'We will install the actual email sending feature later. The image is included inline within the message HTML!',
            icon: 'info',
            confirmButtonColor: '#3b82f6',
        }).then(() => {
            navigate('/admin/manage-users');
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imgData = event.target.result;
                
                // Focus editor and insert image at caret position
                editorRef.current.focus();
                
                // Use execCommand to cleanly insert HTML element and preserve undo history
                const imgHtml = `<img src="${imgData}" style="max-width: 100%; height: auto; display: block; margin: 10px 0;" alt="inserted image" />`;
                document.execCommand('insertHTML', false, imgHtml);
            };
            reader.readAsDataURL(file);
        }
        
        // Reset file input value to allow uploading the same file again
        e.target.value = null;
    };

    return (
        <section className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[calc(100vh-150px)] max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Compose Email</h2>
                <button 
                    onClick={() => navigate('/admin/manage-users')}
                    className="text-gray-500 hover:text-gray-700 transition-colors font-medium text-sm border border-gray-200 px-4 py-2 rounded-lg"
                >
                    Back to Users
                </button>
            </div>

            <form onSubmit={handleSend} className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
                    <input 
                        type="email" 
                        value={to} 
                        onChange={(e) => setTo(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required 
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                    <input 
                        type="text" 
                        value={subject} 
                        onChange={(e) => setSubject(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                        required 
                    />
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Message</label>
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current.click()}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium py-1.5 px-3 rounded-md transition-colors flex items-center gap-1.5 border border-blue-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            Insert Inline Image
                        </button>
                    </div>

                    {/* Rich text editor area */}
                    <div 
                        ref={editorRef}
                        contentEditable
                        className="w-full min-h-[400px] bg-white border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none transition-all font-sans text-sm leading-relaxed overflow-y-auto"
                        style={{ whiteSpace: 'pre-wrap' }}
                    ></div>
                    
                    {/* Hidden file input strictly used for image inserting */}
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        className="hidden" 
                    />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                    <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Mock Send Email
                    </button>
                </div>
            </form>
        </section>
    );
};

export default ComposeEmail;
