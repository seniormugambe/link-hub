import React, { useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Camera,
  Plus,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Github,
  Music,
  Globe,
  ExternalLink,
  Eye,
  Share2,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState<
    { title: string; url: string; icon: string }[]
  >([]);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentIcon, setCurrentIcon] = useState('link');
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLink = useCallback(() => {
    if (currentTitle && currentUrl) {
      setLinks([...links, { title: currentTitle, url: currentUrl, icon: currentIcon }]);
      setCurrentTitle('');
      setCurrentUrl('');
      setCurrentIcon('link');
    }
  }, [currentTitle, currentUrl, currentIcon, links]);

  const removeLink = useCallback((index: number) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    setLinks(newLinks);
  }, [links]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'instagram':
        return <Instagram className="w-6 h-6 text-pink-500" />;
      case 'twitter':
        return <Twitter className="w-6 h-6 text-blue-400" />;
      case 'youtube':
        return <Youtube className="w-6 h-6 text-red-500" />;
      case 'linkedin':
        return <Linkedin className="w-6 h-6 text-blue-600" />;
      case 'github':
        return <Github className="w-6 h-6 text-gray-800" />;
      case 'music':
        return <Music className="w-6 h-6 text-purple-500" />;
      case 'globe':
        return <Globe className="w-6 h-6 text-green-500" />;
      case 'link':
      default:
        return <LinkIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const handleShare = () => {
    const profileData = {
      name,
      bio,
      links,
      profileImage,
    };
  
    const profileDataString = JSON.stringify(profileData);
    const encodedProfileData = btoa(profileDataString);
    const shareableLink = `${window.location.origin}/?profile=${encodedProfileData}`;
  
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        toast({
          title: "Link copied to clipboard!",
          description: "Share this link to show your profile.",
        })
      })
      .catch(err => {
        toast({
          title: "Failed to copy link",
          description: "Please try again.",
        })
        console.error('Could not copy text: ', err);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-gray-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-gray-700 to-pink-500 bg-clip-text text-transparent mb-4">
            LinkTree Uganda
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create your professional link hub for musicians, influencers, and developers. 
            Share all your platforms in one beautiful place.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Builder Section */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <User className="text-pink-600" />
                Build Your Link Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image Upload */}
              <div className="text-center">
                <div className="relative inline-block">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-pink-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-300 to-gray-300 flex items-center justify-center border-4 border-pink-300">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-pink-600 text-white p-2 rounded-full cursor-pointer hover:bg-pink-700 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name or brand"
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                />
              </div>

              {/* Bio Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people about yourself..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all resize-none"
                />
              </div>

              {/* Add Link Section */}
              <div className="border-2 border-dashed border-pink-300 rounded-lg p-4 bg-pink-50/50">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Plus className="text-pink-600" />
                  Add New Link
                </h3>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    placeholder="Link title"
                    className="w-full px-4 py-2 border-2 border-pink-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  />
                  
                  <input
                    type="url"
                    value={currentUrl}
                    onChange={(e) => setCurrentUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border-2 border-pink-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  />
                  
                  {/* Icon Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose Platform
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: 'instagram', icon: Instagram, color: 'text-pink-500' },
                        { name: 'twitter', icon: Twitter, color: 'text-blue-400' },
                        { name: 'youtube', icon: Youtube, color: 'text-red-500' },
                        { name: 'linkedin', icon: Linkedin, color: 'text-blue-600' },
                        { name: 'github', icon: Github, color: 'text-gray-800' },
                        { name: 'music', icon: Music, color: 'text-purple-500' },
                        { name: 'globe', icon: Globe, color: 'text-green-500' },
                        { name: 'link', icon: ExternalLink, color: 'text-gray-600' },
                      ].map((platform) => (
                        <button
                          key={platform.name}
                          onClick={() => setCurrentIcon(platform.name)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            currentIcon === platform.name
                              ? 'border-pink-500 bg-pink-100'
                              : 'border-gray-200 hover:border-pink-300'
                          }`}
                        >
                          <platform.icon className={`w-6 h-6 ${platform.color}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={addLink} 
                    className="w-full bg-gradient-to-r from-pink-600 to-gray-600 hover:from-pink-700 hover:to-gray-700 text-white font-semibold py-3"
                    disabled={!currentTitle || !currentUrl}
                  >
                    Add Link
                  </Button>
                </div>
              </div>

              {/* Links List */}
              {links.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Your Links</h3>
                  <div className="space-y-2">
                    {links.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          {getIcon(link.icon)}
                          <div>
                            <p className="font-medium text-gray-800">{link.title}</p>
                            <p className="text-sm text-gray-500 truncate max-w-48">{link.url}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLink(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="p-6 bg-gradient-to-br from-pink-100 to-gray-100 border-pink-200 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Eye className="text-pink-600" />
                  Preview
                </CardTitle>
                {(name || bio || links.length > 0) && (
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="sm"
                    className="border-pink-300 text-pink-700 hover:bg-pink-50"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-pink-200">
                <div className="bg-gradient-to-r from-pink-500 to-gray-500 p-6 text-center">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center border-4 border-white">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-white mb-2">
                    {name || 'Your Name'}
                  </h2>
                  <p className="text-pink-100 text-sm">
                    {bio || 'Your bio will appear here...'}
                  </p>
                </div>
                
                <div className="p-6 space-y-3">
                  {links.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Add links to see them here
                    </p>
                  ) : (
                    links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-50 to-gray-50 rounded-xl border border-pink-200 hover:from-pink-100 hover:to-gray-100 transition-all duration-200 hover:scale-105 hover:shadow-md"
                      >
                        {getIcon(link.icon)}
                        <span className="font-medium text-gray-800">{link.title}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                      </a>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
