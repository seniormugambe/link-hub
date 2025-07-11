import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Link2, Instagram, Twitter, Facebook, Youtube, Share2, ArrowLeft, ExternalLink, Heart, MessageCircle, Calendar } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import { supabase } from "../lib/supabaseClient";
import { useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface InviteData {
  id: string;
  title: string;
  description: string;
  hostName: string;
  hostAvatar: string;
  hostBio: string;
  links: Array<{id: string, title: string, url: string, icon: string, description?: string}>;
  catalogue?: Array<{
    title: string;
    image: string;
    description: string;
    price?: string;
    link?: string;
  }>;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    font?: string;
    logo?: string;
  };
  createdAt: string;
  expiresAt?: string;
  user_id: string; // Added for analytics
}

function getDeviceType() {
  if (typeof window === 'undefined') return '';
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  return 'desktop';
}
function getBrowserOS() {
  if (typeof window === 'undefined') return '';
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') > -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) browser = 'IE';
  let os = 'Unknown';
  if (ua.indexOf('Win') > -1) os = 'Windows';
  else if (ua.indexOf('Mac') > -1) os = 'MacOS';
  else if (ua.indexOf('Linux') > -1) os = 'Linux';
  else if (ua.indexOf('Android') > -1) os = 'Android';
  else if (ua.indexOf('like Mac') > -1) os = 'iOS';
  return `${browser} on ${os}`;
}
async function logInviteAnalytics({ inviteId, type, location, browserOS }) {
  await supabase.from('invitation_analytics').insert([
    {
      invite_id: inviteId,
      type,
      device: getDeviceType(),
      location: location || '',
      referral: document.referrer || '',
      browser_os: browserOS || '',
    }
  ]);
}

