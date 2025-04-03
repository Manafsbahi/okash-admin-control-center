
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, RefreshCw, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

// Form schema for creating/editing exchange rates
const exchangeRateSchema = z.object({
  currency_code: z.string().min(3, { message: "Currency code must be at least 3 characters" }),
  currency_name: z.string().min(2, { message: "Currency name is required" }),
  rate_to_syp: z.coerce.number().positive({ message: "Rate must be a positive number" }),
});

const Exchange = () => {
  const { t, isRTL } = useLanguage();
  const { employee } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<any>(null);
  const [calculatorAmount, setCalculatorAmount] = useState<number | "">("");
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  const form = useForm<z.infer<typeof exchangeRateSchema>>({
    resolver: zodResolver(exchangeRateSchema),
    defaultValues: {
      currency_code: "",
      currency_name: "",
      rate_to_syp: 0,
    },
  });

  // Check if employee can manage exchange rates
  const canManageRates = employee?.role === 'admin' || employee?.permissions?.can_manage_rates;

  // Fetch exchange rates
  const { data: rates = [], isLoading, refetch } = useQuery({
    queryKey: ['exchange_rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('currency_code');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleEditRate = (rate: any) => {
    setEditingRate(rate);
    form.reset({
      currency_code: rate.currency_code,
      currency_name: rate.currency_name,
      rate_to_syp: rate.rate_to_syp,
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingRate(null);
    form.reset({
      currency_code: "",
      currency_name: "",
      rate_to_syp: 0,
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingRate(null);
    form.reset();
  };

  const onSubmit = async (values: z.infer<typeof exchangeRateSchema>) => {
    if (!employee) return;
    
    try {
      if (editingRate) {
        // Update existing rate
        const { error } = await supabase
          .from('exchange_rates')
          .update({
            ...values,
            last_updated_by: employee.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingRate.id);
        
        if (error) throw error;
        toast.success(`Updated ${values.currency_name} exchange rate`);
      } else {
        // Add new rate
        const { error } = await supabase
          .from('exchange_rates')
          .insert({
            ...values,
            last_updated_by: employee.id,
          });
        
        if (error) throw error;
        toast.success(`Added ${values.currency_name} exchange rate`);
      }
      
      handleDialogClose();
      refetch();
    } catch (error) {
      console.error('Error saving exchange rate:', error);
      toast.error("Failed to save exchange rate");
    }
  };

  // Calculate conversion
  const calculateConversion = (amount: number, selectedCode: string | null) => {
    if (!selectedCode || !amount) return null;
    
    const selectedRate = rates.find(rate => rate.currency_code === selectedCode);
    if (!selectedRate) return null;
    
    return amount * selectedRate.rate_to_syp;
  };

  const convertedAmount = typeof calculatorAmount === 'number' && selectedCurrency
    ? calculateConversion(calculatorAmount, selectedCurrency)
    : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exchange Rate Market</h1>
        
        {canManageRates && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Currency
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Exchange Rates Table */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Current Exchange Rates</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading exchange rates...</div>
            ) : rates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left">Currency</th>
                      <th className="py-2 px-4 text-right">1 Unit = SYP</th>
                      {canManageRates && <th className="py-2 px-4 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {rates.map((rate) => (
                      <tr key={rate.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{rate.currency_code}</div>
                          <div className="text-sm text-muted-foreground">{rate.currency_name}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {rate.rate_to_syp.toLocaleString()} SYP
                        </td>
                        {canManageRates && (
                          <td className="py-3 px-4 text-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditRate(rate)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No exchange rates available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Currency Calculator */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Currency Converter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  value={calculatorAmount}
                  onChange={(e) => setCalculatorAmount(e.target.value ? parseFloat(e.target.value) : "")}
                  placeholder="Enter amount"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Currency</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedCurrency || ""}
                  onChange={(e) => setSelectedCurrency(e.target.value || null)}
                >
                  <option value="">Select currency</option>
                  {rates.map((rate) => (
                    <option key={rate.id} value={rate.currency_code}>
                      {rate.currency_code} - {rate.currency_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground">Converted Amount:</div>
                  <div className="text-2xl font-bold">
                    {convertedAmount !== null
                      ? `${convertedAmount.toLocaleString()} SYP`
                      : "—"
                    }
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for adding/editing exchange rates */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRate ? 'Edit Exchange Rate' : 'Add New Exchange Rate'}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currency_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="USD" 
                        {...field} 
                        disabled={!!editingRate}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Name</FormLabel>
                    <FormControl>
                      <Input placeholder="US Dollar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rate_to_syp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate (1 unit to SYP)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="3000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>Cancel</Button>
                <Button type="submit">{editingRate ? 'Update' : 'Add'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Exchange;
