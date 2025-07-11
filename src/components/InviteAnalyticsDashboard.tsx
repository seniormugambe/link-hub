import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsEvent {
  id: string;
  invite_id: string;
  timestamp: string;
  location: string;
  device: string;
  referral: string;
  type: "view" | "click";
}

interface InviteLink {
  id: string;
  title: string;
  inviteUrl: string;
  analytics: AnalyticsEvent[];
}

function getLast7Days() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getChartData(analytics: AnalyticsEvent[] | undefined) {
  const days = getLast7Days();
  const data = days.map((date) => ({
    date,
    views: 0,
    clicks: 0,
  }));
  if (!analytics) return data;
  analytics.forEach((event) => {
    const day = event.timestamp.slice(0, 10);
    const idx = days.indexOf(day);
    if (idx !== -1) {
      if (event.type === "view") data[idx].views += 1;
      if (event.type === "click") data[idx].clicks += 1;
    }
  });
  return data;
}

const InviteAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const isPremium = user?.premium;

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      setLoading(true);
      // Fetch all invites for the user
      const { data: invites, error: invitesError } = await supabase
        .from("invitations")
        .select("id, title")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (invitesError || !invites) {
        setInviteLinks([]);
        setLoading(false);
        return;
      }
      // Fetch all analytics for these invites
      const inviteIds = invites.map((i: any) => i.id);
      let analytics: AnalyticsEvent[] = [];
      if (inviteIds.length > 0) {
        const { data: analyticsData } = await supabase
          .from("invitation_analytics")
          .select("id, invite_id, timestamp, location, device, referral, type")
          .in("invite_id", inviteIds);
        analytics = analyticsData || [];
      }
      // Map analytics to invites
      const links: InviteLink[] = invites.map((invite: any) => ({
        id: invite.id,
        title: invite.title,
        inviteUrl: `${window.location.origin}/invite/${invite.id}`,
        analytics: analytics.filter(a => a.invite_id === invite.id),
      }));
      setInviteLinks(links);
      setLoading(false);
    };
    fetchAnalytics();
  }, [user]);

  return (
    <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm mt-8">
      <CardHeader>
        <CardTitle className="text-slate-100 text-2xl">Invitation Link Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-slate-300">Loading analytics...</div>
        ) : inviteLinks.length === 0 ? (
          <div className="text-slate-400">No invitation links found.</div>
        ) : (
          <div className="overflow-x-auto space-y-12">
            <Table className="min-w-full text-slate-200 mb-8">
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Clicks</TableHead>
                  {isPremium && <TableHead>Analytics</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {inviteLinks.map((invite) => {
                  const views = invite.analytics.filter(a => a.type === 'view').length;
                  const clicks = invite.analytics.filter(a => a.type === 'click').length;
                  return (
                    <TableRow key={invite.id}>
                      <TableCell>{invite.title}</TableCell>
                      <TableCell>
                        <a
                          href={invite.inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 underline"
                        >
                          {invite.inviteUrl}
                        </a>
                      </TableCell>
                      <TableCell>{views}</TableCell>
                      <TableCell>{clicks}</TableCell>
                      {isPremium && (
                        <TableCell>
                          {invite.analytics.length > 0 ? `${invite.analytics.length} events` : "-"}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {isPremium && inviteLinks.map((invite) => (
              <div key={invite.id} className="mb-12">
                <div className="font-semibold text-slate-100 mb-2">{invite.title} - Last 7 Days</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getChartData(invite.analytics)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fill: '#e5e7eb', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#e5e7eb', fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', color: '#f59e42', border: 'none' }} />
                    <Legend />
                    <Bar dataKey="views" fill="#38bdf8" name="Views" />
                    <Bar dataKey="clicks" fill="#f59e42" name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InviteAnalyticsDashboard; 