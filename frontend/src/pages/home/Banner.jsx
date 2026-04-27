import React from 'react'
import { useTranslation } from 'react-i18next';
import ban_cong_len_troiIMG from '../../books/ban-cong-len-troi.jpg'
import modianoIMG from '../../books/modiano.webp'
import schlinkIMG from '../../books/schlink.webp'

const Banner = () => {
    const { t } = useTranslation();
    return (
        <div className='flex flex-col md:flex-row-reverse py-16 justify-between items-center gap-12'>
            <div className='md:w-1/2 w-full flex items-center md:justify-end'>
                <div className='relative flex items-center'>
                    <img src={ban_cong_len_troiIMG} alt="" className='z-30 w-48 md:w-64 rounded-md shadow-2xl transition-transform hover:scale-105 cursor-pointer' />
                    <img src={modianoIMG} alt="" className='-ml-12 z-20 w-40 md:w-56 rounded-md shadow-xl opacity-90 transition-transform hover:scale-105 cursor-pointer' />
                    <img src={schlinkIMG} alt="" className='-ml-12 z-10 w-32 md:w-48 rounded-md shadow-lg opacity-80 transition-transform hover:scale-105 cursor-pointer' />
                </div>
            </div>

            <div className='md:w-1/2 w-full'>
                <h1 className='md:text-5xl text-2xl font-medium mb-7'>{t('banner.title')}</h1>
                <p className='mb-10'>{t('banner.description')}</p>
            </div>
        </div>
    )
}

export default Banner