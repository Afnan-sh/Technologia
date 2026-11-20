'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Store, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Phone, 
  Plus, 
  X, 
  ChevronRight,
  ShoppingBag,
  Target,
  Sparkles,
  Calendar,
  ThumbsUp
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPKR, formatRelativeTime } from '@/lib/utils';
import ListingCard from '@/components/ListingCard';
import PartRequestCard from '@/components/PartRequestCard';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'reviews'>('listings');

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [itemAsDescribed, setItemAsDescribed] = useState<boolean>(true);
  const [communicationRating, setCommunicationRating] = useState<number>(5);
  const [undisclosedFaults, setUndisclosedFaults] = useState<boolean>(false);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string>('');

  const loadProfile = async () => {
    try {
      const res = await fetch(`/api/users/${profileId}`);
      const data = await res.json();
      if (data.success && data.user) {
        setProfile(data.user);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in first to submit a review.');
      return;
    }
    setSubmittingReview(true);
    setReviewError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revieweeId: profileId,
          listingId: selectedListingId || null,
          itemAsDescribed,
          communicationRating,
          undisclosedFaults,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReviewModalOpen(false);
        setReviewComment('');
        loadProfile();
      } else {
        setReviewError(data.error || 'Failed to submit review');
      }
    } catch (err: any) {
      setReviewError(err.message || 'Network error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading user profile and reputation records...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">User Profile Not Found</h2>
        <p className="text-xs text-slate-500">The requested profile does not exist or has been removed.</p>
        <Link href="/home" className="text-xs font-semibold text-blue-600 hover:underline inline-block mt-2">
          &larr; Return to Marketplace
        </Link>
      </div>
    );
  }

  const isVerifiedShop = profile.isVerifiedShop || profile.role === 'SHOPKEEPER';
  const stats = profile.stats || {};
  const isSelf = currentUser?.id === profile.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Profile Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle top amber border highlight for verified shopkeepers */}
        {isVerifiedShop && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900" />
        )}

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Left: Avatar & Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-100 border-2 border-gray-200 overflow-hidden shadow-2xs">
                <img
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {isVerifiedShop && (
                <div 
                  title="Verified Shopkeeper"
                  className="absolute -bottom-2 -right-2 p-1.5 bg-amber-800 text-white rounded-xl shadow-xs border-2 border-white"
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                  {isVerifiedShop && profile.shopName ? profile.shopName : profile.name}
                </h1>

                {/* Tier Badge */}
                {isVerifiedShop ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                    <span>Verified Shop</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <span>Enthusiast Member</span>
                  </span>
                )}
              </div>

              {isVerifiedShop && profile.shopName && (
                <p className="text-xs font-semibold text-slate-600">
                  Proprietor: <span className="text-slate-800 font-bold">{profile.name}</span>
                </p>
              )}

              {/* Physical Shop Address & Business Hours */}
              {isVerifiedShop && (
                <div className="space-y-1 pt-1 text-xs text-slate-600">
                  {profile.shopAddress && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-800 flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-800">{profile.shopAddress}</span>
                    </div>
                  )}

                  {profile.businessHours && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{profile.businessHours}</span>
                    </div>
                  )}
                </div>
              )}

              {!isVerifiedShop && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.city || 'Pakistan'}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {formatRelativeTime(profile.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Aggregated Trust Score Box & Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 flex-shrink-0">
            {/* Trust Score Card */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-center min-w-[200px] shadow-2xs">
              <div className="flex items-center justify-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {stats.trustScore}%
                </span>
                <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                  Trust
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Based on <strong className="text-slate-800">{stats.reviewCount} verified review{stats.reviewCount === 1 ? '' : 's'}</strong>
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {profile.whatsappNumber && (
                <WhatsAppButton
                  phone={profile.whatsappNumber}
                  adTitle={`Inquiry to ${profile.shopName || profile.name}`}
                  variant="sm"
                />
              )}

              {!isSelf && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors btn-tactile flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Leave Review</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reputation Criteria Breakdown Bar */}
        <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-gray-50/70 border border-gray-200/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              🎯
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Item as Described
              </span>
              <span className="text-xs font-extrabold text-slate-800">
                {stats.itemAsDescribedPct}% Matched
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50/70 border border-gray-200/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              ⏱️
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Punctuality & Comm
              </span>
              <span className="text-xs font-extrabold text-slate-800">
                {stats.avgCommunication} / 5.0 Rating
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50/70 border border-gray-200/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              🛡️
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Clean Fault Disclosure
              </span>
              <span className="text-xs font-extrabold text-slate-800">
                {stats.cleanFaultsPct}% Zero Hidden Faults
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-gray-200 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-xs font-bold transition-colors relative flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Active Listings ({profile.listings?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 text-xs font-bold transition-colors relative flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Sourcing Requests ({profile.requests?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 text-xs font-bold transition-colors relative flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Verified Reviews ({profile.reviewsReceived?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {profile.listings && profile.listings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {profile.listings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-gray-50/50 rounded-3xl border border-gray-200 text-xs text-slate-400">
              No active listings currently posted by this user.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {profile.requests && profile.requests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.requests.map((req: any) => (
                <PartRequestCard key={req.id} request={req} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-gray-50/50 rounded-3xl border border-gray-200 text-xs text-slate-400">
              No active sourcing requests posted by this user.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VERIFIED REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {profile.reviewsReceived && profile.reviewsReceived.length > 0 ? (
            <div className="space-y-3">
              {profile.reviewsReceived.map((rev: any) => (
                <div 
                  key={rev.id} 
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-blue-700">
                        {rev.reviewer?.name?.slice(0, 2).toUpperCase() || 'TR'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">
                            {rev.reviewer?.name || 'Verified Buyer'}
                          </h4>
                          {rev.reviewer?.isVerifiedShop && (
                            <span className="text-[10px] bg-amber-50 text-amber-900 px-1.5 py-0.2 rounded font-bold border border-amber-200">
                              Shop
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatRelativeTime(rev.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-xs font-extrabold text-amber-950 font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{rev.communicationRating}.0 / 5.0</span>
                    </div>
                  </div>

                  {/* Criteria Tags */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border ${
                      rev.itemAsDescribed 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Item as described: {rev.itemAsDescribed ? 'Yes' : 'No'}</span>
                    </span>

                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border ${
                      !rev.undisclosedFaults 
                        ? 'bg-blue-50 text-blue-800 border-blue-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      <span>Undisclosed faults: {rev.undisclosedFaults ? 'Faults Found' : 'None (Clean)'}</span>
                    </span>
                  </div>

                  {/* Review Text */}
                  {rev.comment && (
                    <p className="text-xs text-slate-700 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  )}

                  {/* Related Listing */}
                  {rev.listing && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>Item:</span>
                      <Link href={`/listings/${rev.listing.id}`} className="text-blue-600 hover:underline font-semibold">
                        {rev.listing.title || `${rev.listing.brand} ${rev.listing.model}`}
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-gray-50/50 rounded-3xl border border-gray-200 text-xs text-slate-400">
              No reviews have been left for this user yet. Be the first to leave one!
            </div>
          )}
        </div>
      )}

      {/* LEAVE A REVIEW MODAL */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-modal-pop">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Leave a Verified Review
                </h3>
                <p className="text-xs text-slate-500">
                  Reviewing <strong className="text-slate-800">{profile.shopName || profile.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Optional: Related Listing Selector */}
              {profile.listings && profile.listings.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Related Item (Optional)
                  </label>
                  <select
                    value={selectedListingId}
                    onChange={(e) => setSelectedListingId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">General seller / shop review</option>
                    {profile.listings.map((l: any) => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({formatPKR(l.price)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Criterion 1: Item as Described? (Yes/No) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. Was the item exactly as described?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setItemAsDescribed(true)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      itemAsDescribed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300'
                        : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    ✓ Yes (Accurate)
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemAsDescribed(false)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      !itemAsDescribed
                        ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-300'
                        : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    ✗ No (Discrepancy)
                  </button>
                </div>
              </div>

              {/* Criterion 2: Communication & Punctuality (1-5 Scale) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    2. Communication & Punctuality (1-5 scale)
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-600">
                    {communicationRating} of 5 Stars
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1 p-2 bg-gray-50 rounded-xl border border-gray-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCommunicationRating(star)}
                      className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          star <= communicationRating 
                            ? 'fill-amber-500 text-amber-500' 
                            : 'text-slate-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Criterion 3: Undisclosed Faults? (Yes/No) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  3. Were there any undisclosed faults?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUndisclosedFaults(false)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      !undisclosedFaults
                        ? 'bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-300'
                        : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    🛡️ No (Clean Inspection)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUndisclosedFaults(true)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      undisclosedFaults
                        ? 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-300'
                        : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    ⚠️ Yes (Hidden Faults Found)
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Comments & Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of the meetup, testing at Hafeez Centre/Saddar, or device condition..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-slate-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 btn-tactile"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
