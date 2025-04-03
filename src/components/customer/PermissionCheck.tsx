
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PermissionCheckProps {
  permissionError: string | null;
}

const PermissionCheck: React.FC<PermissionCheckProps> = ({ permissionError }) => {
  const navigate = useNavigate();

  if (!permissionError) return null;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="text-red-500 mb-4">{permissionError}</div>
      <Button variant="outline" onClick={() => navigate('/customers')}>
        Return to Customers
      </Button>
    </div>
  );
};

export default PermissionCheck;
