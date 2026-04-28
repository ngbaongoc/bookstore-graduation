import React, { useState } from 'react'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import mapImg from '../../assets/map.png'

const Contact = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
    const [submitted, setSubmitted] = useState(false)

    const contactInfo = [
        {
            icon: <FaEnvelope className="text-xl text-[#008080]" />,
            label: t('contact.infoEmail'),
            value: 'support@bookshare.app',
            href: 'mailto:support@bookshare.app',
        },
        {
            icon: <FaPhone className="text-xl text-[#008080]" />,
            label: t('contact.infoPhone'),
            value: '(+84) 346-097-901',
            href: 'tel:+84346097901',
        },
        {
            icon: <FaMapMarkerAlt className="text-xl text-[#008080]" />,
            label: t('contact.infoAddress'),
            value: t('contact.addressValue'),
            href: null,
        },
    ]

    const socials = [
        { icon: <FaLinkedin />, href: '#', label: 'LinkedIn' },
        { icon: <FaTwitter />, href: '#', label: 'Twitter' },
        { icon: <FaFacebook />, href: '#', label: 'Facebook' },
        { icon: <FaInstagram />, href: '#', label: 'Instagram' },
    ]

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setSubmitted(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setSubmitted(false), 4000)
    }

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-[#008080] to-[#005f5f] text-white py-16 px-4 rounded-2xl mb-12">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('contact.heroTitle')}</h1>
                    <p className="text-white/80 text-lg max-w-xl mx-auto">
                        {t('contact.heroDesc')}
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 pb-16">
                <div className="grid lg:grid-cols-5 gap-12">
                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('contact.formTitle')}</h2>

                        {submitted && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl mb-6 text-sm">
                                {t('contact.formSuccess')}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.labelName')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder={t('contact.placeholderName')}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.labelEmail')}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder={t('contact.placeholderEmail')}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.labelSubject')}</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder={t('contact.placeholderSubject')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.labelMessage')}</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    placeholder={t('contact.placeholderMessage')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-[#008080] hover:bg-[#006666] text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200"
                            >
                                {t('contact.buttonSend')}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info Sidebar */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('contact.infoTitle')}</h2>
                            <div className="space-y-5">
                                {contactInfo.map((item, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="w-11 h-11 bg-[#008080]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{item.label}</p>
                                            {item.href ? (
                                                <a href={item.href} className="text-sm text-gray-700 hover:text-[#008080] transition-colors">
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <p className="text-sm text-gray-700">{item.value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Business Hours */}
                         <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="font-bold text-gray-800 mb-4">{t('contact.hoursTitle')}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('contact.hoursMonFri')}</span>
                                    <span className="text-gray-700 font-medium">8:00 AM - 6:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('contact.hoursSat')}</span>
                                    <span className="text-gray-700 font-medium">9:00 AM - 5:00 PM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t('contact.hoursSun')}</span>
                                    <span className="text-gray-700 font-medium">{t('contact.hoursClosed')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Social */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">{t('contact.followTitle')}</h3>
                            <div className="flex gap-3">
                                {socials.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-[#008080] hover:text-white transition-all duration-200"
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Map */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">{t('contact.locationTitle')}</h3>
                            <div className="rounded-2xl overflow-hidden border border-gray-100">
                                <img src={mapImg} alt="Da Nang Location Map" className="w-full h-48 object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contact
