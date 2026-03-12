'use strict';
const express = require('express');
const router  = express.Router();

/* Books are stored in memory for demo. Replace with DB in production. */
const books = [
  { id:1, category:'Hadith',  title:'Riyadh al-Salihin', author_name:'Imam al-Nawawi',
    language:'English', difficulty:'Beginner', is_recommended:true, is_classic:true,
    description:'Gardens of the Righteous — comprehensive hadith compilation.',
    url_free:'https://sunnah.com/riyadussalihin' },
  { id:2, category:'Tafsir',  title:'Tafsir Ibn Kathir', author_name:'Imam Ibn Kathir',
    language:'English', difficulty:'Intermediate', is_recommended:true, is_classic:true,
    description:'The most widely-used classical Quranic commentary.',
    url_free:'https://quran.com' },
  { id:3, category:'Seerah',  title:'The Sealed Nectar', author_name:'Safi-ur-Rahman al-Mubarakpuri',
    language:'English', difficulty:'Beginner', is_recommended:true,
    description:'Award-winning biography of Prophet Muhammad ﷺ.',
    url_free:'https://islamhouse.com' },
  { id:4, category:'Aqeedah', title:'Kitab al-Tawheed',  author_name:'Ibn Abd al-Wahhab',
    language:'English', difficulty:'Beginner', is_recommended:true, is_classic:true,
    description:'Foundational text on Islamic monotheism (Tawheed).',
    url_free:'https://islamhouse.com' },
  { id:5, category:'History', title:'History of Muslims in Bengal', author_name:'Dr. Abdul Karim',
    language:'English', difficulty:'Intermediate', is_recommended:true,
    description:'Landmark academic work on Islamic history in Bengal.',
    url_free:'https://en.wikipedia.org/wiki/Islam_in_Bangladesh' },
  { id:6, category:'Fiqh',    title:'Fiqh al-Sunnah',   author_name:'Sayyid Sabiq',
    language:'English', difficulty:'Intermediate', is_recommended:true, is_classic:true,
    description:'Comprehensive guide to Islamic jurisprudence based on Quran and Sunnah.',
    url_free:'https://islamhouse.com' },
];

router.get('/', (req, res) => {
  let results = [...books];
  if (req.query.category) results = results.filter(b => b.category === req.query.category);
  if (req.query.q) {
    const q = req.query.q.toLowerCase();
    results = results.filter(b => b.title.toLowerCase().includes(q) || b.author_name.toLowerCase().includes(q));
  }
  res.json({ books: results, total: results.length });
});

router.get('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id, 10));
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

module.exports = router;
