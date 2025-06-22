
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'create' | 'preview'>('landing');
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    avatar: '',
    links: [] as Array<{id: string, title: string, url: string, icon: string}>
  });
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
      default: return <Link2 className="w-5 h-5" />;
    }
  };

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent mb-6">
              Uganda Bio Connect
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect your business with Uganda. One link, endless possibilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleCreateProfile}
                size="lg" 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Your Bio Link
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300"
              >
                View Examples
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Link2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">Simple Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Create your professional bio link in minutes. No technical skills required.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Instagram className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">Social Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Connect all your social media, website, and business platforms in one place.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Youtube className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">Uganda Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  Built specifically for Ugandan entrepreneurs and small businesses.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-green-600 to-amber-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to grow your business?</h2>
            <p className="text-xl mb-6 opacity-90">Join hundreds of Ugandan entrepreneurs already using Bio Connect</p>
            <Button 
              onClick={handleCreateProfile}
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-semibold"
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Your Bio Link</h1>
            <p className="text-gray-600">Build your professional presence in minutes</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-gray-800">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <Input
                    placeholder="Enter your name or business name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <Input
                    placeholder="Tell people about yourself or your business"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>
              </div>

              {/* Links Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Your Links</h3>
                  <Button onClick={addLink} variant="outline" size="sm">Add Link</Button>
                </div>
                
                {profileData.links.map((link) => (
                  <Card key={link.id} className="p-4 border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <select
                          value={link.icon}
                          onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="link">Link</option>
                          <option value="instagram">Instagram</option>
                          <option value="twitter">Twitter</option>
                          <option value="facebook">Facebook</option>
                          <option value="youtube">YouTube</option>
                        </select>
                        <Input
                          placeholder="Link title"
                          value={link.title}
                          onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                          className="flex-1"
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
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handlePreview}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
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
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-amber-100 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center mb-6">
          <Button 
            onClick={() => setCurrentView('create')}
            variant="outline" 
            className="mb-4"
          >
            ← Edit Profile
          </Button>
        </div>

        {/* Profile Preview */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-amber-600 p-8 text-center text-white">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold">
                {profileData.name.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-2xl font-bold mb-2">{profileData.name}</h1>
              {profileData.bio && (
                <p className="text-white/90 text-sm">{profileData.bio}</p>
              )}
            </div>

            {/* Links */}
            <div className="p-6 space-y-4">
              {profileData.links.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No links added yet</p>
              ) : (
                profileData.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-green-50 hover:to-amber-50 border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      {getIcon(link.icon)}
                      <span className="font-medium text-gray-800">{link.title || 'Untitled Link'}</span>
                    </div>
                  </a>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="text-center p-4 border-t bg-gray-50">
              <Badge variant="outline" className="text-xs">
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
