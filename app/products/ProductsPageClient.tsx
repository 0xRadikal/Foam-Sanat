'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Phone, Mail, MapPin, X,
  Factory, Zap, Gauge, Wrench, Shield, Award,
  Search, Check,
  Sparkles, Users, Target, ChevronLeft, ChevronRight,
  Star, Send, Reply, MessageCircle, Trash2
} from 'lucide-react';
import Header from '@/app/components/Header';
import CallToAction from '@/app/components/CallToAction';
import ContactInfo from '@/app/components/ContactInfo';
import { createNavigationItems } from '@/app/lib/navigation';
import { getAllMessages, type Locale, type MessagesByLocale, type ProductsNamespaceSchema } from '@/app/lib/i18n';
import { useSiteChrome } from '@/app/lib/useSiteChrome';
import { contactConfig } from '@/app/config/contact';

type Product = ProductsNamespaceSchema['products'][number];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const MIN_COMMENT_LENGTH = 20;

type CommentStatus = 'pending' | 'approved' | 'rejected';

type ProductCommentReply = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  isAdmin?: boolean;
  status: CommentStatus;
  isOptimistic?: boolean;
};

type ProductComment = {
  id: string;
  productId: string;
  rating: number;
  author: string;
  text: string;
  createdAt: string;
  status: CommentStatus;
  replies: ProductCommentReply[];
  isOptimistic?: boolean;
};

type CommentsState = Record<string, ProductComment[]>;

type DraftComment = {
  rating: number;
  text: string;
  author: string;
  email: string;
};

type ApiCommentReply = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  isAdmin?: boolean;
  status: CommentStatus;
};

type ApiComment = {
  id: string;
  productId: string;
  rating: number;
  author: string;
  text: string;
  createdAt: string;
  status: CommentStatus;
  replies: ApiCommentReply[];
};

interface ProductsPageClientProps {
  initialLocale: Locale;
  initialMessages: MessagesByLocale<Locale>;
}

