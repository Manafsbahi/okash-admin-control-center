
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface UnderConstructionProps {
  pageName: string;
}

const UnderConstruction = ({ pageName }: UnderConstructionProps) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{pageName}</h1>
      
      <Card className="text-center py-12">
        <CardContent>
          <Construction className="mx-auto h-16 w-16 text-okash-primary opacity-50" />
          <h2 className="mt-4 text-xl font-medium text-okash-primary">Coming Soon</h2>
          <p className="mt-2 text-gray-500">
            We're currently working on this page. Check back soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnderConstruction;
