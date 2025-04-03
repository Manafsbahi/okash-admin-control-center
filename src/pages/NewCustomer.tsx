import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const personalAccountSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  mother_name: z.string().optional(),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  birthdate: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  nationality: z.string().optional(),
  id_type: z.enum(["passport", "national_id", "residence_permit"]).optional(),
  id_number: z.string().optional(),
  address: z.string().optional(),
  account_type: z.literal("personal"),
});

const businessAccountSchema = personalAccountSchema.extend({
  business_name: z.string().min(3, { message: "Business name is required" }),
  business_registration: z.string().min(3, { message: "Registration number is required" }),
  business_address: z.string().min(3, { message: "Business address is required" }),
  account_type: z.literal("business"),
});

const NewCustomer = () => {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const [accountType, setAccountType] = React.useState<"personal" | "business">("personal");

  const personalForm = useForm<z.infer<typeof personalAccountSchema>>({
    resolver: zodResolver(personalAccountSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
      account_type: "personal",
    },
  });

  const businessForm = useForm<z.infer<typeof businessAccountSchema>>({
    resolver: zodResolver(businessAccountSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
      account_type: "business",
      business_name: "",
      business_registration: "",
      business_address: "",
    },
  });

  // Check if employee can create customers
  if (employee?.role !== 'admin' && !employee?.permissions?.can_create_customer) {
    React.useEffect(() => {
      toast.error("You don't have permission to create new customers");
      navigate('/customers');
    }, [navigate]);
    return null;
  }

  // Generate account number
  const generateAccountNumber = (type: "personal" | "business") => {
    const prefix = type === "personal" ? "12" : "13";
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    return `${prefix}${randomDigits}`;
  };

  const onPersonalSubmit = async (values: z.infer<typeof personalAccountSchema>) => {
    try {
      const accountNumber = generateAccountNumber("personal");
      
      const { error } = await supabase.from('customers').insert({
        name: values.name,
        phone: values.phone,
        password: values.password,
        email: values.email || null,
        mother_name: values.mother_name || null,
        birthdate: values.birthdate || null,
        gender: values.gender || null,
        nationality: values.nationality || null,
        id_type: values.id_type || null,
        id_number: values.id_number || null,
        address: values.address || null,
        account_number: accountNumber,
        account_type: "personal",
        status: 'active',
        balance: 0,
        created_by: employee?.id
      });
      
      if (error) throw error;
      
      toast.success("Personal account created successfully");
      navigate('/customers');
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to create account");
    }
  };

  const onBusinessSubmit = async (values: z.infer<typeof businessAccountSchema>) => {
    try {
      const accountNumber = generateAccountNumber("business");
      
      const { error } = await supabase.from('customers').insert({
        name: values.name,
        phone: values.phone,
        password: values.password,
        email: values.email || null,
        mother_name: values.mother_name || null,
        birthdate: values.birthdate || null,
        gender: values.gender || null,
        nationality: values.nationality || null,
        id_type: values.id_type || null,
        id_number: values.id_number || null,
        address: values.address || null,
        business_name: values.business_name,
        business_registration: values.business_registration,
        business_address: values.business_address,
        account_number: accountNumber,
        account_type: "business",
        status: 'active',
        balance: 0,
        created_by: employee?.id
      });
      
      if (error) throw error;
      
      toast.success("Business account created successfully");
      navigate('/customers');
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to create account");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
        <h1 className="text-2xl font-bold">Create New Customer</h1>
      </div>

      <Tabs value={accountType} onValueChange={(value) => setAccountType(value as "personal" | "business")}>
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Personal Account</TabsTrigger>
          <TabsTrigger value="business">Business Account</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Account Information</CardTitle>
            </CardHeader>
            <Form {...personalForm}>
              <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={personalForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalForm.control}
                      name="mother_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mother's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Mother's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="+1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalForm.control}
                      name="birthdate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalForm.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalForm.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality</FormLabel>
                          <FormControl>
                            <Input placeholder="Nationality" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Identification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={personalForm.control}
                        name="id_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ID type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="passport">Passport</SelectItem>
                                <SelectItem value="national_id">National ID</SelectItem>
                                <SelectItem value="residence_permit">Residence Permit</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="id_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Number</FormLabel>
                            <FormControl>
                              <Input placeholder="ID Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={personalForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Full address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="ml-auto">Create Personal Account</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Business Account Information</CardTitle>
            </CardHeader>
            <Form {...businessForm}>
              <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)}>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Business Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={businessForm.control}
                        name="business_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Company Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={businessForm.control}
                        name="business_registration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Registration number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={businessForm.control}
                        name="business_address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Business Address *</FormLabel>
                            <FormControl>
                              <Input placeholder="Business address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Primary Contact Person</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={businessForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={businessForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+1234567890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={businessForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={businessForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={businessForm.control}
                        name="mother_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother's Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Mother's full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={businessForm.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationality</FormLabel>
                            <FormControl>
                              <Input placeholder="Nationality" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Identification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={businessForm.control}
                        name="id_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ID type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="passport">Passport</SelectItem>
                                <SelectItem value="national_id">National ID</SelectItem>
                                <SelectItem value="residence_permit">Residence Permit</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={businessForm.control}
                        name="id_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Number</FormLabel>
                            <FormControl>
                              <Input placeholder="ID Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={businessForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Personal Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Full address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="ml-auto">Create Business Account</Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewCustomer;
