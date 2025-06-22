import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link2, Instagram, Twitter, Facebook, Youtube, Github, Linkedin, Music, Video, Globe, Camera, Share, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'create' | 'preview'>('landing');
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    avatar: '',
    links: [] as Array<{id: string, title: string, url: string, icon: string}>
  });
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCreateProfile = () => {
    setCurrentView('create');
  };

  const handlePreview = () => {
    if (!profileData.name) {
      toast({
        title: "Please enter your name",
        description: "A name is required to preview your profile",
        variant: "destructive",
      });
      return;
    }
    setCurrentView('preview');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/${profileData.name.toLowerCase().replace(/\s+/g, '-')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileData.name} - Uganda Bio Connect`,
          text: profileData.bio || `Check out ${profileData.name}'s bio link`,
          url: profileUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        toast({
          title: "Link copied!",
          description: "Profile link has been copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "Please copy the link manually",
          variant: "destructive",
        });
      }
    }
  };

  const addLink = () => {
    const newLink = {
      id: Date.now().toString(),
      title: '',
      url: '',
      icon: 'link'
    };
    setProfileData(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
  };

  const updateLink = (id: string, field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      links: prev.links.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeLink = (id: string) => {
    setProfileData(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== id)
    }));
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      case 'github': return <Github className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'soundcloud': return <Music className="w-5 h-5" />;
      case 'tiktok': return <Video className="w-5 h-5" />;
      case 'website': return <Globe className="w-5 h-5" />;
      default: return <Link2 className="w-5 h-5" />;
    }
  };

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-900 to-stone-800">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-200 to-stone-200 bg-clip-text text-transparent mb-6">
              Uganda Bio Connect
            </h1>
            <p className="text-xl md:text-2xl text-stone-300 mb-8 max-w-2xl mx-auto">
              Connect your business, music, or personal brand with Uganda. One link, endless possibilities for entrepreneurs, musicians, influencers & developers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleCreateProfile}
                size="lg" 
                className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Your Bio Link
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-amber-600 text-amber-200 hover:bg-amber-900/30 bg-transparent px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300"
              >
                View Examples
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-stone-700 shadow-lg bg-stone-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Link2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-stone-100">Simple Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-stone-300">
                  Create your professional bio link in minutes. Perfect for businesses, artists, and creators.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-stone-700 shadow-lg bg-stone-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-stone-600 to-stone-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Instagram className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-stone-100">All Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-stone-300">
                  Connect Instagram, GitHub, SoundCloud, LinkedIn, TikTok, and all your digital platforms.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-stone-700 shadow-lg bg-stone-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-700 to-stone-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Youtube className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-stone-100">Uganda Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-stone-300">
                  Built for Ugandan entrepreneurs, musicians, influencers, developers, and creators.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-amber-800 to-stone-700 rounded-2xl p-8 text-white border border-stone-600">
            <h2 className="text-3xl font-bold mb-4">Ready to grow your presence?</h2>
            <p className="text-xl mb-6 opacity-90">Join hundreds of Ugandan creators, entrepreneurs, and professionals already using Bio Connect</p>
            <Button 
              onClick={handleCreateProfile}
              size="lg" 
              className="bg-stone-100 text-stone-900 hover:bg-stone-200 px-8 py-3 rounded-full text-lg font-semibold"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-900 to-stone-800 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-stone-100 mb-2">Create Your Bio Link</h1>
            <p className="text-stone-300">Build your professional presence in minutes</p>
          </div>

          <Card className="shadow-xl border-stone-700 bg-stone-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-stone-100">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image Upload */}
              <div className="text-center">
                <label className="block text-sm font-medium text-stone-200 mb-4">Profile Image</label>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileData.avatar} alt="Profile" />
                    <AvatarFallback className="bg-stone-600 text-stone-200 text-2xl">
                      {profileData.name ? profileData.name.charAt(0).toUpperCase() : <Camera className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      {profileData.avatar ? 'Change Image' : 'Upload Image'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-200 mb-2">Your Name</label>
                  <Input
                    placeholder="Enter your name or business name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-200 mb-2">Bio</label>
                  <Input
                    placeholder="Tell people about yourself or your business"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className="bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* Links Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-stone-100">Your Links</h3>
                  <Button onClick={addLink} variant="outline" size="sm" className="border-amber-600 text-amber-200 hover:bg-amber-900/30">Add Link</Button>
                </div>
                
                {profileData.links.map((link) => (
                  <Card key={link.id} className="p-4 border-stone-600 bg-stone-700/50">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <select
                          value={link.icon}
                          onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                          className="px-3 py-2 border border-stone-600 rounded-md text-sm bg-stone-700 text-stone-100"
                        >
                          <option value="link">General Link</option>
                          <option value="website">Website</option>
                          <option value="instagram">Instagram</option>
                          <option value="twitter">Twitter</option>
                          <option value="facebook">Facebook</option>
                          <option value="youtube">YouTube</option>
                          <option value="tiktok">TikTok</option>
                          <option value="github">GitHub</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="soundcloud">SoundCloud</option>
                        </select>
                        <Input
                          placeholder="Link title"
                          value={link.title}
                          onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                          className="flex-1 bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                          className="flex-1 bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400"
                        />
                        <Button 
                          onClick={() => removeLink(link.id)}
                          variant="destructive" 
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button 
                  onClick={() => setCurrentView('landing')}
                  variant="outline" 
                  className="flex-1 border-stone-600 text-stone-200 hover:bg-stone-700"
                >
                  Back
                </Button>
                <Button 
                  onClick={handlePreview}
                  className="flex-1 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900"
                >
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Preview View
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-900 to-stone-800 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center mb-6">
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => setCurrentView('create')}
              variant="outline" 
              className="border-amber-600 text-amber-200 hover:bg-amber-900/30"
            >
              ← Edit Profile
            </Button>
            <Button 
              onClick={handleShare}
              variant="outline" 
              className="border-amber-600 text-amber-200 hover:bg-amber-900/30 flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share'}
            </Button>
          </div>
        </div>

        {/* Profile Preview */}
        <Card className="shadow-2xl border-stone-700 bg-stone-800/95 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-800 to-stone-700 p-8 text-center text-white">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-stone-400">
                <AvatarImage src={profileData.avatar} alt={profileData.name} />
                <AvatarFallback className="bg-stone-600/40 text-4xl font-bold text-white">
                  {profileData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold mb-2">{profileData.name}</h1>
              {profileData.bio && (
                <p className="text-stone-200 text-sm">{profileData.bio}</p>
              )}
            </div>

            {/* Links */}
            <div className="p-6 space-y-4">
              {profileData.links.length === 0 ? (
                <p className="text-center text-stone-400 py-8">No links added yet</p>
              ) : (
                profileData.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-4 bg-gradient-to-r from-stone-700 to-stone-600 hover:from-amber-800 hover:to-stone-700 border border-stone-600 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-amber-200">
                        {getIcon(link.icon)}
                      </div>
                      <span className="font-medium text-stone-100">{link.title || 'Untitled Link'}</span>
                    </div>
                  </a>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="text-center p-4 border-t border-stone-600 bg-stone-700/50">
              <Badge variant="outline" className="text-xs border-amber-600 text-amber-200">
                Powered by Uganda Bio Connect
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
