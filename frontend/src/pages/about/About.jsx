import React from 'react'
import { Link } from 'react-router-dom'
import { FaBookOpen, FaTruck, FaHeadset, FaShieldAlt } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

const About = () => {
    const { t } = useTranslation();

    const stats = [
        { label: t('about.statsBooks'), value: '10,000+' },
        { label: t('about.statsCustomers'), value: '5,000+' },
        { label: t('about.statsOrders'), value: '15,000+' },
        { label: t('about.statsService'), value: '5+' },
    ]

    const values = [
        {
            icon: <FaBookOpen className="text-3xl text-[#008080]" />,
            title: t('about.valueCollection'),
            description: t('about.valueCollectionDesc'),
        },
        {
            icon: <FaTruck className="text-3xl text-[#008080]" />,
            title: t('about.valueDelivery'),
            description: t('about.valueDeliveryDesc'),
        },
        {
            icon: <FaShieldAlt className="text-3xl text-[#008080]" />,
            title: t('about.valuePrices'),
            description: t('about.valuePricesDesc'),
        },
        {
            icon: <FaHeadset className="text-3xl text-[#008080]" />,
            title: t('about.valueSupport'),
            description: t('about.valueSupportDesc'),
        },
    ]

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#008080] to-[#005f5f] text-white py-20 px-4 rounded-2xl">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('about.heroTitle')}</h1>
                    <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                        {t('about.heroDesc')}
                    </p>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('about.storyTitle')}</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                {t('about.storyPara1')}
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                {t('about.storyPara2')}
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                {t('about.storyPara3')}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-8xl">📚</span>
                                <p className="mt-4 text-gray-500 italic text-lg">"{t('about.quote')}"</p>
                                <p className="text-gray-400 mt-2">— {t('about.quoteAuthor')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-gray-50 py-16 px-4 rounded-2xl">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">{t('about.statsTitle')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="text-3xl md:text-4xl font-bold text-[#008080]">{stat.value}</p>
                                <p className="text-gray-500 mt-2 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">{t('about.chooseTitle')}</h2>
                    <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
                        {t('about.chooseDesc')}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                                <div className="w-14 h-14 bg-[#008080]/10 rounded-xl flex items-center justify-center mb-4">
                                    {value.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{value.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-br from-[#008080] to-[#005f5f] text-white py-16 px-4 rounded-2xl mb-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">{t('about.ctaTitle')}</h2>
                    <p className="text-white/80 mb-8">{t('about.ctaDesc')}</p>
                    <Link
                        to="/"
                        className="inline-block bg-white text-[#008080] font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                    >
                        {t('about.ctaButton')}
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default About
