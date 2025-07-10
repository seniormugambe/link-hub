import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { Link2, Instagram, Twitter, Facebook, Youtube, Share2, ArrowLeft } from "lucide-react";
import ShareButton from "@/components/ShareButton";

interface ProfileData {
  name: string;
  bio: string;
  avatar: string;
  links: Array<{id: string, title: string, url: string, icon: string}>;
  catalogue?: Array<{
    title: string;
    image: string;
    description: string;
    price?: string;
    link?: string;
  }>;
}

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading profile data
    // In a real app, this would fetch from your backend
    setTimeout(() => {
      const mockProfile: ProfileData = {
        name: username?.replace(/-/g, ' ') || "John Doe",
        bio: "Welcome to my bio link! Connect with me on social media.",
        avatar: "",
        links: [
          {
            id: "1",
            title: "Instagram",
            url: "https://instagram.com",
            icon: "instagram"
          },
          {
            id: "2", 
            title: "Twitter",
            url: "https://twitter.com",
            icon: "twitter"
          },
          {
            id: "3",
            title: "Website",
            url: "https://example.com",
            icon: "link"
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
          }
        ]
      };
      setProfileData(mockProfile);
      setIsLoading(false);
    }, 1000);
  }, [username]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      default: return <Link2 className="w-5 h-5" />;
    }
  };

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-900 to-stone-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-stone-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-900 to-stone-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-100 mb-4">Profile Not Found</h1>
          <p className="text-stone-300 mb-6">This profile doesn't exist or has been removed.</p>
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
        background: '#1e293b', // Default theme background
        fontFamily: 'sans-serif', // Default font
        color: '#f59e42', // Default primary color
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
            profileName={profileData.name}
            variant="ghost"
            size="sm"
            className="text-amber-200 hover:bg-amber-900/30"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </ShareButton>
        </div>
      </nav>

      {/* Profile Content */}
      <div className="w-full max-w-md mt-24 mb-8">
        <Card className="shadow-2xl border-stone-700 bg-stone-800/95 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-800 to-stone-700 p-8 text-center text-white">
              <div className="flex flex-col items-center gap-2">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Avatar" className="w-24 h-24 object-cover rounded-full border-2 border-stone-400 mb-2" />
                ) : (
                  <div className="w-24 h-24 bg-stone-600/40 rounded-full flex items-center justify-center text-4xl font-bold border-2 border-stone-400 mb-2">
                    {profileData.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h1 className="text-2xl font-bold mb-1" style={{ color: '#f59e42' }}>{profileData.name}</h1>
                {profileData.bio && (
                  <p className="text-stone-100 text-base mb-2">{profileData.bio}</p>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="p-6 space-y-3">
              {profileData.links.map((link) => (
                <Button
                  key={link.id}
                  onClick={() => handleLinkClick(link.url)}
                  variant="outline"
                  className="w-full justify-start border-stone-600 text-stone-200 hover:bg-stone-700 hover:text-white transition-all duration-200 flex items-center gap-3"
                >
                  {getIcon(link.icon)}
                  <span className="ml-3 font-semibold">{link.title}</span>
                </Button>
              ))}
            </div>

            {/* Catalogue Section */}
            {profileData.catalogue && profileData.catalogue.length > 0 && (
              <div className="p-6 pt-0">
                <h3 className="text-lg font-bold mb-4" style={{ color: '#f59e42' }}>Catalogue</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData.catalogue.map((item, idx) => (
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
                            View Item
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile; 