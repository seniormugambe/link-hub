import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Eye, TrendingUp, Users } from "lucide-react";

interface ShareStatsProps {
  profileUrl: string;
  stats?: {
    totalViews: number;
    totalShares: number;
    uniqueVisitors: number;
    growthRate: number;
  };
}

const ShareStats: React.FC<ShareStatsProps> = ({ profileUrl, stats }) => {
  const defaultStats = {
    totalViews: 0,
    totalShares: 0,
    uniqueVisitors: 0,
    growthRate: 0,
    ...stats
  };

  const statItems = [
    {
      title: "Total Views",
      value: defaultStats.totalViews.toLocaleString(),
      icon: Eye,
      color: "text-blue-400",
      bgColor: "bg-blue-900/30"
    },
    {
      title: "Total Shares",
      value: defaultStats.totalShares.toLocaleString(),
      icon: Share2,
      color: "text-green-400",
      bgColor: "bg-green-900/30"
    },
    {
      title: "Unique Visitors",
      value: defaultStats.uniqueVisitors.toLocaleString(),
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-900/30"
    },
    {
      title: "Growth Rate",
      value: `${defaultStats.growthRate > 0 ? '+' : ''}${defaultStats.growthRate}%`,
      icon: TrendingUp,
      color: defaultStats.growthRate >= 0 ? "text-amber-400" : "text-red-400",
      bgColor: defaultStats.growthRate >= 0 ? "bg-amber-900/30" : "bg-red-900/30"
    }
  ];

  return (
    <Card className="shadow-xl border-stone-700 bg-stone-800/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-stone-100 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share Analytics
        </CardTitle>
        <CardDescription className="text-stone-300">
          Track your profile's performance and engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item) => (
            <div key={item.title} className="text-center">
              <div className={`w-12 h-12 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold text-stone-100 mb-1">
                {item.value}
              </div>
              <div className="text-sm text-stone-400">
                {item.title}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-stone-600">
          <div className="flex justify-between items-center">
            <span className="text-sm text-stone-400">Profile URL</span>
            <Badge variant="secondary" className="bg-stone-700 text-stone-300 border-stone-600">
              {profileUrl.split('/').pop()}
            </Badge>
          </div>
        </div>

        {defaultStats.totalViews === 0 && (
          <div className="mt-4 text-center py-4">
            <div className="text-stone-400 mb-2">No data yet</div>
            <p className="text-sm text-stone-500">
              Start sharing your profile to see analytics here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShareStats; 