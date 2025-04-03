
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

// Mock transaction data
const mockTransactions = [
  {
    id: "1",
    date: "2023-07-10",
    amount: 150000,
    type: "Deposit",
    status: "Completed",
  },
  {
    id: "2",
    date: "2023-07-09",
    amount: 75000,
    type: "Withdrawal",
    status: "Completed",
  },
  {
    id: "3",
    date: "2023-07-08",
    amount: 220000,
    type: "Transfer",
    status: "Completed",
  },
  {
    id: "4",
    date: "2023-07-07",
    amount: 95000,
    type: "Deposit",
    status: "Pending",
  },
  {
    id: "5",
    date: "2023-07-06",
    amount: 130000,
    type: "Withdrawal",
    status: "Completed",
  },
];

const Dashboard = () => {
  const { t, isRTL } = useLanguage();

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
            <div className="text-2xl font-bold">155,000,000 SYP</div>
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
            <div className="text-2xl font-bold">85,500,000 SYP</div>
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
            <div className="text-2xl font-bold">69,500,000 SYP</div>
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
            <div className="text-2xl font-bold">1,245</div>
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
            <div className="text-2xl font-bold">1 USD = 13,250 SYP</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("app.recent.transactions")}</CardTitle>
          <Button variant="outline" size="sm" className="h-8">
            <Eye className="mr-2 h-4 w-4" />
            {t("app.view.all")}
          </Button>
        </CardHeader>
        <CardContent>
          {mockTransactions.length > 0 ? (
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
                  {mockTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{transaction.date}</td>
                      <td className="py-3 px-4 text-right">
                        {transaction.amount.toLocaleString()} SYP
                      </td>
                      <td className="py-3 px-4">{transaction.type}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
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
