import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  MessageCircle,
  Download
} from "lucide-react";

interface ShareModalProps {
  profileUrl: string;
  profileName: string;
  trigger?: React.ReactNode;
}

const ShareModal: React.FC<ShareModalProps> = ({ profileUrl, profileName, trigger }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = async () => {
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
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = () => {
    // In a real implementation, you would generate and download a QR code
    toast({
      title: "QR Code Downloaded",
      description: "QR code has been saved to your device",
    });
  };

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(`Check out ${profileName}'s profile!`)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      url: `https://www.instagram.com/?url=${encodeURIComponent(profileUrl)}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
      url: `mailto:?subject=${encodeURIComponent(`${profileName}'s Profile`)}&body=${encodeURIComponent(`Check out ${profileName}'s profile: ${profileUrl}`)}`,
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-600 hover:bg-green-700",
      url: `https://wa.me/?text=${encodeURIComponent(`Check out ${profileName}'s profile: ${profileUrl}`)}`,
    },
  ];

  const handleShare = (url: string, platform: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    toast({
      title: `Shared on ${platform}`,
      description: `Opening ${platform} share dialog`,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-amber-600 text-amber-200 hover:bg-amber-900/30">
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md bg-stone-800 border-stone-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-stone-100 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Profile
          </DialogTitle>
          <DialogDescription className="text-stone-300">
            Share {profileName}'s profile with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Link */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-stone-200">Profile Link</div>
            <div className="flex gap-2">
              <Input
                value={profileUrl}
                readOnly
                className="bg-stone-700 border-stone-600 text-stone-100 text-sm"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="border-amber-600 text-amber-200 hover:bg-amber-900/30"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Social Media Share */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-stone-200">Share on Social Media</div>
            <div className="grid grid-cols-3 gap-2">
              {shareLinks.map((link) => (
                <Button
                  key={link.name}
                  onClick={() => handleShare(link.url, link.name)}
                  className={`${link.color} text-white`}
                  size="sm"
                >
                  <link.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-stone-200">QR Code</div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowQR(!showQR)}
                variant="outline"
                className="border-amber-600 text-amber-200 hover:bg-amber-900/30"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {showQR ? "Hide QR" : "Show QR"}
              </Button>
              {showQR && (
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="border-amber-600 text-amber-200 hover:bg-amber-900/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
            
            {showQR && (
              <Card className="bg-stone-700 border-stone-600">
                <CardContent className="p-4">
                  <div className="w-32 h-32 bg-white rounded-lg mx-auto flex items-center justify-center">
                    <div className="text-center text-xs text-gray-600">
                      <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                      <p>QR Code</p>
                      <p className="text-xs">(Mock)</p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 text-center mt-2">
                    Scan to visit profile
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Share Stats */}
          <div className="pt-4 border-t border-stone-600">
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-400">Share count</span>
              <Badge variant="secondary" className="bg-amber-900/30 text-amber-200 border-amber-600">
                0 shares
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal; 