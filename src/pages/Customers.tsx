
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, UserPlus } from "lucide-react";

// Mock customer data
const mockCustomers = [
  {
    id: "1200000001",
    name: "Ahmad Mohammed",
    type: "Personal",
    balance: 1500000,
    status: "Active",
    createdAt: "2023-01-15",
  },
  {
    id: "1200000002",
    name: "Sara Ali",
    type: "Personal",
    balance: 750000,
    status: "Active",
    createdAt: "2023-02-20",
  },
  {
    id: "1300000001",
    name: "Al-Noor Trading Company",
    type: "Business",
    balance: 5200000,
    status: "Active",
    createdAt: "2023-03-05",
  },
  {
    id: "1200000003",
    name: "Layla Khoury",
    type: "Personal",
    balance: 320000,
    status: "Frozen",
    createdAt: "2023-04-10",
  },
  {
    id: "1300000002",
    name: "Damascus Textiles Ltd.",
    type: "Business",
    balance: 8700000,
    status: "Active",
    createdAt: "2023-05-15",
  },
];

const Customers = () => {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredCustomers = mockCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.id.includes(searchQuery)
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">{t("app.customers")}</h1>
        
        <Button className="bg-okash-accent hover:bg-okash-secondary">
          <UserPlus className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
          New Customer
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
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-right py-3 px-4">Balance (SYP)</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/50">
                    <td className="py-4 px-4">{customer.id}</td>
                    <td className="py-4 px-4">{customer.name}</td>
                    <td className="py-4 px-4">{customer.type}</td>
                    <td className="py-4 px-4 text-right">
                      {customer.balance.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          customer.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers;
