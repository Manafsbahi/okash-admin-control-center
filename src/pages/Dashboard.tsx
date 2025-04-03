
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Wallet, 
  Building, 
  CreditCard as CreditCardIcon, 
  Users,
  TrendingUp,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { t, isRTL } = useLanguage();

  // Fetch transactions
  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id, 
        amount, 
        created_at, 
        transaction_type, 
        status,
        source_account_id (id, name),
        destination_account_id (id, name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }

    return data || [];
  };

  // Fetch stats
  const fetchStats = async () => {
    // Total balance
    const { data: totalBalance, error: balanceError } = await supabase
      .from('customers')
      .select('balance')
      .eq('status', 'active');

    if (balanceError) {
      console.error("Error fetching balance:", balanceError);
      throw balanceError;
    }

    // Active customers count
    const { count: activeCustomers, error: customerError } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    if (customerError) {
      console.error("Error fetching customers:", customerError);
      throw customerError;
    }

    // Bank transfers
    const { data: bankTransfers, error: transfersError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('transaction_type', 'transfer');

    if (transfersError) {
      console.error("Error fetching transfers:", transfersError);
      throw transfersError;
    }

    // Cash deposits
    const { data: cashDeposits, error: depositsError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('transaction_type', 'deposit');

    if (depositsError) {
      console.error("Error fetching deposits:", depositsError);
      throw depositsError;
    }

    // Exchange rate (would typically come from exchange_rates table)
    const { data: exchangeRates, error: ratesError } = await supabase
      .from('exchange_rates')
      .select('rate_to_syp')
      .eq('currency_code', 'USD')
      .single();

    // Calculate totals
    const totalBalanceAmount = totalBalance?.reduce((sum, customer) => sum + Number(customer.balance), 0) || 0;
    const totalTransfers = bankTransfers?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    const totalDeposits = cashDeposits?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    
    return {
      totalBalance: totalBalanceAmount,
      activeCustomers: activeCustomers || 0,
      bankTransfers: totalTransfers,
      cashDeposits: totalDeposits,
      exchangeRate: exchangeRates?.rate_to_syp || 13250 // Fallback value
    };
  };

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['dashboard-transactions'],
    queryFn: fetchTransactions
  });

  const { data: stats = {
    totalBalance: 0,
    activeCustomers: 0,
    bankTransfers: 0,
    cashDeposits: 0,
    exchangeRate: 13250
  }, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchStats
  });

  // Format the transaction date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("app.dashboard")}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("app.total.balance")}
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">
                {stats.totalBalance.toLocaleString()} SYP
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("app.total.bank.transfers")}
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">
                {stats.bankTransfers.toLocaleString()} SYP
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("app.total.cash.deposits")}
            </CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">
                {stats.cashDeposits.toLocaleString()} SYP
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("app.active.customers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("app.current.exchange.rate")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">1 USD = {stats.exchangeRate.toLocaleString()} SYP</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("app.recent.transactions")}</CardTitle>
          <Link to="/transactions">
            <Button variant="outline" size="sm" className="h-8">
              <Eye className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
              {t("app.view.all")}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 animate-pulse rounded"></div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">{t("app.date")}</th>
                    <th className="text-right py-3 px-4">{t("app.amount")}</th>
                    <th className="text-left py-3 px-4">{t("app.type")}</th>
                    <th className="text-left py-3 px-4">{t("app.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{formatDate(transaction.created_at)}</td>
                      <td className="py-3 px-4 text-right">
                        {transaction.amount?.toLocaleString() || 0} SYP
                      </td>
                      <td className="py-3 px-4">{transaction.transaction_type}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              {t("app.no.transactions")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
