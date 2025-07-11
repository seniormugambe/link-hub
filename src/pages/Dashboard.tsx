import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Link2, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Share2, 
  Settings, 
  LogOut,
  ArrowLeft,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ShareButton from "@/components/ShareButton";
import InviteLinkManager from "@/components/InviteLinkManager";
import InviteAnalyticsDashboard from "@/components/InviteAnalyticsDashboard";
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'invites' | 'analytics'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Your Name',
    username: '',
    bio: '',
    avatar: '',
    links: [] as Array<{id: string, title: string, url: string, icon: string}>
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) {
        toast({ title: 'Error', description: 'Could not load profile', variant: 'destructive' });
        return;
      }
      if (data) {
        setProfileData({
          name: data.name || '',
          username: data.username || '',
          bio: data.bio || '',
          avatar: data.avatar || '',
          links: data.links || [],
        });
      }
    };
    fetchProfile();
  }, [user]);

  // Example: Feature gating for premium features
  const isPremium = user?.premium;

  const handleSaveProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .upsert([
        {
          id: user.id,
          name: profileData.name,
          username: profileData.username,
          bio: profileData.bio,
          avatar: profileData.avatar,
          links: profileData.links,
        },
      ], { onConflict: 'id' });
    if (error) {
      toast({ title: 'Error', description: 'Could not save profile', variant: 'destructive' });
      return;
    }
    toast({
      title: 'Profile updated!',
      description: 'Your profile has been saved successfully',
    });
    setIsEditing(false);
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

  const copyProfileUrl = () => {
    const profileUrl = `${window.location.origin}/profile/${profileData.username}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "URL copied!",
      description: "Your profile link has been copied to clipboard",
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only JPEG, PNG, and GIF are allowed',
        variant: 'destructive',
      });
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }
    // Use user-specific folder for RLS compatibility
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      return;
    }
    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl;
    if (publicUrl) {
      setProfileData(prev => ({ ...prev, avatar: publicUrl }));
      // Save to profile
      const { error: updateError } = await supabase.from('profiles').update({ avatar: publicUrl }).eq('id', user.id);
      if (updateError) {
        toast({ title: 'Profile update failed', description: updateError.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Image uploaded!', description: 'Your profile image has been updated' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 via-blue-900 to-teal-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="text-cyan-300 hover:text-cyan-200 hover:bg-cyan-900/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Dashboard
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-slate-200">
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.name}</span>
              </div>
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
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            onClick={() => setActiveTab('profile')}
            className={activeTab === 'profile' 
              ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white' 
              : 'border-slate-600 text-slate-300 hover:bg-slate-700/30'
            }
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
          <Button
            variant={activeTab === 'invites' ? 'default' : 'outline'}
            onClick={() => setActiveTab('invites')}
            className={activeTab === 'invites' 
              ? 'bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white' 
              : 'border-slate-600 text-slate-300 hover:bg-slate-700/30'
            }
          >
            <Share2 className="w-4 h-4 mr-2" />
            Invitations
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
            className={activeTab === 'analytics' 
              ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white' 
              : 'border-slate-600 text-slate-300 hover:bg-slate-700/30'
            }
          >
            <Settings className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        {activeTab === 'profile' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Profile Form */}
            <div className="space-y-6">
              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-slate-100">Profile Information</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="border-cyan-400 text-cyan-300 hover:bg-cyan-900/30"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-200">Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                      className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-200">Username</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      disabled={!isEditing}
                      className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-slate-200">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 disabled:opacity-50"
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
                        disabled={!isEditing}
                        className="border-slate-600 bg-slate-700 text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-cyan-600 file:to-purple-600 file:text-white hover:file:from-cyan-700 hover:file:to-purple-700 disabled:opacity-50"
                      />
                      {profileData.avatar && isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProfileData({ ...profileData, avatar: '' })}
                          className="border-red-400 text-red-300 hover:bg-red-900/30"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
                    >
                      Save Changes
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-slate-100">Social Links</CardTitle>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addLink}
                        className="border-cyan-400 text-cyan-300 hover:bg-cyan-900/30"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Link
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileData.links.map((link) => (
                    <div key={link.id} className="flex gap-2">
                      <Input
                        value={link.url}
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                        placeholder="https://..."
                        disabled={!isEditing}
                        className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 disabled:opacity-50"
                      />
                      <Input
                        value={link.title}
                        onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                        placeholder="Link title"
                        disabled={!isEditing}
                        className="border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 w-32 disabled:opacity-50"
                      />
                      {isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeLink(link.id)}
                          className="border-red-400 text-red-300 hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Profile Preview */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Profile Preview</h2>
                <p className="text-slate-300">How your bio link appears to visitors</p>
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
                        {profileData.name}
                      </h3>
                      <p className="text-slate-300 text-sm">
                        @{profileData.username}
                      </p>
                    </div>

                    {profileData.bio && (
                      <p className="text-slate-300 text-sm max-w-sm mx-auto">
                        {profileData.bio}
                      </p>
                    )}

                    <div className="space-y-2">
                      {profileData.links.map((link) => (
                        <div
                          key={link.id}
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
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={copyProfileUrl}
                        variant="outline"
                        className="border-cyan-400 text-cyan-300 hover:bg-cyan-900/30"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Profile URL
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'invites' && (
          <InviteLinkManager isPremium={isPremium} />
        )}
        {activeTab === 'analytics' && (
          <InviteAnalyticsDashboard />
        )}

        {/* Premium Feature Example */}
        {!isPremium && (
          <div className="my-4 p-4 border-2 border-yellow-400 bg-yellow-100 text-yellow-900 rounded">
            <strong>Upgrade to Premium</strong> to unlock advanced analytics, custom themes, and more!
            <Button className="ml-4 bg-gradient-to-r from-yellow-500 to-yellow-700 text-white" onClick={() => alert('Upgrade flow coming soon!')}>Go Premium</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 