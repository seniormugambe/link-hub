import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Copy, 
  Check, 
  Share2, 
  Link2, 
  Calendar, 
  Users, 
  Eye,
  Trash2,
  Edit,
  ExternalLink,
  Palette,
  Image,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '../lib/supabaseClient';
import { useAuth } from "@/contexts/AuthContext";

interface InviteLink {
  id: string;
  title: string;
  description: string;
  links: Array<{id: string, title: string, url: string, icon: string, description?: string}>;
  inviteUrl: string;
  createdAt: string;
  expiresAt?: string;
  views: number;
  clicks: number;
  isActive: boolean;
  // Advanced analytics (premium only)
  analytics?: Array<{
    timestamp: string;
    location: string;
    device: string;
    referral: string;
    type: 'view' | 'click';
  }>;
  theme?: {
    primaryColor: string;
    backgroundColor: string;
    font: string;
    logo: string;
  };
  catalogue?: Array<{
    title: string;
    image: string;
    description: string;
    price?: string;
    link?: string;
  }>;
}

interface InviteLinkManagerProps {
  className?: string;
}

const InviteLinkManager: React.FC<InviteLinkManagerProps & { isPremium?: boolean }> = ({ className, isPremium }) => {
  const { user, isAuthenticated } = useAuth();
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const [recentInvite, setRecentInvite] = useState<InviteLink | null>(null);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const recentRef = useRef<HTMLDivElement | null>(null);

  const [newInvite, setNewInvite] = useState({
    title: '',
    description: '',
    links: [] as Array<{id: string, title: string, url: string, icon: string, description?: string}>,
    theme: {
      primaryColor: '#f59e42',
      backgroundColor: '#1e293b',
      font: 'sans-serif',
      logo: ''
    },
    catalogue: [] as Array<{ title: string; image: string; description: string; price?: string; link?: string }>
  });

  const generateInviteId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const addLinkToInvite = () => {
    const newLink = {
      id: Date.now().toString(),
      title: '',
      url: '',
      icon: 'link',
      description: ''
    };
    setNewInvite(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
  };

  const updateInviteLink = (id: string, field: string, value: string) => {
    setNewInvite(prev => ({
      ...prev,
      links: prev.links.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeLinkFromInvite = (id: string) => {
    setNewInvite(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== id)
    }));
  };

  useEffect(() => {
    const fetchInvites = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setInviteLinks(data.map((invite: any) => ({
          ...invite,
          inviteUrl: `${window.location.origin}/invite/${invite.id}`,
        })));
      }
    };
    fetchInvites();
  }, [user]);

  const createInviteLink = async () => {
    if (!user) return;
    if (!newInvite.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your invitation",
        variant: "destructive",
      });
      return;
    }
    const { data, error } = await supabase.from('invitations').insert([
      {
        user_id: user.id,
        title: newInvite.title,
        description: newInvite.description,
        links: newInvite.links.filter(link => link.title && link.url),
        is_active: true,
      }
    ]).select();
    if (error) {
      toast({ title: 'Error', description: 'Could not create invitation', variant: 'destructive' });
      return;
    }
    if (data && data[0]) {
      const newLink = {
        ...data[0],
        inviteUrl: `${window.location.origin}/invite/${data[0].id}`,
      };
      setInviteLinks(prev => [newLink, ...prev]);
      setRecentInvite(newLink);
      setShowRecentModal(true);
      setTimeout(() => {
        if (recentRef.current) {
          recentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
    setNewInvite({
      title: '',
      description: '',
      links: [],
      theme: {
        primaryColor: '#f59e42',
        backgroundColor: '#1e293b',
        font: 'sans-serif',
        logo: ''
      },
      catalogue: [],
    });
    setShowCreateDialog(false);
    toast({
      title: "Invitation created!",
      description: "Your invitation link has been created successfully",
    });
  };

  const copyInviteLink = async (inviteUrl: string, id: string) => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedId(id);
      toast({
        title: "Link copied!",
        description: "Invitation link has been copied to clipboard",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const deleteInviteLink = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('invitations').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      toast({ title: 'Error', description: 'Could not delete invitation', variant: 'destructive' });
      return;
    }
    setInviteLinks(prev => prev.filter(link => link.id !== id));
    toast({
      title: "Invitation deleted",
      description: "The invitation link has been removed",
    });
  };

  const toggleInviteStatus = (id: string) => {
    setInviteLinks(prev => prev.map(link => 
      link.id === id ? { ...link, isActive: !link.isActive } : link
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (!isAuthenticated) {
    return <div className="p-4 text-center text-red-500">You must be logged in to manage invitations.</div>;
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-100">Invitation Links</h2>
          <p className="text-stone-400">Create and manage special invitation links for your audience</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900">
              <Plus className="w-4 h-4 mr-2" />
              Create Invitation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 border-stone-700 shadow-2xl">
            <DialogHeader className="text-center pb-6 border-b border-stone-700/50">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                Create New Invitation
              </DialogTitle>
              <DialogDescription className="text-stone-300 text-base">
                Design a beautiful invitation with curated links for your audience
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 py-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Edit className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-200">Title *</label>
                    <Input
                      placeholder="Enter invitation title"
                      value={newInvite.title}
                      onChange={e => setNewInvite(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-stone-800/50 border-stone-600 text-stone-100 placeholder-stone-400 focus:border-amber-500 focus:ring-amber-500/20"
                      maxLength={50}
                      required
                    />
                    <p className="text-xs text-stone-400">{newInvite.title.length}/50 characters</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-stone-200">Description</label>
                    <Textarea
                      placeholder="Brief description of your invitation"
                      value={newInvite.description}
                      onChange={e => setNewInvite(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-stone-800/50 border-stone-600 text-stone-100 placeholder-stone-400 focus:border-amber-500 focus:ring-amber-500/20"
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-stone-400">{newInvite.description.length}/200 characters</p>
                  </div>
                </div>
              </div>

              {/* Links Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Link2 className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100">Links</h3>
                </div>
                
                {newInvite.links.length === 0 ? (
                  <div className="text-center py-8 bg-stone-800/30 rounded-lg border border-stone-700/50">
                    <Link2 className="w-8 h-8 mx-auto mb-3 text-stone-400" />
                    <p className="text-stone-400 mb-4">No links added yet</p>
                    <Button onClick={addLinkToInvite} variant="outline" className="border-amber-500 text-amber-400 hover:bg-amber-500/10">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Link
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newInvite.links.map((link, idx) => (
                      <div key={link.id} className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4 transition-all hover:bg-stone-800/50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-stone-300">Title</label>
                            <Input
                              placeholder="Link title"
                              value={link.title}
                              onChange={e => updateInviteLink(link.id, 'title', e.target.value)}
                              className="bg-stone-900/50 border-stone-600 text-stone-100 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-stone-300">URL</label>
                            <Input
                              placeholder="https://example.com"
                              value={link.url}
                              onChange={e => updateInviteLink(link.id, 'url', e.target.value)}
                              className="bg-stone-900/50 border-stone-600 text-stone-100 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-stone-300">Icon</label>
                            <Input
                              placeholder="link, user, etc."
                              value={link.icon}
                              onChange={e => updateInviteLink(link.id, 'icon', e.target.value)}
                              className="bg-stone-900/50 border-stone-600 text-stone-100 text-sm"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeLinkFromInvite(link.id)} 
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button onClick={addLinkToInvite} variant="outline" className="w-full border-amber-500 text-amber-400 hover:bg-amber-500/10">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Another Link
                    </Button>
                  </div>
                )}
              </div>

              {/* Theme Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Palette className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100">Theme & Branding</h3>
                  {!isPremium && (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                      Premium
                    </Badge>
                  )}
                </div>
                
                {isPremium ? (
                  <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-stone-200">Primary Color</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={newInvite.theme.primaryColor}
                            onChange={e => setNewInvite(prev => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value } }))}
                            className="w-12 h-12 rounded-lg border border-stone-600 cursor-pointer"
                          />
                          <Input
                            value={newInvite.theme.primaryColor}
                            onChange={e => setNewInvite(prev => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value } }))}
                            className="bg-stone-900/50 border-stone-600 text-stone-100 flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-stone-200">Background Color</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={newInvite.theme.backgroundColor}
                            onChange={e => setNewInvite(prev => ({ ...prev, theme: { ...prev.theme, backgroundColor: e.target.value } }))}
                            className="w-12 h-12 rounded-lg border border-stone-600 cursor-pointer"
                          />
                          <Input
                            value={newInvite.theme.backgroundColor}
                            onChange={e => setNewInvite(prev => ({ ...prev, theme: { ...prev.theme, backgroundColor: e.target.value } }))}
                            className="bg-stone-900/50 border-stone-600 text-stone-100 flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-stone-200">Font Family</label>
                        <select
                          value={newInvite.theme.font}
                          onChange={e => setNewInvite(prev => ({ ...prev, theme: { ...prev.theme, font: e.target.value } }))}
                          className="w-full p-3 rounded-lg bg-stone-900/50 border border-stone-600 text-stone-100"
                        >
                          <option value="sans-serif">Sans Serif</option>
                          <option value="serif">Serif</option>
                          <option value="monospace">Monospace</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-stone-200">Logo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setNewInvite(prev => ({ ...prev, theme: { ...prev.theme, logo: ev.target?.result as string } }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full p-3 rounded-lg bg-stone-900/50 border border-stone-600 text-stone-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-500 file:text-white hover:file:bg-amber-600"
                        />
                        {newInvite.theme.logo && (
                          <div className="flex items-center gap-3">
                            <img src={newInvite.theme.logo} alt="Logo Preview" className="w-16 h-16 object-contain rounded-lg border border-stone-600" />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setNewInvite(prev => ({ ...prev, theme: { ...prev.theme, logo: '' } }))}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Live Preview */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-stone-200">Live Preview</label>
                      <div 
                        className="p-6 rounded-lg border border-stone-600 min-h-[120px] flex items-center justify-center"
                        style={{ backgroundColor: newInvite.theme.backgroundColor }}
                      >
                        <div className="text-center">
                          {newInvite.theme.logo && (
                            <img src={newInvite.theme.logo} alt="Logo" className="w-12 h-12 mx-auto mb-3 rounded" />
                          )}
                          <h4 
                            style={{ 
                              color: newInvite.theme.primaryColor, 
                              fontFamily: newInvite.theme.font,
                              fontSize: '1.5rem',
                              fontWeight: '600'
                            }}
                          >
                            {newInvite.title || 'Your Invitation Title'}
                          </h4>
                          <p className="text-stone-400 text-sm mt-2">
                            {newInvite.description || 'Your invitation description will appear here'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 bg-amber-500/20 rounded-full">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-amber-400 mb-2">Unlock Premium Features</h4>
                    <p className="text-amber-300/80 text-sm">
                      Get access to custom colors, fonts, branding, and advanced analytics
                    </p>
                    <Button className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </div>

              {/* Catalogue Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Image className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100">Product Catalogue</h3>
                  {!isPremium && (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                      Premium
                    </Badge>
                  )}
                </div>
                
                {isPremium ? (
                  <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-6">
                    {/* Catalogue implementation would go here */}
                    <div className="text-center py-8 text-stone-400">
                      <Image className="w-8 h-8 mx-auto mb-3" />
                      <p>Catalogue feature coming soon</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 border border-indigo-500/30 rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 bg-indigo-500/20 rounded-full">
                        <Image className="w-6 h-6 text-indigo-400" />
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-indigo-400 mb-2">Product Catalogue</h4>
                    <p className="text-indigo-300/80 text-sm">
                      Showcase your products with beautiful image galleries and descriptions
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-6 border-t border-stone-700/50">
              <Button 
                variant="ghost" 
                onClick={() => setShowCreateDialog(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                Cancel
              </Button>
              <Button 
                onClick={createInviteLink} 
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-2 shadow-lg"
                disabled={!newInvite.title.trim()}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {showRecentModal && recentInvite && (
        <Dialog open={showRecentModal} onOpenChange={setShowRecentModal}>
          <DialogContent className="max-w-md border-amber-700 bg-stone-900 text-stone-100">
            <DialogHeader>
              <DialogTitle className="text-lg">Invitation Created!</DialogTitle>
              <DialogDescription className="text-stone-300">
                Here is your new invitation link. You can copy or share it now.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 mb-4">
              <Input value={recentInvite.inviteUrl} readOnly className="bg-stone-800 border-stone-700 text-stone-100 text-sm" />
              <Button onClick={() => copyInviteLink(recentInvite.inviteUrl, recentInvite.id)} variant="outline" size="sm" className="border-amber-600 text-amber-200 hover:bg-amber-900/30">
                {copiedId === recentInvite.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button onClick={() => window.open(recentInvite.inviteUrl, '_blank')} variant="outline" size="sm" className="border-amber-600 text-amber-200 hover:bg-amber-900/30">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setShowRecentModal(false)} className="bg-gradient-to-r from-amber-700 to-amber-800 text-white">Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="space-y-4">
        {inviteLinks.length === 0 ? (
          <Card className="shadow-xl border-stone-700 bg-stone-800/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="text-stone-400 mb-4">
                <Link2 className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-200 mb-2">No Invitations Yet</h3>
                <p className="text-sm text-stone-400 mb-4">
                  Create your first invitation link to share curated content with your audience
                </p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Invitation
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          inviteLinks.map((invite, idx) => (
            <div key={invite.id} ref={idx === 0 && recentInvite && invite.id === recentInvite.id ? recentRef : undefined}>
              <Card className={`shadow-xl border-stone-700 bg-stone-800/90 backdrop-blur-sm ${recentInvite && invite.id === recentInvite.id ? 'ring-4 ring-amber-400' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-stone-100">{invite.title}</h3>
                        <Badge 
                          variant={invite.isActive ? "default" : "secondary"}
                          className={invite.isActive ? "bg-green-900/30 text-green-200 border-green-600" : "bg-stone-700 text-stone-300 border-stone-600"}
                        >
                          {invite.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {invite.expiresAt && isExpired(invite.expiresAt) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      {invite.description && (
                        <p className="text-stone-400 text-sm mb-3">{invite.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-stone-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created {formatDate(invite.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {invite.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {invite.clicks} clicks
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleInviteStatus(invite.id)}
                        className="text-stone-400 hover:text-stone-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteInviteLink(invite.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Input
                      value={invite.inviteUrl}
                      readOnly
                      className="bg-stone-700 border-stone-600 text-stone-100 text-sm"
                    />
                    <Button
                      onClick={() => copyInviteLink(invite.inviteUrl, invite.id)}
                      variant="outline"
                      size="sm"
                      className="border-amber-600 text-amber-200 hover:bg-amber-900/30"
                    >
                      {copiedId === invite.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={() => window.open(invite.inviteUrl, '_blank')}
                      variant="outline"
                      size="sm"
                      className="border-amber-600 text-amber-200 hover:bg-amber-900/30"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-stone-700 text-stone-300 border-stone-600">
                      {invite.links.length} links
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InviteLinkManager;
