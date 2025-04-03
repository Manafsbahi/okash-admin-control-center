
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { Pencil, Check, X } from "lucide-react";

const Exchange = () => {
  const { employee } = useAuth();
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [newCurrency, setNewCurrency] = useState({
    currency_code: "",
    currency_name: "",
    rate_to_syp: 0
  });

  const { data: rates = [], isLoading, refetch } = useQuery({
    queryKey: ['exchange_rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('currency_code');

      if (error) {
        console.error("Error fetching exchange rates:", error);
        throw error;
      }

      return data || [];
    }
  });

  const hasEditPermission = 
    employee?.role === 'admin' || 
    employee?.permissions?.can_edit_exchange_rates;

  const startEditing = (rateId: string, currentRate: number) => {
    if (!hasEditPermission) {
      toast.error("You don't have permission to edit exchange rates");
      return;
    }
    setEditingRate(rateId);
    setEditValue(currentRate);
  };

  const cancelEditing = () => {
    setEditingRate(null);
    setEditValue(0);
  };

  const saveRate = async (rateId: string) => {
    if (!hasEditPermission) return;

    try {
      const { error } = await supabase
        .from('exchange_rates')
        .update({ 
          rate_to_syp: editValue,
          last_updated_by: employee?.id
        })
        .eq('id', rateId);

      if (error) throw error;

      toast.success("Exchange rate updated successfully");
      refetch();
      cancelEditing();
    } catch (error) {
      console.error("Error updating exchange rate:", error);
      toast.error("Failed to update exchange rate");
    }
  };

  const addNewCurrency = async () => {
    if (!hasEditPermission) {
      toast.error("You don't have permission to add currencies");
      return;
    }

    if (!newCurrency.currency_code || !newCurrency.currency_name || !newCurrency.rate_to_syp) {
      toast.error("Please fill in all currency details");
      return;
    }

    try {
      const { error } = await supabase
        .from('exchange_rates')
        .insert({ 
          currency_code: newCurrency.currency_code,
          currency_name: newCurrency.currency_name,
          rate_to_syp: newCurrency.rate_to_syp,
          last_updated_by: employee?.id
        });

      if (error) throw error;

      toast.success("New currency added successfully");
      refetch();
      setNewCurrency({
        currency_code: "",
        currency_name: "",
        rate_to_syp: 0
      });
    } catch (error) {
      console.error("Error adding new currency:", error);
      toast.error("Failed to add new currency");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading exchange rates...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Exchange Rates</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Exchange Rates (1 Currency = X SYP)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency Code</TableHead>
                  <TableHead>Currency Name</TableHead>
                  <TableHead className="text-right">Rate to SYP</TableHead>
                  {hasEditPermission && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>{rate.currency_code}</TableCell>
                    <TableCell>{rate.currency_name}</TableCell>
                    <TableCell className="text-right">
                      {editingRate === rate.id ? (
                        <Input 
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          className="w-32 inline-block"
                        />
                      ) : (
                        rate.rate_to_syp.toLocaleString()
                      )}
                    </TableCell>
                    {hasEditPermission && (
                      <TableCell>
                        {editingRate === rate.id ? (
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => saveRate(rate.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => startEditing(rate.id, rate.rate_to_syp)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {hasEditPermission && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="currency_code">Currency Code</Label>
                <Input 
                  id="currency_code"
                  placeholder="USD" 
                  value={newCurrency.currency_code}
                  onChange={(e) => setNewCurrency({...newCurrency, currency_code: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="currency_name">Currency Name</Label>
                <Input 
                  id="currency_name"
                  placeholder="US Dollar" 
                  value={newCurrency.currency_name}
                  onChange={(e) => setNewCurrency({...newCurrency, currency_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="rate">Rate to SYP</Label>
                <Input 
                  id="rate"
                  type="number" 
                  placeholder="5000" 
                  value={newCurrency.rate_to_syp || ""}
                  onChange={(e) => setNewCurrency({...newCurrency, rate_to_syp: Number(e.target.value)})}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addNewCurrency}>Add Currency</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Exchange;
