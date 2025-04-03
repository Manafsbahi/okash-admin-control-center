
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, Edit, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the Ad Campaign type
type AdCampaign = {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
};

const Ads = () => {
  const { t, isRTL } = useLanguage();
  const { employee } = useAuth();
  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAdCampaigns();
  }, []);

  const fetchAdCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ad_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setAdCampaigns(data as AdCampaign[]);
      }
    } catch (error) {
      console.error("Error fetching ad campaigns:", error);
      toast.error("Failed to fetch ad campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("ad_campaigns")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update the local state
      setAdCampaigns(adCampaigns.filter(campaign => campaign.id !== id));
      toast.success("Ad campaign deleted successfully");
    } catch (error) {
      console.error("Error deleting ad campaign:", error);
      toast.error("Failed to delete ad campaign");
    }
  };

  // Filter campaigns based on search query
  const filteredCampaigns = adCampaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (campaign.description && campaign.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">{t("app.ads")}</h1>
        
        <Button className="bg-okash-accent hover:bg-okash-secondary">
          <Plus className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
          New Campaign
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("app.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ad Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-okash-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Start Date</th>
                    <th className="text-left py-3 px-4">End Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          {campaign.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">{campaign.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">{campaign.type || "N/A"}</td>
                      <td className="py-4 px-4">{formatDate(campaign.start_date)}</td>
                      <td className="py-4 px-4">{formatDate(campaign.end_date)}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No ad campaigns found</p>
              <Button 
                className="mt-4 bg-okash-accent hover:bg-okash-secondary"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Ads;
