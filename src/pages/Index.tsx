
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Instagram, Twitter, Facebook, Youtube, User, LogOut, Share2, Lock, Upload, X, ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ShareButton from "@/components/ShareButton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'create-profile' | 'create-invite' | 'preview-invite'>('landing');
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    bio: '',
    avatar: '',
    links: [] as Array<{id: string, title: string, url: string, icon: string}>
  });
  const [inviteData, setInviteData] = useState({
    title: '',
    description: '',
    image: '',
    host: {
      name: '',
      bio: '',
      image: ''
    },
    links: [] as Array<{id: string, title: string, url: string, icon: string, description?: string}>
  });
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Example: Feature gating for premium features
  const isPremium = user?.premium;

  // For Create Bio Link button:
  const handleCreateProfile = () => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/auth';
    }
  };

  // For Create Invitation button:
  const handleCreateInvitation = () => {
    if (isAuthenticated) {
      setCurrentView('create-invite');
    } else {
      window.location.href = '/auth';
    }
  };

  // For Get Started button:
  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/auth';
    }
  };

  const handleSaveProfile = () => {
    if (!profileData.name) {
      toast({
        title: "Please enter your name",
        description: "A name is required to save your profile",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you would save to database here
    toast({
      title: "Profile saved!",
      description: "Your profile has been created successfully",
    });
    
    // Generate and copy profile URL
    const profileUrl = `${window.location.origin}/profile/${profileData.name.toLowerCase().replace(/\s+/g, '-')}`;
    navigator.clipboard.writeText(profileUrl);
    
    toast({
      title: "Profile URL copied!",
      description: "Your profile link has been copied to clipboard",
    });
  };

  const handlePreview = () => {
    if (!profileData.name) {
      toast({
        title: "Please enter your name",
        description: "A name is required to save your profile",
        variant: "destructive",
      });
      return;
    }
    handleSaveProfile();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
        toast({
          title: "Image uploaded!",
          description: "Your profile image has been updated",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileData(prev => ({
      ...prev,
      avatar: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Image removed",
      description: "Profile image has been removed",
    });
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
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

  // Invitation functions
  const handleCreateInvite = () => {
    if (isAuthenticated) {
      setCurrentView('create-invite');
    } else {
      // Redirect to auth page or show login prompt
      window.location.href = '/auth';
    }
  };

  const handlePreviewInvite = () => {
    if (!inviteData.title || !inviteData.host.name) {
      toast({
        title: "Missing information",
        description: "Please enter a title and your name to preview the invitation",
        variant: "destructive",
      });
      return;
    }
    setCurrentView('preview-invite');
  };

  const handleInviteImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setInviteData(prev => ({
          ...prev,
          image: e.target?.result as string
        }));
        toast({
          title: "Image uploaded!",
          description: "Your invitation image has been updated",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHostImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setInviteData(prev => ({
          ...prev,
          host: { ...prev.host, image: e.target?.result as string }
        }));
        toast({
          title: "Image uploaded!",
          description: "Your host image has been updated",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveInvite = () => {
    if (!inviteData.title || !inviteData.host.name) {
      toast({
        title: "Missing information",
        description: "Please enter a title and host name",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Invitation created!",
      description: "Your invitation has been created successfully",
    });
    
    const inviteUrl = `${window.location.origin}/invite/${generateInviteId()}`;
    navigator.clipboard.writeText(inviteUrl);
    
    toast({
      title: "Invitation URL copied!",
      description: "Your invitation link has been copied to clipboard",
    });
  };

  const addInviteLink = () => {
    const newLink = {
      id: Date.now().toString(),
      title: '',
      url: '',
      icon: 'link',
      description: ''
    };
    setInviteData(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
  };

  const updateInviteLink = (id: string, field: string, value: string) => {
    setInviteData(prev => ({
      ...prev,
      links: prev.links.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeInviteLink = (id: string) => {
    setInviteData(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== id)
    }));
  };

  const generateInviteId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createInviteLink = () => {
    const inviteId = generateInviteId();
    const inviteUrl = `${window.location.origin}/invite/${inviteId}`;
    
    // In a real app, you would save this to a database
    // For now, we'll just show the URL
    toast({
      title: "Invitation created!",
      description: `Your invitation link: ${inviteUrl}`,
    });
    
    // You could also copy to clipboard
    navigator.clipboard.writeText(inviteUrl);
  };

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 via-blue-900 to-teal-900">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Uganda Bio Connect</div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-slate-200">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user?.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/dashboard'}
                    className="border-cyan-400 text-cyan-300 hover:bg-cyan-900/30"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="border-purple-400 text-purple-300 hover:bg-purple-900/30"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/auth'}
                  className="border-cyan-400 text-cyan-300 hover:bg-cyan-900/30"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-teal-400 bg-clip-text text-transparent mb-6">
              Link-Hub
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Connect your business . One link, endless possibilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleCreateProfile}
                size="lg" 
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Your Bio Link
              </Button>
              <Button 
                onClick={handleCreateInvitation}
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create Invitation
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-teal-400 text-teal-300 hover:bg-teal-900/30 bg-transparent px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300"
              >
                View Examples
              </Button>
              <Button 
                onClick={() => window.location.href = '/invite/demo-invite'}
                variant="outline" 
                size="lg"
                className="border-2 border-purple-400 text-purple-300 hover:bg-purple-900/30 bg-transparent px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300"
              >
                Demo Invitation
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="border-slate-700 shadow-lg bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Link2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-100">Simple Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-slate-300">
                  Create your professional bio link in minutes. No technical skills required.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-slate-700 shadow-lg bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Instagram className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-100">Social Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-slate-300">
                  Connect all your social media, website, and business platforms in one place.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-slate-700 shadow-lg bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-100">Invitation Links</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-slate-300">
                  Create special invitation pages with curated content for your audience.
                </CardDescription>
                {!isAuthenticated && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-teal-400" />
                    <span className="text-xs text-teal-400">Login required</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-700 shadow-lg bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Youtube className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-100">Uganda Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-slate-300">
                  Built specifically for Ugandan entrepreneurs and small businesses.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-cyan-800 via-purple-800 to-teal-800 rounded-2xl p-8 text-white border border-slate-600">
            <h2 className="text-3xl font-bold mb-4">Ready to grow your business?</h2>
            <p className="text-xl mb-6 opacity-90">Join hundreds of Ugandan entrepreneurs already using Bio Connect</p>
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-500 hover:to-purple-500 text-slate-900 px-8 py-3 rounded-full text-lg font-semibold"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'create-profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 via-blue-900 to-teal-900">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('landing')}
              className="text-cyan-300 hover:text-cyan-200 hover:bg-cyan-900/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Uganda Bio Connect</div>
            <div className="w-20"></div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  Create Your Bio Link
                </h1>
                <p className="text-slate-300 text-lg">
                  Build your professional online presence with a beautiful bio link page.
                </p>
              </div>

              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-100">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-200">Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Your full name"
                      className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-200">Username</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      placeholder="your-username"
                      className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-slate-200">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder="Tell people about yourself or your business..."
                      className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-slate-200">Profile Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="border-slate-600 bg-slate-700 text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-cyan-600 file:to-purple-600 file:text-white hover:file:from-cyan-700 hover:file:to-purple-700"
                      />
                      {profileData.avatar && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeImage}
                          className="border-red-400 text-red-300 hover:bg-red-900/30"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-100">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileData.links.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={link.url}
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400"
                      />
                      <Input
                        value={link.title}
                        onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                        placeholder="Link title"
                        className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 w-32"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeLink(link.id)}
                        className="border-red-400 text-red-300 hover:bg-red-900/30"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addLink}
                    className="border-cyan-400 text-cyan-300 hover:bg-cyan-900/30"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  onClick={handleSaveProfile}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Save Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('landing')}
                  className="border-slate-400 text-slate-300 hover:bg-slate-700/30"
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Live Preview</h2>
                <p className="text-slate-300">See how your bio link will look</p>
              </div>

              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      {profileData.avatar ? (
                        <img
                          src={profileData.avatar}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-cyan-400"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-cyan-400">
                          {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">
                        {profileData.name || 'Your Name'}
                      </h3>
                      <p className="text-slate-300 text-sm">
                        @{profileData.username || 'username'}
                      </p>
                    </div>

                    {profileData.bio && (
                      <p className="text-slate-300 text-sm max-w-sm mx-auto">
                        {profileData.bio}
                      </p>
                    )}

                    <div className="space-y-2">
                      {profileData.links.map((link, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-400/30 rounded-lg p-3 hover:from-cyan-600/30 hover:to-purple-600/30 transition-all duration-300 cursor-pointer"
                        >
                          <div className="text-slate-100 font-medium">
                            {link.title || 'Link Title'}
                          </div>
                          <div className="text-slate-400 text-xs truncate">
                            {link.url || 'https://...'}
                          </div>
                        </div>
                      ))}
                      {profileData.links.length === 0 && (
                        <div className="text-slate-400 text-sm italic">
                          Add some links to see them here
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'create-invite') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 via-blue-900 to-teal-900">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('landing')}
              className="text-cyan-300 hover:text-cyan-200 hover:bg-cyan-900/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Uganda Bio Connect</div>
            <div className="w-20"></div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent mb-4">
                  Create Invitation Link
                </h1>
                <p className="text-slate-300 text-lg">
                  Create a special invitation page with curated content for your audience.
                </p>
              </div>

              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-100">Invitation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteTitle" className="text-slate-200">Title</Label>
                    <Input
                      id="inviteTitle"
                      value={inviteData.title}
                      onChange={(e) => setInviteData({ ...inviteData, title: e.target.value })}
                      placeholder="Your invitation title"
                      className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inviteDescription" className="text-slate-200">Description</Label>
                    <Textarea
                      id="inviteDescription"
                      value={inviteData.description}
                      onChange={(e) => setInviteData({ ...inviteData, description: e.target.value })}
                      placeholder="Describe what this invitation is about..."
                      className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inviteImage" className="text-slate-200">Cover Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="inviteImage"
                        type="file"
                        accept="image/*"
                        onChange={handleInviteImageChange}
                        className="border-slate-600 bg-slate-700 text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600 file:to-teal-600 file:text-white hover:file:from-purple-700 hover:file:to-teal-700"
                      />
                      {inviteData.image && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInviteData({ ...inviteData, image: null })}
                          className="border-red-400 text-red-300 hover:bg-red-900/30"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-100">Host Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hostName" className="text-slate-200">Host Name</Label>
                                         <Input
                       id="hostName"
                       value={inviteData.host.name}
                       onChange={(e) => setInviteData({
                         ...inviteData,
                         host: { ...inviteData.host, name: e.target.value }
                       })}
                       placeholder="Your name or business name"
                       className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400"
                     />
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="hostBio" className="text-slate-200">Host Bio</Label>
                     <Textarea
                       id="hostBio"
                       value={inviteData.host.bio}
                       onChange={(e) => setInviteData({
                         ...inviteData,
                         host: { ...inviteData.host, bio: e.target.value }
                       })}
                       placeholder="Tell people about yourself..."
                       className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400"
                       rows={2}
                     />
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="hostImage" className="text-slate-200">Host Image</Label>
                     <div className="flex items-center gap-4">
                       <Input
                         id="hostImage"
                         type="file"
                         accept="image/*"
                         onChange={handleHostImageChange}
                         className="border-slate-600 bg-slate-700 text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600 file:to-teal-600 file:text-white hover:file:from-purple-700 hover:file:to-teal-700"
                       />
                       {inviteData.host.image && (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setInviteData({
                             ...inviteData,
                             host: { ...inviteData.host, image: '' }
                           })}
                           className="border-red-400 text-red-300 hover:bg-red-900/30"
                         >
                           <X className="w-4 h-4" />
                         </Button>
                       )}
                     </div>
                   </div>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-slate-100">Invitation Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {inviteData.links.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={link.url}
                        onChange={(e) => updateInviteLink(link.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400"
                      />
                      <Input
                        value={link.title}
                        onChange={(e) => updateInviteLink(link.id, 'title', e.target.value)}
                        placeholder="Link title"
                        className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 w-32"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeInviteLink(link.id)}
                        className="border-red-400 text-red-300 hover:bg-red-900/30"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addInviteLink}
                    className="border-purple-400 text-purple-300 hover:bg-purple-900/30"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  onClick={handleSaveInvite}
                  className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create Invitation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('landing')}
                  className="border-slate-400 text-slate-300 hover:bg-slate-700/30"
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Live Preview</h2>
                <p className="text-slate-300">See how your invitation will look</p>
              </div>

              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Cover Image */}
                    {inviteData.image && (
                      <div className="relative">
                        <img
                          src={inviteData.image}
                          alt="Cover"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Title and Description */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-slate-100 mb-2">
                        {inviteData.title || 'Invitation Title'}
                      </h3>
                      {inviteData.description && (
                        <p className="text-slate-300 text-sm">
                          {inviteData.description}
                        </p>
                      )}
                    </div>

                    {/* Host Info */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-600/20 to-teal-600/20 border border-purple-400/30 rounded-lg">
                                             <div className="flex-shrink-0">
                         {inviteData.host.image ? (
                           <img
                             src={inviteData.host.image}
                             alt="Host"
                             className="w-12 h-12 rounded-full object-cover border-2 border-purple-400"
                           />
                         ) : (
                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold border-2 border-purple-400">
                             {inviteData.host.name ? inviteData.host.name.charAt(0).toUpperCase() : 'H'}
                           </div>
                         )}
                       </div>
                       <div className="flex-1">
                         <div className="text-slate-100 font-medium">
                           {inviteData.host.name || 'Host Name'}
                         </div>
                         {inviteData.host.bio && (
                           <div className="text-slate-300 text-xs">
                             {inviteData.host.bio}
                           </div>
                         )}
                       </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-2">
                      {inviteData.links.map((link, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-purple-600/20 to-teal-600/20 border border-purple-400/30 rounded-lg p-3 hover:from-purple-600/30 hover:to-teal-600/30 transition-all duration-300 cursor-pointer"
                        >
                          <div className="text-slate-100 font-medium">
                            {link.title || 'Link Title'}
                          </div>
                          <div className="text-slate-400 text-xs truncate">
                            {link.url || 'https://...'}
                          </div>
                        </div>
                      ))}
                      {inviteData.links.length === 0 && (
                        <div className="text-slate-400 text-sm italic text-center">
                          Add some links to see them here
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Index;
