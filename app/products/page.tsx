'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Globe, Sun, Moon, Menu, X, ArrowRight, Phone, Mail, MapPin,
  Factory, Zap, Gauge, Wrench, Shield, Award, TrendingUp,
  ChevronDown, Filter, Search, ExternalLink, Download, Check,
  Sparkles, Users, Target, Eye, Heart, Leaf, ChevronLeft, ChevronRight,
  Star, Send, Reply, MessageCircle, Trash2
} from 'lucide-react';
import {
  defaultLocale,
  getAllMessages,
  isLocale,
  localeSettings,
  locales,
  type Locale,
  type ProductsMessages,
  type ProductsNamespaceSchema
} from '@/app/lib/i18n';

type ProductEntry = ProductsNamespaceSchema['products'][number];
type ProductCategoryId = ProductsNamespaceSchema['categories'][number]['id'];

interface ProductReply {
  id: number;
  author: string;
  text: string;
  date: string;
  isAdmin?: boolean;
}

interface ProductComment {
  id: number;
  rating: number;
  author: string;
  email: string;
  text: string;
  date: string;
  replies: ProductReply[];
}

interface PendingComment {
  rating: number;
  text: string;
  author: string;
  email: string;
}

type CommentsState = Record<string, ProductComment[]>;

export default function ProductsPage() {
  // State Management
  const [lang, setLang] = useState<Locale>(defaultLocale);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategoryId>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductEntry | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [comments, setComments] = useState<CommentsState>({});
  const [newComment, setNewComment] = useState<PendingComment>({
    rating: 5,
    text: '',
    author: '',
    email: ''
  });
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceProduct, setPriceProduct] = useState<ProductEntry | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Hydration
  useEffect(() => {
    setMounted(true);
    const storedLang = localStorage.getItem('foam-sanat-lang');
    if (storedLang) {
      try {
        const parsedLang = JSON.parse(storedLang);
        if (typeof parsedLang === 'string' && isLocale(parsedLang)) {
          setLang(parsedLang);
        }
      } catch (error) {
        console.error('Failed to parse stored language', error);
      }
    }

    const storedTheme = localStorage.getItem('foam-sanat-theme');
    if (storedTheme) {
      try {
        const parsedTheme = JSON.parse(storedTheme);
        if (parsedTheme === 'light' || parsedTheme === 'dark') {
          setTheme(parsedTheme);
        }
      } catch (error) {
        console.error('Failed to parse stored theme', error);
      }
    }

    const savedComments = localStorage.getItem('product-comments');
    if (savedComments) {
      try {
        const parsedComments = JSON.parse(savedComments);
        if (parsedComments && typeof parsedComments === 'object') {
          setComments(parsedComments as CommentsState);
        }
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    }
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
      // Focus modal for accessibility
      setTimeout(() => modalRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when modal is scrolling
  const handleModalScroll = useCallback((e: React.WheelEvent) => {
    if (modalRef.current) {
      const isScrollable = modalRef.current.scrollHeight > modalRef.current.clientHeight;
      if (isScrollable) {
        e.stopPropagation();
      }
    }
  }, []);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedProduct) {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedProduct]);

  // Save comments
  const saveComments = useCallback((updatedComments: CommentsState) => {
    setComments(updatedComments);
    localStorage.setItem('product-comments', JSON.stringify(updatedComments));
  }, []);

  // Toggle language
  const toggleLang = useCallback(() => {
    const currentIndex = locales.indexOf(lang);
    const nextLang = locales[(currentIndex + 1) % locales.length];
    setLang(nextLang);
    localStorage.setItem('foam-sanat-lang', JSON.stringify(nextLang));
  }, [lang]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('foam-sanat-theme', JSON.stringify(newTheme));
  }, [theme]);

  // Add comment handler
  const handleAddComment = useCallback((productId: string) => {
    if (!newComment.text.trim() || !newComment.author.trim()) return;

    const updated: CommentsState = { ...comments };
    const comment: ProductComment = {
      id: Date.now(),
      rating: newComment.rating,
      author: newComment.author,
      email: newComment.email,
      text: newComment.text,
      date: new Date().toLocaleDateString(localeSettings[lang].langTag),
      replies: []
    };

    const productComments = updated[productId] ? [...updated[productId], comment] : [comment];
    updated[productId] = productComments;

    saveComments(updated);
    setNewComment({ rating: 5, text: '', author: '', email: '' });
  }, [comments, newComment, saveComments, lang]);

  // Delete comment handler
  const handleDeleteComment = useCallback((productId: string, commentId: number) => {
    const updated: CommentsState = { ...comments };
    if (updated[productId]) {
      updated[productId] = updated[productId].filter((c) => c.id !== commentId);
      saveComments(updated);
    }
  }, [comments, saveComments]);

  // Reply handler
  const handleReply = useCallback((productId: string, commentId: number, replyTxt: string) => {
    if (!replyTxt.trim()) return;

    const updated: CommentsState = { ...comments };
    const productComments = updated[productId];
    if (!productComments) {
      return;
    }

    const reply: ProductReply = {
      id: Date.now(),
      author: lang === 'fa' ? 'مدیر سایت' : 'Site Admin',
      text: replyTxt,
      date: new Date().toLocaleDateString(localeSettings[lang].langTag),
      isAdmin: true
    };

    updated[productId] = productComments.map((comment) =>
      comment.id === commentId ? { ...comment, replies: [...comment.replies, reply] } : comment
    );

    saveComments(updated);
  }, [comments, saveComments, lang]);

  // Styles
  const localeMeta = localeSettings[lang];
  const isRTL = localeMeta.dir === 'rtl';
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const headerBg = isDark ? 'bg-gray-800/95' : 'bg-white/95';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const sectionBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  const messages = getAllMessages(lang);
  const t: ProductsMessages = messages.products;
  const products: ProductEntry[] = t.products;

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return products;
    }

    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const searchedProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return filteredProducts;
    }

    return filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.applications.some((app) => app.toLowerCase().includes(term))
    );
  }, [filteredProducts, searchTerm]);

  if (!mounted) return null;

  // Modal Components
  const PriceModal = ({ product, onClose }: { product: ProductEntry | null; onClose: () => void }) => {
    if (!product) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className={`${cardBg} rounded-3xl p-8 max-w-md w-full shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black">{product.name}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {product.hasPrice ? (
            <div className="mb-6">
              <p className="text-sm font-bold text-orange-500 mb-2">
                {isRTL ? 'قیمت فعلی' : 'Current Price'}
              </p>
              <p className="text-4xl font-black text-orange-600 mb-2">{product.price}</p>
              <p className="text-xs text-gray-500">
                {isRTL ? 'قیمت شامل نصب و راه‌اندازی' : 'Includes installation'}
              </p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-purple-600/10 rounded-xl">
              <p className="text-lg font-bold mb-3">
                {isRTL ? 'قیمت متغیر' : 'Variable Price'}
              </p>
              <p className="text-sm">
                {isRTL 
                  ? 'برای دریافت قیمت دقیق لطفا با تیم تماس بگیرید'
                  : 'Please contact for exact pricing'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <a
              href="tel:+989128336085"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
            >
              <Phone className="w-5 h-5" />
              {isRTL ? 'تماس' : 'Call'}
            </a>
            <a
              href="mailto:info@foamsanat.com"
              className={`flex items-center justify-center gap-2 ${cardBg} border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all`}
            >
              <Mail className="w-5 h-5" />
              {isRTL ? 'ایمیل' : 'Email'}
            </a>
          </div>
        </div>
      </div>
    );
  };

  const ProductDetailModal = ({ product, onClose }: { product: ProductEntry | null; onClose: () => void }) => {
    if (!product) return null;

    const productComments: ProductComment[] = comments[product.id] ?? [];

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`${cardBg} rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl my-8`}
          onClick={(e) => e.stopPropagation()}
          onWheel={handleModalScroll}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="float-right text-gray-500 hover:text-gray-700 p-2 mb-4"
            aria-label={isRTL ? 'بستن' : 'Close'}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Slider */}
          <div className="clear-both mb-8">
            <div className="relative mb-4 group">
              <div className="aspect-video bg-gradient-to-br from-orange-400 to-purple-600 rounded-2xl flex items-center justify-center text-6xl md:text-8xl overflow-hidden w-full">
                {product.images[currentSlide]}
              </div>
              
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="flex justify-center gap-2 mt-4">
                    {product.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          i === currentSlide ? 'bg-orange-500 w-8' : 'bg-gray-400'
                        }`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl md:text-4xl font-black mb-2" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                  {product.name}
                </h2>
                <p className="text-lg text-orange-500 font-bold">{product.shortDesc}</p>
              </div>
              {product.badge && (
                <span className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Price */}
            <div className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-gray-700' : 'bg-orange-50'}`}>
              <p className="text-sm font-bold text-orange-600 mb-2">{isRTL ? 'قیمت' : 'Price'}</p>
              <p className="text-2xl md:text-3xl font-black text-orange-600">{product.price}</p>
              {!product.hasPrice && (
                <button
                  onClick={() => {
                    setPriceProduct(product);
                    setShowPriceModal(true);
                  }}
                  className="text-sm text-orange-600 font-bold hover:underline mt-2"
                >
                  {isRTL ? 'کلیک برای اطلاع' : 'Click for info'}
                </button>
              )}
            </div>

            {/* Full Description */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-black mb-4" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                {isRTL ? 'توضیحات' : 'Description'}
              </h3>
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} whitespace-pre-wrap leading-relaxed text-sm md:text-base`}>
                {product.fullDescription}
              </div>
            </div>

            {/* Specs */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-black mb-4" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                {isRTL ? 'مشخصات' : 'Specifications'}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(product.specs).map(([key, value]: [string, any]) => (
                  <div key={key} className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-sm font-bold text-orange-600 mb-1 capitalize">{key}</p>
                    <p className="font-bold">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-black mb-4" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                {isRTL ? 'کاربردها' : 'Applications'}
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.applications.map((app: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full font-bold text-sm">
                    ✓ {app}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-4 mb-8 flex-col sm:flex-row">
              <a
                href="tel:+989128336085"
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all"
              >
                <Phone className="w-6 h-6" />
                {isRTL ? 'تماس' : 'Call'}
              </a>
              <a
                href="mailto:info@foamsanat.com"
                className={`flex-1 flex items-center justify-center gap-2 ${cardBg} border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all`}
              >
                <Mail className="w-6 h-6" />
                {isRTL ? 'ایمیل' : 'Email'}
              </a>
            </div>
          </div>

          {/* Comments Section */}
          <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-8`}>
            <h3 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-2" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
              <MessageCircle className="w-6 h-6" />
              {isRTL ? 'نظرات' : 'Reviews'} ({productComments.length})
            </h3>

            {/* Add Comment Form */}
            <form
              ref={formRef}
              onSubmit={(e) => {
                e.preventDefault();
                handleAddComment(product.id);
              }}
              className={`${isDark ? 'bg-gray-700' : 'bg-orange-50'} p-6 rounded-2xl mb-8`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewComment({ ...newComment, rating: star })}
                      className={`text-2xl transition-all ${
                        star <= newComment.rating ? 'text-yellow-400 scale-110' : 'text-gray-400'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="font-bold text-sm">({newComment.rating}/5)</span>
              </div>

              <input
                type="text"
                placeholder={isRTL ? 'نام' : 'Name'}
                value={newComment.author}
                onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg mb-3 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                required
              />
              
              <input
                type="email"
                placeholder={isRTL ? 'ایمیل' : 'Email'}
                value={newComment.email}
                onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg mb-3 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />

              <textarea
                placeholder={isRTL ? 'نظر شما' : 'Your review'}
                value={newComment.text}
                onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg mb-4 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none`}
                required
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {isRTL ? 'ارسال' : 'Submit'}
              </button>
            </form>

            {/* Comments List */}
            {productComments.length === 0 ? (
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isRTL ? 'نظری نیست' : 'No reviews'}
              </p>
            ) : (
              <div className="space-y-6">
                {productComments.map((comment) => (
                  <div key={comment.id} className={`p-6 rounded-2xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                      <div>
                        <p className="font-bold text-lg">{comment.author}</p>
                        <p className="text-xs text-gray-500">{comment.date}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(product.id, comment.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isRTL ? 'حذف' : 'Delete'}
                      </button>
                    </div>

                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_: number, i: number) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < comment.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                        />
                      ))}
                    </div>

                    <p className="mb-4">{comment.text}</p>

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-gray-300">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className={`pl-4 py-2 rounded ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                            <p className="font-bold text-sm text-orange-600">{reply.author}</p>
                            <p className="text-xs text-gray-500 mb-1">{reply.date}</p>
                            <p className="text-sm">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo !== comment.id ? (
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-sm text-orange-500 font-bold hover:underline mt-3 flex items-center gap-1"
                      >
                        <Reply className="w-4 h-4" />
                        {isRTL ? 'پاسخ' : 'Reply'}
                      </button>
                    ) : (
                      <div className="mt-4 space-y-2">
                        <textarea
                          placeholder={isRTL ? 'پاسخ' : 'Reply'}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          className={`w-full px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-600 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleReply(product.id, comment.id, replyText);
                              setReplyText('');
                              setReplyingTo(null);
                            }}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition-all"
                          >
                            {isRTL ? 'ارسال' : 'Send'}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className={`px-4 py-2 rounded-lg font-bold text-sm ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                          >
                            {isRTL ? 'لغو' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={lang}
      style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}
    >
      {/* Header */}
      <header className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled ? `${headerBg} backdrop-blur-lg shadow-2xl` : 'bg-transparent'
      }`}>
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="text-white font-bold text-sm">FS</span>
              </div>
              <span className="font-bold text-sm hidden sm:block line-clamp-1">
                {t.companyName}
              </span>
            </a>

            <div className="hidden md:flex gap-6 items-center">
              {Object.entries(t.nav).map(([key, value]) => (
                <a 
                  key={key}
                  href={key === 'home' ? '/' : `/${key}`}
                  className={`hover:text-orange-500 transition-colors font-bold text-sm ${
                    key === 'products' ? 'text-orange-500' : ''
                  }`}
                >
                  {value}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleLang} className={`p-2 rounded-lg transition-colors ${hoverBg}`} aria-label="Toggle language">
                <Globe className="w-5 h-5" />
              </button>
              <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${hoverBg}`} aria-label="Toggle theme">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`md:hidden p-2 rounded-lg transition-colors ${hoverBg}`} aria-label="Toggle menu">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className={`md:hidden mt-4 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {Object.entries(t.nav).map(([key, value]) => (
                <a key={key} href={key === 'home' ? '/' : `/${key}`} className={`block px-4 py-3 rounded-lg transition-colors ${hoverBg}`} onClick={() => setMobileMenuOpen(false)}>
                  {value}
                </a>
              ))}
            </div>
          )}
        </nav>
      </header>

      <main className="pt-32">
        {/* Hero */}
        <section className="relative py-16 px-4 overflow-hidden">
          <div className={`absolute inset-0 opacity-50 ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-orange-50'}`} />
          <div className="container mx-auto relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-2xl">
                <Sparkles className="w-5 h-5" />
                {t.hero.badge}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-orange-500 to-purple-600 bg-clip-text text-transparent">
                  {t.hero.title}
                </span>
              </h1>
              <p className="text-lg md:text-xl mb-4 text-orange-500 font-bold">{t.hero.subtitle}</p>
              <p className={`text-base md:text-lg mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.hero.description}
              </p>
            </div>
          </div>
        </section>

        {/* Features Bar */}
        <section className={`py-12 px-4 ${sectionBg}`}>
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {t.features.items.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group hover:scale-110 transition-transform flex-shrink-0">
                      <Icon className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-bold mb-1 text-sm md:text-base">{feature.title}</h3>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-4">
              <div className={`relative ${cardBg} rounded-xl shadow-lg overflow-hidden border-2 border-orange-500/30 focus-within:border-orange-500`}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder={isRTL ? 'جستجو...' : 'Search...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-transparent focus:outline-none ${textColor} text-sm md:text-base`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {t.categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 md:px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-xs md:text-sm whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-lg scale-105'
                          : `${cardBg} ${hoverBg} border border-orange-500/20`
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6 text-sm font-bold">
              {isRTL ? `${searchedProducts.length} محصول` : `${searchedProducts.length} products`}
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {searchedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`${cardBg} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group border border-orange-500/20 cursor-pointer flex flex-col`}
                >
                  <div className="relative h-40 sm:h-48 bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center text-5xl sm:text-7xl group-hover:scale-110 transition-transform overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {product.images[0]}
                    </div>
                  </div>

                  {product.badge && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg z-10">
                      {product.badge}
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg md:text-xl font-black mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-orange-500 font-bold mb-2">{product.shortDesc}</p>
                    
                    <p className="text-xs mb-3 leading-relaxed line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    {/* Features */}
                    <div className="mb-4 space-y-1 text-xs">
                      {product.features.slice(0, 2).map((feature: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="text-center mb-4 p-3 rounded-lg border-2 border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-purple-600/5">
                      <p className="text-xs font-bold text-orange-600 mb-0.5">{isRTL ? 'قیمت' : 'Price'}</p>
                      <p className="text-sm md:text-base font-black text-orange-600 line-clamp-1">{product.price}</p>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setCurrentSlide(0);
                        }}
                        className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white px-3 py-2 rounded-lg font-bold hover:scale-105 transition-all text-xs md:text-sm"
                      >
                        {isRTL ? 'جزئیات' : 'Details'}
                      </button>
                      <a
                        href="tel:+989128336085"
                        className="w-full text-center border-2 border-orange-500 text-orange-500 px-3 py-2 rounded-lg font-bold hover:scale-105 transition-all text-xs md:text-sm bg-transparent"
                      >
                        {isRTL ? 'تماس' : 'Call'}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {searchedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isRTL ? 'محصولی یافت نشد' : 'No products found'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Why Us */}
        <section className={`py-16 px-4 ${sectionBg}`}>
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-3">
                {isRTL ? 'چرا ما؟' : 'Why Us?'}
              </h2>
              <p className="text-lg text-orange-500 font-bold">
                {isRTL ? 'بهترین انتخاب برای کسب‌وکار شما' : 'Best choice for your business'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: isRTL ? 'کیفیت' : 'Quality', desc: isRTL ? 'استانداردهای جهانی' : 'Global standards' },
                { icon: Zap, title: isRTL ? 'انرژی' : 'Energy', desc: isRTL ? '۲۰-۳۰٪ کمتر' : '20-30% less' },
                { icon: Users, title: isRTL ? 'پشتیبانی' : 'Support', desc: isRTL ? '۲۴/۷' : '24/7' },
                { icon: Target, title: isRTL ? 'دقت' : 'Precision', desc: isRTL ? '۱۰۰٪ تست' : '100% tested' }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={`${cardBg} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 border border-orange-500/20`}>
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg flex-shrink-0">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className={`container mx-auto max-w-4xl ${cardBg} rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden border-2 border-orange-500/30`}>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-600/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                {t.cta.title}
              </h2>
              <p className="text-lg md:text-xl mb-8 text-gray-700 dark:text-gray-300">
                {t.cta.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+989128336085"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl text-sm md:text-base"
                >
                  <Phone className="w-5 h-5" />
                  {isRTL ? 'تماس' : 'Call'}
                </a>
                <a
                  href="mailto:info@foamsanat.com"
                  className={`inline-flex items-center justify-center gap-2 ${cardBg} border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl text-sm md:text-base`}
                >
                  <Mail className="w-5 h-5" />
                  {isRTL ? 'ایمیل' : 'Email'}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className={`py-16 px-4 ${sectionBg}`}>
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className={`${cardBg} rounded-2xl p-6 shadow-xl text-center border border-orange-500/20`}>
                <Phone className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">{isRTL ? 'تماس' : 'Phone'}</h3>
                <a href="tel:+989128336085" className="text-orange-500 hover:text-orange-600 font-bold text-sm md:text-base">
                  +98 912 833 6085
                </a>
              </div>
              <div className={`${cardBg} rounded-2xl p-6 shadow-xl text-center border border-orange-500/20`}>
                <Mail className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">{isRTL ? 'ایمیل' : 'Email'}</h3>
                <a href="mailto:info@foamsanat.com" className="text-orange-500 hover:text-orange-600 font-bold text-sm md:text-base break-all">
                  info@foamsanat.com
                </a>
              </div>
              <div className={`${cardBg} rounded-2xl p-6 shadow-xl text-center border border-orange-500/20`}>
                <MapPin className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">{isRTL ? 'آدرس' : 'Address'}</h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isRTL ? 'تهران، ایران' : 'Tehran, Iran'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-gray-400 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-center gap-6 mb-8">
            <a href="tel:+989128336085" className="w-12 h-12 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <Phone className="w-6 h-6" />
            </a>
            <a href="mailto:info@foamsanat.com" className="w-12 h-12 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <Mail className="w-6 h-6" />
            </a>
            <a href="#" className="w-12 h-12 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <MapPin className="w-6 h-6" />
            </a>
          </div>
          <p className="text-base font-bold text-white mb-1 text-center">
            {t.companyName}
          </p>
          <p className="text-xs text-center">© 2024 - {isRTL ? 'تمامی حقوق محفوظ' : 'All rights reserved'}</p>
        </div>
      </footer>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => {
            setSelectedProduct(null);
            setCurrentSlide(0);
          }}
        />
      )}

      {showPriceModal && (
        <PriceModal
          product={priceProduct}
          onClose={() => {
            setShowPriceModal(false);
            setPriceProduct(null);
          }}
        />
      )}
    </div>
  );
}
