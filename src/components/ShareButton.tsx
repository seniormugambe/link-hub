import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import ShareModal from "./ShareModal";

interface ShareButtonProps {
  profileUrl: string;
  profileName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  profileUrl,
  profileName,
  variant = "outline",
  size = "default",
  className = "",
  children
}) => {
  return (
    <ShareModal
      profileUrl={profileUrl}
      profileName={profileName}
      trigger={
        <Button
          variant={variant}
          size={size}
          className={className}
        >
          <Share2 className="w-4 h-4 mr-2" />
          {children || "Share"}
        </Button>
      }
    />
  );
};

export default ShareButton; 