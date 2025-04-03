
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TransactionForm from '@/components/TransactionForm';

const CustomerDeposit = () => {
  const { id } = useParams<{ id: string }>();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, balance')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="text-center py-8 text-red-500">Customer not found</div>;
  }

  return (
    <TransactionForm
      customerId={customer.id}
      customerName={customer.name}
      balance={customer.balance}
      transactionType="deposit"
    />
  );
};

export default CustomerDeposit;
