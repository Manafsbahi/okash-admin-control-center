
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";

const Transactions = () => {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id, 
        amount, 
        created_at, 
        transaction_type, 
        status,
        source_account_id,
        destination_account_id
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }

    // Fetch customer names separately since we have relationship issues
    const transactionsWithCustomers = await Promise.all(
      (data || []).map(async (transaction) => {
        let sourceName = "External";
        let destinationName = "External";
        
        if (transaction.source_account_id) {
          const { data: sourceCustomer } = await supabase
            .from('customers')
            .select('name')
            .eq('id', transaction.source_account_id)
            .single();
            
          if (sourceCustomer) {
            sourceName = sourceCustomer.name;
          }
        }
        
        if (transaction.destination_account_id) {
          const { data: destCustomer } = await supabase
            .from('customers')
            .select('name')
            .eq('id', transaction.destination_account_id)
            .single();
            
          if (destCustomer) {
            destinationName = destCustomer.name;
          }
        }
        
        return {
          ...transaction,
          source_name: sourceName,
          destination_name: destinationName
        };
      })
    );

    return transactionsWithCustomers || [];
  };

  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions
  });

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchQuery.toLowerCase();
    
    return (
      transaction.transaction_type.toLowerCase().includes(searchLower) ||
      String(transaction.amount).includes(searchQuery) ||
      transaction.source_name.toLowerCase().includes(searchLower) ||
      transaction.destination_name.toLowerCase().includes(searchLower)
    );
  });

  // Format the transaction date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("app.transactions")}</h1>
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
          <CardTitle>{t("app.transactions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading transactions. Please try again later.
            </div>
          ) : filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("app.date")}</TableHead>
                  <TableHead>{t("app.transaction.type")}</TableHead>
                  <TableHead>{t("app.source")}</TableHead>
                  <TableHead>{t("app.destination")}</TableHead>
                  <TableHead className="text-right">{t("app.amount")}</TableHead>
                  <TableHead>{t("app.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>{transaction.transaction_type}</TableCell>
                    <TableCell>
                      {transaction.source_name}
                    </TableCell>
                    <TableCell>
                      {transaction.destination_name}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.amount?.toLocaleString() || 0} SYP
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchQuery
                ? t("app.no.transactions.found")
                : t("app.no.transactions")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
