
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoaderCircle, Zap } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const { firebaseUser, loading: authLoading } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  useEffect(() => {
    if (!authLoading && firebaseUser) {
      router.push('/');
    }
  }, [authLoading, firebaseUser, router]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      toast({
        title: 'Firebase Not Configured',
        description: "Your Firebase API Key is missing. Please make sure your .env file is correct and restart the app.",
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      if (activeTab === 'signin') {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({ title: 'Welcome Back!', description: 'You have been successfully signed in.' });
        router.push('/');
      } else {
        await createUserWithEmailAndPassword(auth, data.email, data.password);
        toast({ title: 'Account Created!', description: "Welcome to EnergySync! Let's set up your profile." });
        router.push('/'); // Will be redirected to setup if display name is missing
      }
    } catch (error: any) {
      console.error(`${activeTab} error:`, error);
      let description = "An unexpected error occurred. Please try again.";

      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          description = "Invalid email or password. Please check your credentials and try again.";
          break;
        case 'auth/email-already-in-use':
          description = "This email address is already in use. Please sign in or use a different email.";
          break;
        case 'auth/operation-not-allowed':
          description = "Email/Password sign-in is not enabled for this project. Please enable it in your Firebase console under Authentication > Sign-in method.";
          break;
        case 'auth/network-request-failed':
            description = "A network error occurred. Please check your internet connection.";
            break;
        case 'auth/api-key-not-valid':
            description = "The Firebase API Key is not valid. Please copy the credentials from your Firebase project settings into the .env file.";
            break;
        default:
          if (error.message && (error.message.includes('auth/unauthorized-domain') || error.message.includes('authorized-domain'))) {
              description = "This app's domain is not authorized for authentication. Please add it to the 'Authorized domains' list in your Firebase Authentication settings.";
          } else {
              description = "An unknown error occurred. Please check your Firebase project configuration and ensure it's set up correctly.";
          }
          break;
      }

      toast({
        title: 'Authentication Failed',
        description: description,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading || firebaseUser) {
    return (
      <main className="min-h-dvh bg-background flex items-center justify-center p-4">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                <Zap className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="text-2xl">Welcome to EnergySync!</CardTitle>
          <CardDescription>
            Sign in or create an account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
