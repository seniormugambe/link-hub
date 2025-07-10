import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Link2, Instagram, Twitter, Facebook, Youtube, Share2, ArrowLeft, ExternalLink, Heart, MessageCircle, Calendar } from "lucide-react";
import ShareButton from "@/components/ShareButton";

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
}

const InviteView = () => {
  const { inviteId } = useParams<{ inviteId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration - in a real app, this would come from an API
  useEffect(() => {
    const fetchInviteData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - replace with actual API call
        const mockData: InviteData = {
          id: inviteId || 'demo-invite',
          title: "Welcome to Our Special Collection",
          description: "Curated links and resources just for you. Explore what we've prepared!",
          hostName: "Sarah Johnson",
          hostAvatar: "",
          hostBio: "Digital creator and community builder passionate about connecting people through meaningful content.",
          links: [
            {
              id: "1",
              title: "Exclusive Content",
              url: "https://example.com/exclusive",
              icon: "link",
              description: "Access to premium content and resources"
            },
            {
              id: "2", 
              title: "Join Our Community",
              url: "https://example.com/community",
              icon: "instagram",
              description: "Connect with like-minded individuals"
            },
            {
              id: "3",
              title: "Special Offer",
              url: "https://example.com/offer", 
              icon: "link",
              description: "Limited time discount just for you"
            },
            {
              id: "4",
              title: "Feedback Survey",
              url: "https://example.com/survey",
              icon: "link", 
              description: "Help us improve by sharing your thoughts"
            }
          ],
          catalogue: [
            {
              title: "Premium Digital Art",
              image: "https://via.placeholder.com/150",
              description: "Exclusive collection of digital artworks by renowned artists.",
              price: "$1,200",
              link: "https://example.com/art"
            },
            {
              title: "Eco-Friendly Sustainable Products",
              image: "https://via.placeholder.com/150",
              description: "Explore a range of eco-friendly products for a sustainable lifestyle.",
              price: "$50 - $200",
              link: "https://example.com/sustainable"
            },
            {
              title: "Virtual Reality Experience",
              image: "https://via.placeholder.com/150",
              description: "Step into a new world with our immersive VR experience.",
              price: "$15",
              link: "https://example.com/vr"
            }
          ],
          theme: {
            primaryColor: "amber",
            backgroundColor: "stone"
          },
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        };
        
        setInviteData(mockData);
      } catch (err) {
        setError("Failed to load invitation. Please check the link and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInviteData();
  }, [inviteId]);

  const handleLinkClick = (url: string, title: string) => {
    // Track link click analytics here
    console.log(`Link clicked: ${title} -> ${url}`);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-200 mx-auto mb-4"></div>
          <p className="text-stone-300">Loading your invitation...</p>
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
              <div className="p-6 pt-0">
                <h3 className="text-lg font-bold mb-4" style={{ color: inviteData.theme?.primaryColor || undefined }}>Catalogue</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inviteData.catalogue.map((item, idx) => (
                    <div key={idx} className="bg-stone-700/80 rounded-lg p-4 flex flex-col gap-2 shadow border border-stone-600">
                      <div className="flex items-center gap-3 mb-2">
                        {item.image && <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded border border-stone-600" />}
                        <div>
                          <div className="font-semibold text-stone-100 text-base">{item.title}</div>
                          {item.price && <div className="text-amber-300 font-bold text-sm">{item.price}</div>}
                        </div>
                      </div>
                      <div className="text-stone-300 text-sm mb-2">{item.description}</div>
                      {item.link && (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-amber-400 text-amber-200 hover:bg-amber-900/30 mt-2"
                        >
                          <a href={item.link} target="_blank" rel="noopener noreferrer">
                            View Item <ExternalLink className="inline w-4 h-4 ml-1" />
                          </a>
                        </Button>
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