const InviteView = () => {
  const { inviteId } = useParams<{ inviteId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geoLocation, setGeoLocation] = useState('');
  const [browserOS, setBrowserOS] = useState('');
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState([]);

  // Mock data for demonstration - in a real app, this would come from an API
  useEffect(() => {
    // Fetch geolocation
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setGeoLocation(data.city && data.country_name ? `${data.city}, ${data.country_name}` : data.country_name || '');
      })
      .catch(() => setGeoLocation(''));
    setBrowserOS(getBrowserOS());

    const fetchInviteData = async () => {
      try {
        setLoading(true);
        if (!inviteId) {
          setError("No invitation ID provided.");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .eq('id', inviteId)
          .single();
        if (error || !data) {
          setError("Invitation not found.");
          setLoading(false);
          return;
        }
        // Map Supabase data to InviteData
        setInviteData({
          id: data.id,
          title: data.title,
          description: data.description,
          hostName: data.host_name || '',
          hostAvatar: data.host_avatar || '',
          hostBio: data.host_bio || '',
          links: data.links || [],
          catalogue: data.catalogue || [],
          theme: data.theme || {},
          createdAt: data.created_at,
          expiresAt: data.expires_at,
          user_id: data.user_id, // Ensure user_id is mapped
        });
      } catch (err) {
        setError("Failed to load invitation. Please check the link and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInviteData();
    // Log a view event if inviteId exists
    if (inviteId) {
      logInviteAnalytics({ inviteId, type: 'view', location: geoLocation, browserOS });
      // Fetch analytics for this invite
      supabase
        .from('invitation_analytics')
        .select('id, type')
        .eq('invite_id', inviteId)
        .then(({ data }) => setAnalytics(data || []));
    }
  }, [inviteId]);

  const handleLinkClick = (url: string, title: string) => {
    // Track link click analytics here
    if (inviteId) {
      logInviteAnalytics({ inviteId, type: 'click', location: geoLocation, browserOS });
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      default: return <Link2 className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpired = inviteData?.expiresAt ? new Date(inviteData.expiresAt) < new Date() : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-900 to-stone-800 flex items-center justify-center">
        <div className="w-full max-w-xl mx-auto p-6">
          {/* Main card skeleton */}
          <div className="bg-stone-800 rounded-lg shadow p-8 mb-8 animate-pulse">
            <div className="h-8 w-1/2 bg-stone-700 rounded mb-4"></div>
            <div className="h-4 w-1/3 bg-stone-700 rounded mb-6"></div>
            <div className="h-16 w-full bg-stone-700 rounded mb-6"></div>
            <div className="flex gap-4 mb-4">
              <div className="h-10 w-24 bg-stone-700 rounded"></div>
              <div className="h-10 w-24 bg-stone-700 rounded"></div>
            </div>
          </div>
          {/* Catalogue skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[0,1].map(i => (
              <div key={i} className="bg-stone-800 rounded-lg p-6 flex flex-col items-center shadow animate-pulse">
                <div className="w-full h-40 bg-stone-700 rounded mb-4"></div>
                <div className="h-6 w-1/2 bg-stone-700 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-stone-700 rounded mb-2"></div>
                <div className="h-4 w-1/3 bg-stone-700 rounded mb-2"></div>
                <div className="h-4 w-1/4 bg-stone-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-900 to-stone-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-stone-100 mb-4">Invitation Not Found</h1>
          <p className="text-stone-300 mb-6">{error || "This invitation link is invalid or has expired."}</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-2"
      style={{
        background: inviteData.theme?.backgroundColor || '#1e293b',
        fontFamily: inviteData.theme?.font || 'sans-serif',
        color: inviteData.theme?.primaryColor || '#f59e42',
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')} 
            className="text-amber-200 hover:bg-amber-900/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <ShareButton
            profileUrl={window.location.href}
            profileName={inviteData.title}
            variant="ghost"
            size="sm"
            className="text-amber-200 hover:bg-amber-900/30"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </ShareButton>
        </div>
      </nav>

      {/* Analytics summary for owner */}
      {user && inviteData && inviteData.user_id === user.id && (
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardContent className="flex flex-col sm:flex-row gap-6 items-center justify-between py-6">
            <div className="text-lg font-bold text-slate-100">Analytics Summary</div>
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{analytics.filter(a => a.type === 'view').length}</div>
                <div className="text-slate-300 text-sm">Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{analytics.filter(a => a.type === 'click').length}</div>
                <div className="text-slate-300 text-sm">Clicks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Card */}
      <div className="w-full max-w-2xl mt-24 mb-8">
        <Card className="shadow-2xl border-stone-700 bg-stone-800/95 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-800 to-stone-700 p-8 text-center text-white">
              <div className="flex flex-col items-center gap-2">
                {inviteData.theme?.logo ? (
                  <img src={inviteData.theme.logo} alt="Logo" className="w-20 h-20 object-contain rounded-full border-2 border-stone-400 mb-2" />
                ) : (
                  <div className="w-20 h-20 bg-stone-600/40 rounded-full flex items-center justify-center text-4xl font-bold border-2 border-stone-400 mb-2">
                    {inviteData.hostName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <h1 className="text-2xl font-bold mb-1" style={{ color: inviteData.theme?.primaryColor || undefined }}>{inviteData.title}</h1>
                <div className="text-stone-200 text-sm mb-2">by {inviteData.hostName}</div>
                {inviteData.description && (
                  <p className="text-stone-100 text-base mb-2">{inviteData.description}</p>
                )}
                {inviteData.hostBio && (
                  <p className="text-stone-300 text-xs italic mb-2">{inviteData.hostBio}</p>
                )}
                {isExpired && (
                  <Badge variant="secondary" className="bg-red-900/30 text-red-200 border-red-600">Expired</Badge>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="p-6 space-y-3">
              {inviteData.links.map((link) => (
                <Button
                  key={link.id}
                  onClick={() => handleLinkClick(link.url, link.title)}
                  variant="outline"
                  className="w-full justify-start border-stone-600 text-stone-200 hover:bg-stone-700 hover:text-white transition-all duration-200 flex items-center gap-3"
                  style={{ fontFamily: inviteData.theme?.font || undefined }}
                >
                  {getIcon(link.icon)}
                  <span className="ml-1 font-semibold">{link.title}</span>
                  {link.description && <span className="ml-2 text-xs text-stone-400">{link.description}</span>}
                  <ExternalLink className="ml-auto w-4 h-4 opacity-60" />
                </Button>
              ))}
            </div>

            {/* Catalogue */}
            {inviteData.catalogue && inviteData.catalogue.length > 0 && (
              <div className="mt-8 w-full max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-slate-100 mb-4">Catalogue</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {inviteData.catalogue.map((item, idx) => (
                    <div key={idx} className="bg-stone-800 rounded-lg p-6 flex flex-col items-center shadow">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-40 object-cover rounded mb-4"
                        onError={e => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                      />
                      <div className="font-bold text-slate-100 text-lg mb-2 text-center">{item.title}</div>
                      <div className="text-slate-300 text-sm mb-2 text-center">{item.description}</div>
                      {item.price && <div className="text-amber-400 font-semibold mb-2">{item.price}</div>}
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline text-sm mt-1">
                          View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-6 pt-0 text-center">
              <Badge variant="secondary" className="bg-amber-900/30 text-amber-200 border-amber-600">
                Powered by Uganda Bio Connect
              </Badge>
              <div className="text-xs text-stone-400 mt-2">Created: {formatDate(inviteData.createdAt)}</div>
              {inviteData.expiresAt && <div className="text-xs text-stone-400">Expires: {formatDate(inviteData.expiresAt)}</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteView; 