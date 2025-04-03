
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PermissionCheckProps {
  permissionError: string | null;
  returnPath?: string;
}

const PermissionCheck: React.FC<PermissionCheckProps> = ({ 
  permissionError, 
  returnPath = '/dashboard' 
}) => {
  const navigate = useNavigate();

  if (!permissionError) return null;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Alert variant="destructive" className="max-w-md mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Permission Denied</AlertTitle>
        <AlertDescription>{permissionError}</AlertDescription>
      </Alert>
      
      <Button variant="default" onClick={() => navigate(returnPath)}>
        Return to {returnPath === '/customers' ? 'Customers' : returnPath === '/dashboard' ? 'Dashboard' : 'Previous Page'}
      </Button>
    </div>
  );
};

export default PermissionCheck;