export default function ProductsPageClient({ initialLocale, initialMessages }: ProductsPageClientProps) {
  const {
    lang,
    mobileMenuOpen,
    isRTL,
    isDark,
    fontFamily,
    themeClasses,
    toggleLang,
    toggleTheme,
    toggleMobileMenu,
    setLang
  } = useSiteChrome();
  const [activeLocale, setActiveLocale] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState(initialMessages);
  const hasSyncedInitialLocale = useRef(false);
  // State Management
  const [scrolled, setScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [comments, setComments] = useState<CommentsState>({});
  const [newComment, setNewComment] = useState<DraftComment>({ rating: 5, text: '', author: '', email: '' });
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceProduct, setPriceProduct] = useState<Product | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState('');
  const [adminTokenInput, setAdminTokenInput] = useState('');

  useEffect(() => {
    if (!hasSyncedInitialLocale.current) {
      hasSyncedInitialLocale.current = true;
      if (lang !== initialLocale) {
        setLang(initialLocale);
      }
    }
  }, [initialLocale, lang, setLang]);

  useEffect(() => {
    if (lang !== activeLocale) {
      setActiveLocale(lang);
      setMessages(getAllMessages(lang));
    }
  }, [lang, activeLocale]);
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Load stored admin token
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedToken = localStorage.getItem('comments-admin-token');
    if (storedToken) {
      setAdminToken(storedToken);
      setAdminTokenInput(storedToken);
    }
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
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
    if (typeof window === 'undefined') return;
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
    if (typeof window === 'undefined') return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedProduct) {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedProduct]);

  useEffect(() => {
    setCommentError(null);
    setCommentsError(null);
    setCommentsLoading(false);
    setReplyingTo(null);
    setReplyText('');
  }, [selectedProduct]);

  const mapApiComment = useCallback((comment: ApiComment): ProductComment => ({
    id: comment.id,
    productId: comment.productId,
    rating: comment.rating,
    author: comment.author,
    text: comment.text,
    createdAt: comment.createdAt,
    status: comment.status ?? 'approved',
    replies: (comment.replies ?? []).map((reply) => ({
      id: reply.id,
      author: reply.author,
      text: reply.text,
      createdAt: reply.createdAt,
      isAdmin: reply.isAdmin,
      status: reply.status ?? 'approved'
    }))
  }), []);
  
  const formatDate = useCallback(
    (isoDate: string) => new Date(isoDate).toLocaleDateString(activeLocale === 'fa' ? 'fa-IR' : 'en-US'),
    [activeLocale]
  );

  const t = useMemo(() => messages.products, [messages]);

  const handleSaveAdminToken = useCallback(() => {
    if (typeof window === 'undefined') return;
    const trimmed = adminTokenInput.trim();
    if (trimmed) {
      localStorage.setItem('comments-admin-token', trimmed);
      setAdminToken(trimmed);
    } else {
      localStorage.removeItem('comments-admin-token');
      setAdminToken('');
    }
    setCommentError(null);
  }, [adminTokenInput]);

  const handleClearAdminToken = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('comments-admin-token');
    setAdminToken('');
    setAdminTokenInput('');
    setCommentError(null);
  }, []);

  const handleAddComment = useCallback(
    async (productId: string) => {
      const trimmedAuthor = newComment.author.trim();
      const trimmedEmail = newComment.email.trim();
      const trimmedText = newComment.text.trim();

      if (!trimmedAuthor || !trimmedEmail || !trimmedText) {
        setCommentError(t.comments.validationError);
        return;
      }

      if (!emailPattern.test(trimmedEmail)) {
        setCommentError(t.comments.invalidEmail);
        return;
      }

      if (trimmedText.length < MIN_COMMENT_LENGTH) {
        setCommentError(t.comments.tooShort);
        return;
      }

      setCommentError(null);

      const optimisticComment: ProductComment = {
        id: `temp-${Date.now()}`,
        productId,
        rating: newComment.rating,
        author: trimmedAuthor,
        text: trimmedText,
        createdAt: new Date().toISOString(),
        status: 'pending',
        replies: [],
        isOptimistic: true
      };

      setComments((prev) => {
        const productComments = prev[productId] ?? [];
        return {
          ...prev,
          [productId]: [...productComments, optimisticComment]
        };
      });

      setIsSubmittingComment(true);

      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            rating: newComment.rating,
            author: trimmedAuthor,
            email: trimmedEmail,
            text: trimmedText
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? t.comments.submitError);
        }

        const serverComment = mapApiComment(data.comment as ApiComment);

        setComments((prev) => {
          const productComments = prev[productId] ?? [];
          return {
            ...prev,
            [productId]: productComments.map((comment) =>
              comment.id === optimisticComment.id ? serverComment : comment
            )
          };
        });

        setNewComment({ rating: 5, text: '', author: '', email: '' });
      } catch (error) {
        setComments((prev) => {
          const productComments = prev[productId] ?? [];
          return {
            ...prev,
            [productId]: productComments.filter((comment) => comment.id !== optimisticComment.id)
          };
        });

        setCommentError(error instanceof Error ? error.message : t.comments.submitError);
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [mapApiComment, newComment, t.comments.invalidEmail, t.comments.submitError, t.comments.tooShort, t.comments.validationError]
  );

  const handleDeleteComment = useCallback(
    async (productId: string, commentId: string) => {
      if (!adminToken) {
        setCommentError(t.comments.adminTokenRequired);
        return;
      }

      setCommentError(null);

      let previous: ProductComment[] = [];

      setComments((prev) => {
        previous = prev[productId] ?? [];
        return {
          ...prev,
          [productId]: (prev[productId] ?? []).filter((comment) => comment.id !== commentId)
        };
      });

      try {
        const response = await fetch(`/api/comments/${commentId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? t.comments.deleteFailed);
        }
      } catch (error) {
        setComments((prev) => ({
          ...prev,
          [productId]: [...previous]
        }));
        setCommentError(error instanceof Error ? error.message : t.comments.deleteFailed);
      }
    },
    [adminToken, t.comments.adminTokenRequired, t.comments.deleteFailed]
  );

  const handleReply = useCallback(
    async (productId: string, commentId: string, replyTxt: string) => {
      const trimmedReply = replyTxt.trim();
      if (!trimmedReply) {
        setCommentError(t.comments.emptyReply);
        return;
      }

      if (!adminToken) {
        setCommentError(t.comments.adminTokenRequired);
        return;
      }

      setCommentError(null);

      const optimisticReply: ProductCommentReply = {
        id: `temp-reply-${Date.now()}`,
        author: t.comments.admin,
        text: trimmedReply,
        createdAt: new Date().toISOString(),
        isAdmin: true,
        status: 'pending',
        isOptimistic: true
      };

      setReplyLoading(commentId);

      setComments((prev) => ({
        ...prev,
        [productId]: (prev[productId] ?? []).map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, optimisticReply] }
            : comment
        )
      }));

      try {
        const response = await fetch(`/api/comments/${commentId}/replies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({ text: trimmedReply })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? t.comments.replyFailed);
        }

        setComments((prev) => ({
          ...prev,
          [productId]: (prev[productId] ?? []).map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  replies: comment.replies.map((reply) =>
                    reply.id === optimisticReply.id
                      ? {
                          ...reply,
                          ...data.reply,
                          status: data.reply.status ?? 'approved',
                          isOptimistic: false
                        }
                      : reply
                  )
                }
              : comment
          )
        }));

        setReplyText('');
        setReplyingTo(null);
      } catch (error) {
        setComments((prev) => ({
          ...prev,
          [productId]: (prev[productId] ?? []).map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  replies: comment.replies.filter((reply) => reply.id !== optimisticReply.id)
                }
              : comment
          )
        }));
        setCommentError(error instanceof Error ? error.message : t.comments.replyFailed);
      } finally {
        setReplyLoading(null);
      }
    },
    [adminToken, t.comments.admin, t.comments.adminTokenRequired, t.comments.emptyReply, t.comments.replyFailed]
  );

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    const controller = new AbortController();
    const productId = selectedProduct.id;

    setCommentsLoading(true);
    setCommentsError(null);

    (async () => {
      try {
        const response = await fetch(`/api/comments?productId=${productId}`, {
          signal: controller.signal
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error((data as { error?: string }).error ?? t.comments.loadFailed);
        }

        const apiComments = Array.isArray((data as { comments?: ApiComment[] }).comments)
          ? ((data as { comments: ApiComment[] }).comments)
          : [];

        setComments((prev) => ({
          ...prev,
          [productId]: apiComments.map(mapApiComment)
        }));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setCommentsError(error instanceof Error ? error.message : t.comments.loadFailed);
      } finally {
        if (!controller.signal.aborted) {
          setCommentsLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [mapApiComment, selectedProduct, t.comments.loadFailed]);

  // Styles
  const {
    pageBackground,
    pageText,
    surface: cardBg,
    section: sectionBg,
    hover: hoverBg,
    header: headerBackground
  } = themeClasses;
  const textColor = pageText;
  const primaryPhone = contactConfig.phones[0].value;
  const primaryEmail = contactConfig.emails[0].value;
  const mapUrl = contactConfig.mapUrl;

  // Content
  const categoryIconMap = {
    all: Factory,
    hp: Zap,
    lp: Gauge,
    rigid: Shield,
    custom: Wrench
  } as const;
  const featureIcons = [Shield, Zap, Award, Users];
  const whyUsIcons = [Shield, Zap, Users, Target];
  const headerNavItems = createNavigationItems(t.nav);
  const products = t.products as Product[];

  // Filtered products
  const filteredProducts = useMemo(() => {
    return selectedCategory === 'all'
      ? products
      : products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  const searchedProducts = useMemo(() => {
    return searchTerm === ''
      ? filteredProducts
      : filteredProducts.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.applications.some((app) => app.toLowerCase().includes(searchTerm.toLowerCase()))
        );
  }, [filteredProducts, searchTerm]);

  // Modal Components
  const PriceModal = ({ product, onClose }: { product: Product | null; onClose: () => void }) => {
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
              <p className="text-sm font-bold text-orange-500 mb-2">{t.ui.currentPrice}</p>
              <p className="text-4xl font-black text-orange-600 mb-2">{product.price}</p>
              <p className="text-xs text-gray-500">{t.ui.priceIncludes}</p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-purple-600/10 rounded-xl">
              <p className="text-lg font-bold mb-3">{t.ui.variablePrice}</p>
              <p className="text-sm">{t.ui.variablePriceDescription}</p>
            </div>
          )}

          <div className="space-y-3">
            <a
              href={`tel:${primaryPhone}`}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
            >
              <Phone className="w-5 h-5" />
              {t.ui.call}
            </a>
            <a
              href={`mailto:${primaryEmail}`}
              className={`flex items-center justify-center gap-2 ${cardBg} border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all`}
            >
              <Mail className="w-5 h-5" />
              {t.ui.email}
            </a>
          </div>
        </div>
      </div>
    );
  };

  const ProductDetailModal = ({ product, onClose }: { product: Product | null; onClose: () => void }) => {
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
            aria-label={t.ui.close}
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
              <p className="text-sm font-bold text-orange-600 mb-2">{t.ui.price}</p>
              <p className="text-2xl md:text-3xl font-black text-orange-600">{product.price}</p>
              {!product.hasPrice && (
                <button
                  onClick={() => {
                    setPriceProduct(product);
                    setShowPriceModal(true);
                  }}
                  className="text-sm text-orange-600 font-bold hover:underline mt-2"
                >
                  {t.ui.clickForInfo}
                </button>
              )}
            </div>

            {/* Full Description */}
            <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-black mb-4" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                  {t.ui.description}
                </h3>
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} whitespace-pre-wrap leading-relaxed text-sm md:text-base`}>
                {product.fullDescription}
              </div>
            </div>

            {/* Specs */}
            <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-black mb-4" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
                  {t.ui.specifications}
                </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {Object.entries(product.specs).map(([key, value]) => (
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
                {t.ui.applications}
              </h3>
                <div className="flex flex-wrap gap-3">
                  {product.applications.map((app, i) => (
                    <span key={i} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-full font-bold text-sm">
                      ✓ {app}
                    </span>
                  ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-4 mb-8 flex-col sm:flex-row">
             <a
               href={`tel:${primaryPhone}`}
               className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all"
             >
               <Phone className="w-6 h-6" />
                {t.ui.call}
             </a>
             <a
               href={`mailto:${primaryEmail}`}
               className={`flex-1 flex items-center justify-center gap-2 ${cardBg} border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all`}
             >
               <Mail className="w-6 h-6" />
                {t.ui.email}
             </a>
            </div>
          </div>

          {/* Comments Section */}
          <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-8`}>
            <h3 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-2" style={{ fontFamily: isRTL ? 'Vazirmatn, sans-serif' : 'system-ui' }}>
              <MessageCircle className="w-6 h-6" />
              {t.ui.reviews} ({productComments.length})
            </h3>

            <p className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.comments.moderationNotice}
            </p>

            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-2xl mb-8`}>
              <p className="text-sm font-bold mb-3">{t.comments.adminControls}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="password"
                  value={adminTokenInput}
                  onChange={(e) => setAdminTokenInput(e.target.value)}
                  placeholder={t.comments.tokenPlaceholder}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAdminToken}
                    className={`px-4 py-2 rounded-lg font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-purple-600 hover:scale-105 transition-transform ${
                      adminTokenInput.trim() === '' ? 'opacity-80' : ''
                    }`}
                  >
                    {t.comments.saveToken}
                  </button>
                  {adminToken && (
                    <button
                      type="button"
                      onClick={handleClearAdminToken}
                      className={`px-4 py-2 rounded-lg font-bold text-sm ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'} border border-orange-500/40 hover:border-orange-500`}
                    >
                      {t.comments.clearToken}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {commentsError && (
              <p className="mb-4 text-sm text-red-500">{commentsError}</p>
            )}

            {/* Add Comment Form */}
            <form
              ref={formRef}
              onSubmit={(e) => {
                e.preventDefault();
                void handleAddComment(product.id);
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
                placeholder={t.comments.yourName}
                value={newComment.author}
                onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg mb-3 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                required
              />
              
              <input
                type="email"
                placeholder={t.comments.yourEmail}
                value={newComment.email}
                onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg mb-3 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                required
              />

              <textarea
                placeholder={t.comments.yourComment}
                value={newComment.text}
                onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg mb-4 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none`}
                required
              />

              <button
                type="submit"
                disabled={isSubmittingComment}
                className={`w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  isSubmittingComment ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
                }`}
              >
                <Send className="w-5 h-5" />
                {isSubmittingComment ? t.comments.submitting : t.comments.submit}
              </button>
            </form>

            {commentError && (
              <p className="mb-8 text-sm text-red-500">{commentError}</p>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.comments.loading}
              </p>
            ) : productComments.length === 0 ? (
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.comments.noComments}
              </p>
            ) : (
              <div className="space-y-6">
                {productComments.map((comment) => (
                  <div key={comment.id} className={`p-6 rounded-2xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-lg">{comment.author}</p>
                          {comment.status !== 'approved' && (
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                comment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {t.comments.status[comment.status]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(product.id, comment.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t.comments.delete}
                      </button>
                    </div>

                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
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
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm text-orange-600">{reply.author}</p>
                                {reply.status !== 'approved' && (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                      reply.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {t.comments.status[reply.status]}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">{formatDate(reply.createdAt)}</p>
                            </div>
                            <p className="text-sm mt-1">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo !== comment.id ? (
                      <button
                        type="button"
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-sm text-orange-500 font-bold hover:underline mt-3 flex items-center gap-1"
                      >
                        <Reply className="w-4 h-4" />
                        {t.comments.reply}
                      </button>
                    ) : (
                      <div className="mt-4 space-y-2">
                        <textarea
                          placeholder={t.comments.replyPlaceholder}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          className={`w-full px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-gray-600 text-white' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleReply(product.id, comment.id, replyText)}
                            disabled={replyLoading === comment.id}
                            className={`px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm transition-all ${
                              replyLoading === comment.id ? 'opacity-60 cursor-not-allowed' : 'hover:bg-orange-600'
                            }`}
                          >
                            {replyLoading === comment.id ? t.comments.sendingReply : t.comments.send}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                            className={`px-4 py-2 rounded-lg font-bold text-sm ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-800'}`}
                          >
                            {t.comments.cancel}
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
      className={`min-h-screen ${pageBackground} ${pageText} transition-colors duration-300`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily }}
    >
      <Header
        lang={activeLocale}
        isDark={isDark}
        isRTL={isRTL}
        companyName={t.companyName}
        navItems={headerNavItems}
        activeNavKey="products"
        logoHref="/"
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        hoverClass={hoverBg}
        headerBackgroundClass={headerBackground}
        onLangToggle={toggleLang}
        onThemeToggle={toggleTheme}
        onMobileMenuToggle={toggleMobileMenu}
      />

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
                const Icon = featureIcons[i];
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
                  placeholder={t.ui.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-transparent focus:outline-none ${textColor} text-sm md:text-base`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {t.categories.map((cat) => {
                  const Icon = categoryIconMap[cat.id as keyof typeof categoryIconMap] ?? Factory;
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
              {`${searchedProducts.length} ${t.ui.resultsSuffix}`}
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
                      <p className="text-xs font-bold text-orange-600 mb-0.5">{t.ui.price}</p>
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
                        {t.ui.details}
                      </button>
                      <a
                        href={`tel:${primaryPhone}`}
                        className="w-full text-center border-2 border-orange-500 text-orange-500 px-3 py-2 rounded-lg font-bold hover:scale-105 transition-all text-xs md:text-sm bg-transparent"
                      >
                        {t.ui.call}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {searchedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.ui.noProducts}
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
                {t.whyUs.title}
              </h2>
              <p className="text-lg text-orange-500 font-bold">
                {t.whyUs.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.whyUs.items.map((item, i) => {
                const Icon = whyUsIcons[i];
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
        <CallToAction
          title={t.cta.title}
          subtitle={t.cta.subtitle}
          actions={[
            {
              label: t.ui.call,
              href: `tel:${primaryPhone}`,
              icon: Phone
            },
            {
              label: t.ui.email,
              href: `mailto:${primaryEmail}`,
              icon: Mail,
              variant: 'secondary',
              className: `${cardBg} border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl text-sm md:text-base`
            }
          ]}
          variant="gradient-card"
          layout="centered"
          cardClassName={`${cardBg} p-8 md:p-12 border-2 border-orange-500/30`}
        />

        {/* Contact Info */}
        <section className={`py-16 px-4 ${sectionBg}`}>
          <div className="container mx-auto">
            <ContactInfo
              locale={activeLocale}
              labels={{
                phone: t.ui.phoneLabel,
                email: t.ui.emailLabel,
                address: t.ui.addressLabel
              }}
              variant="cards"
              layout="grid"
              className="max-w-4xl mx-auto"
              itemClassName={`${cardBg}`}
              valueClassName={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              linkClassName="font-bold text-sm md:text-base text-orange-500 hover:text-orange-600"
              showMapLink={false}
              phoneLimit={1}
              emailLimit={1}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-gray-400 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-center gap-6 mb-8">
            <a href={`tel:${primaryPhone}`} className="w-12 h-12 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <Phone className="w-6 h-6" />
            </a>
            <a href={`mailto:${primaryEmail}`} className="w-12 h-12 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110">
              <Mail className="w-6 h-6" />
            </a>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-orange-500/20 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all hover:scale-110"
            >
              <MapPin className="w-6 h-6" />
            </a>
          </div>
          <p className="text-base font-bold text-white mb-1 text-center">
            {t.companyName}
          </p>
          <p className="text-xs text-center">© 2024 - {t.footer.rights}</p>
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
          onClose={() => setShowPriceModal(false)}
        />
      )}
    </div>
  );
}