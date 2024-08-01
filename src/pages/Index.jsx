import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const placeholderTransactions = [
  { id: 1, date: '2023-03-15', amount: 250, type: 'expense', category: 'Nike' },
  { id: 2, date: '2023-03-20', amount: 300, type: 'income', category: 'Adidas' },
  { id: 3, date: '2023-03-25', amount: 180, type: 'expense', category: 'Puma' },
];

const useTransactions = () => {
  const queryClient = useQueryClient();

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => Promise.resolve(placeholderTransactions),
  });

  const addTransaction = useMutation({
    mutationFn: (newTransaction) => {
      return Promise.resolve({ ...newTransaction, id: Date.now() });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['transactions'], (old) => [...old, data]);
    },
  });

  const updateTransaction = useMutation({
    mutationFn: (updatedTransaction) => {
      return Promise.resolve(updatedTransaction);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['transactions'], (old) =>
        old.map((t) => (t.id === data.id ? data : t))
      );
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: (id) => {
      return Promise.resolve(id);
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['transactions'], (old) =>
        old.filter((t) => t.id !== id)
      );
    },
  });

  return { transactions, addTransaction, updateTransaction, deleteTransaction };
};

const TransactionForm = ({ onSubmit, initialData = {} }) => {
  const form = useForm({
    defaultValues: initialData,
  });

  const handleSubmit = (data) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Nike">Nike</SelectItem>
                  <SelectItem value="Adidas">Adidas</SelectItem>
                  <SelectItem value="Puma">Puma</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

const Index = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleAddTransaction = (data) => {
    addTransaction.mutate(data);
  };

  const handleUpdateTransaction = (data) => {
    updateTransaction.mutate({ ...data, id: editingTransaction.id });
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    deleteTransaction.mutate(id);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Sneaker Side-Hustle Tracker</h1>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4"><Plus className="mr-2 h-4 w-4" /> Add Transaction</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm onSubmit={handleAddTransaction} />
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.date}</TableCell>
              <TableCell>${transaction.amount}</TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{transaction.category}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="mr-2" onClick={() => setEditingTransaction(transaction)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Transaction</DialogTitle>
                    </DialogHeader>
                    <TransactionForm onSubmit={handleUpdateTransaction} initialData={editingTransaction} />
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="icon" onClick={() => handleDeleteTransaction(transaction.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Index;
