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
  ExternalLink
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

  // Fetch invitations from Supabase on mount
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

  // Create invitation in Supabase
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

  // Delete invitation in Supabase
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

  // Only allow access if authenticated
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
          <DialogContent
            className="max-w-2xl border-stone-700 max-h-[80vh] overflow-y-auto rounded-lg shadow-lg"
            style={isPremium ? { background: newInvite.theme.backgroundColor } : { background: 'rgba(24, 24, 27, 0.9)' }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl text-stone-100">Create New Invitation</DialogTitle>
              <DialogDescription className="text-stone-300">
                Create a special invitation with curated links for your audience
              </DialogDescription>
            </DialogHeader>
            {/* Basic Info Section */}
            <div className="mb-6">
              <h4 className="font-semibold text-stone-100 mb-2">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Title *"
                  value={newInvite.title}
                  onChange={e => setNewInvite(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-stone-700 text-stone-100"
                  maxLength={50}
                  required
                />
                <Textarea
                  placeholder="Description"
                  value={newInvite.description}
                  onChange={e => setNewInvite(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-stone-700 text-stone-100"
                  rows={2}
                  maxLength={200}
                />
              </div>
            </div>
            <hr className="my-4 border-stone-700" />
            {/* Links Section */}
            <div className="mb-6">
              <h4 className="font-semibold text-stone-100 mb-2">Links</h4>
              {newInvite.links.length === 0 && (
                <div className="text-stone-400 mb-2">No links added yet.</div>
              )}
              <div className="space-y-2">
                {newInvite.links.map((link, idx) => (
                  <div key={link.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center bg-stone-700/50 p-2 rounded">
                    <Input
                      placeholder="Title"
                      value={link.title}
                      onChange={e => updateInviteLink(link.id, 'title', e.target.value)}
                      className="bg-stone-800 text-stone-100"
                    />
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={e => updateInviteLink(link.id, 'url', e.target.value)}
                      className="bg-stone-800 text-stone-100"
                    />
                    <Input
                      placeholder="Icon (e.g. link, user)"
                      value={link.icon}
                      onChange={e => updateInviteLink(link.id, 'icon', e.target.value)}
                      className="bg-stone-800 text-stone-100"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeLinkFromInvite(link.id)} className="text-red-400 hover:text-red-200">Remove</Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" className="mt-2 border-amber-400 text-amber-300" onClick={addLinkToInvite}>
                + Add Link
              </Button>
            </div>
            <hr className="my-4 border-stone-700" />
            {/* Theme & Branding Section */}
            <div className="mb-6">
              <h4 className="font-semibold text-stone-100 mb-2">Theme & Branding <span className="ml-2 text-xs text-amber-400">Premium</span></h4>
              {isPremium ? (
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="block text-stone-200 mb-1">Primary Color</label>
                    <input
                      type="color"
                      value={newInvite.theme.primaryColor}
                      onChange={e => setNewInvite(prev => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value } }))}
                      className="w-12 h-8 border-none bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-200 mb-1">Background Color</label>
                    <input
                      type="color"
                      value={newInvite.theme.backgroundColor}
                      onChange={e => setNewInvite(prev => ({ ...prev, theme: { ...prev.theme, backgroundColor: e.target.value } }))}
                      className="w-12 h-8 border-none bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-200 mb-1">Font</label>
                    <select
                      value={newInvite.theme.font}
                      onChange={e => setNewInvite(prev => ({ ...prev, theme: { ...prev.theme, font: e.target.value } }))}
                      className="w-full p-2 rounded bg-stone-700 text-stone-100"
                    >
                      <option value="sans-serif">Sans Serif</option>
                      <option value="serif">Serif</option>
                      <option value="monospace">Monospace</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-200 mb-1">Logo (optional)</label>
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
                      className="w-full p-2 rounded bg-stone-700 text-stone-100"
                    />
                    {newInvite.theme.logo && (
                      <img src={newInvite.theme.logo} alt="Logo Preview" className="mt-2 w-16 h-16 object-contain rounded border border-stone-600" />
                    )}
                  </div>
                  {/* Live Preview */}
                  <div className="col-span-2 mt-4 p-4 rounded border border-stone-700" style={{ background: newInvite.theme.backgroundColor }}>
                    <div className="flex items-center gap-4">
                      {newInvite.theme.logo && <img src={newInvite.theme.logo} alt="Logo" className="w-10 h-10 rounded" />}
                      <span style={{ color: newInvite.theme.primaryColor, fontFamily: newInvite.theme.font, fontWeight: 600, fontSize: 20 }}>
                        {newInvite.title || 'Invitation Title'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-2 border-yellow-400 bg-yellow-100 text-yellow-900 rounded text-center opacity-70">
                  <strong>Upgrade to Premium</strong> to unlock custom colors, fonts, and branding for your invitations!
                </div>
              )}
            </div>
            <hr className="my-4 border-stone-700" />
            {/* Catalogue Section */}
            <div className="mb-6">
              <h4 className="font-semibold text-stone-100 mb-2">Small Catalogue <span className="ml-2 text-xs text-amber-400">Premium</span></h4>
              {isPremium ? (
                <div className="space-y-4">
                  {newInvite.catalogue.length === 0 && (
                    <div className="text-stone-400 mb-2">No catalogue items added yet.</div>
                  )}
                  <div className="grid grid-cols-1 gap-4">
                    {newInvite.catalogue.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center bg-stone-700/50 p-2 rounded">
                        <Input
                          placeholder="Title"
                          value={item.title}
                          onChange={e => setNewInvite(prev => {
                            const catalogue = [...prev.catalogue];
                            catalogue[idx].title = e.target.value;
                            return { ...prev, catalogue };
                          })}
                          className="bg-stone-800 text-stone-100"
                        />
                        <Textarea
                          placeholder="Description"
                          value={item.description}
                          onChange={e => setNewInvite(prev => {
                            const catalogue = [...prev.catalogue];
                            catalogue[idx].description = e.target.value;
                            return { ...prev, catalogue };
                          })}
                          className="bg-stone-800 text-stone-100"
                          rows={2}
                        />
                        <Input
                          placeholder="Price (optional)"
                          value={item.price}
                          onChange={e => setNewInvite(prev => {
                            const catalogue = [...prev.catalogue];
                            catalogue[idx].price = e.target.value;
                            return { ...prev, catalogue };
                          })}
                          className="bg-stone-800 text-stone-100"
                        />
                        <Input
                          placeholder="Link (optional)"
                          value={item.link}
                          onChange={e => setNewInvite(prev => {
                            const catalogue = [...prev.catalogue];
                            catalogue[idx].link = e.target.value;
                            return { ...prev, catalogue };
                          })}
                          className="bg-stone-800 text-stone-100"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  setNewInvite(prev => {
                                    const catalogue = [...prev.catalogue];
                                    catalogue[idx].image = ev.target?.result as string;
                                    return { ...prev, catalogue };
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full"
                          />
                          {item.image && <img src={item.image} alt="Catalogue" className="w-12 h-12 object-cover rounded border border-stone-600" />}
                          <Button variant="ghost" size="sm" onClick={() => setNewInvite(prev => ({
                            ...prev,
                            catalogue: prev.catalogue.filter((_, i) => i !== idx)
                          }))} className="text-red-400 hover:text-red-200">Remove</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {newInvite.catalogue.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 border-amber-400 text-amber-300"
                      onClick={() => setNewInvite(prev => ({
                        ...prev,
                        catalogue: [...prev.catalogue, { title: '', image: '', description: '', price: '', link: '' }]
                      }))}
                    >+ Add Catalogue Item</Button>
                  )}
                </div>
              ) : (
                <div className="p-4 border-2 border-yellow-400 bg-yellow-100 text-yellow-900 rounded text-center opacity-70">
                  <strong>Upgrade to Premium</strong> to unlock catalogue features for your invitations!
                </div>
              )}
            </div>
            <hr className="my-4 border-stone-700" />
            {/* Submit Button */}
            <div className="flex justify-end">
              <Button onClick={createInviteLink} className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white px-6 py-2 rounded shadow">
                Create Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modal for recent invite */}
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

      {/* Invitation Links List */}
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
                        {isExpired(invite.expiresAt) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      {invite.description && (
                        <p className="text-stone-400 text-sm mb-3">{invite.description}</p>
                      )}
                      {invite.catalogue && invite.catalogue.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-stone-100 mb-2">Catalogue</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {invite.catalogue.map((item, idx) => (
                              <div key={idx} className="bg-stone-700 rounded-lg p-4 flex flex-col items-center shadow">
                                {item.image && (
                                  <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded mb-2" />
                                )}
                                <div className="font-bold text-stone-100 text-center">{item.title}</div>
                                <div className="text-stone-300 text-sm mb-2 text-center">{item.description}</div>
                                {item.price && <div className="text-amber-400 font-semibold">{item.price}</div>}
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
                    {/* ShareButton component is not defined in the original file, assuming it's a placeholder */}
                    {/* <ShareButton
                      profileUrl={invite.inviteUrl}
                      profileName={invite.title}
                      variant="outline"
                      size="sm"
                      className="border-amber-600 text-amber-200 hover:bg-amber-900/30"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </ShareButton> */}
                  </div>
                  {isPremium && invite.analytics && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-stone-100 mb-2">Advanced Analytics</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs text-stone-200 border border-stone-700">
                          <thead>
                            <tr>
                              <th className="px-2 py-1 border-b border-stone-700">Time</th>
                              <th className="px-2 py-1 border-b border-stone-700">Type</th>
                              <th className="px-2 py-1 border-b border-stone-700">Location</th>
                              <th className="px-2 py-1 border-b border-stone-700">Device</th>
                              <th className="px-2 py-1 border-b border-stone-700">Referral</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invite.analytics.map((a, i) => (
                              <tr key={i}>
                                <td className="px-2 py-1 border-b border-stone-800">{new Date(a.timestamp).toLocaleString()}</td>
                                <td className="px-2 py-1 border-b border-stone-800">{a.type}</td>
                                <td className="px-2 py-1 border-b border-stone-800">{a.location}</td>
                                <td className="px-2 py-1 border-b border-stone-800">{a.device}</td>
                                <td className="px-2 py-1 border-b border-stone-800">{a.referral}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button
                        className="mt-2 px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700"
                        onClick={() => {
                          // Export to CSV logic
                          const csv = [
                            ['Time', 'Type', 'Location', 'Device', 'Referral'],
                            ...invite.analytics.map(a => [
                              new Date(a.timestamp).toLocaleString(),
                              a.type,
                              a.location,
                              a.device,
                              a.referral
                            ])
                          ].map(row => row.join(',')).join('\n');
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${invite.title}-analytics.csv`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        Export to CSV
                      </button>
                    </div>
                  )}
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