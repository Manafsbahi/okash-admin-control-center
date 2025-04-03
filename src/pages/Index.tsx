
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-okash-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-gray-600">Loading OKash Management System...</p>
      </div>
    </div>
  );
};

export default Index;
