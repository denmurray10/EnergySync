
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoaderCircle, Zap, ArrowLeft } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.34 2.06-4.1 2.06-4.92 0-8.92-4.02-8.92-8.92s4-8.92 8.92-8.92c2.5 0 4.3.96 5.72 2.3l2.2-2.2C18.48.96 15.82 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.1 0 12.04-4.92 12.04-12.04 0-.76-.08-1.52-.2-2.28H12.48z"/></svg>
);
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}><title>Facebook</title><path d="M23.998 12c0-6.628-5.372-12-11.999-12C5.372 0 0 5.372 0 12c0 5.988 4.388 10.954 10.124 11.854v-8.385H7.078v-3.47h3.046V9.356c0-3.007 1.792-4.669 4.532-4.669 1.312 0 2.688.235 2.688.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.61 22.954 24 17.988 24 12z"/></svg>
);
const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}><title>Apple</title><path d="M12.152 6.896c-.922 0-1.855.487-2.788.487-1.028 0-1.94-.52-3.11-.52-1.668 0-3.15.82-4.077 2.227-.962 1.46-.922 3.824.163 5.485 1.01 1.542 2.14.498 3.584.498 1.09 0 2.05-.566 2.924-.566.853 0 1.832.566 2.923.566 1.444 0 2.45-1.288 3.585-2.813.787-1.075 1.148-2.196 1.148-2.227a.26.26 0 0 0-.01-.01c-.139-.33-.633-.518-.633-.518s-.11.006-.325.006c-.21 0-1.12-.133-2.14-.133-1.444-.01-2.924.99-3.507.99-.546 0-1.668-.984-2.84-.984zm-2.028-4.384c.854-.99 1.668-2.512 1.48-4.04-.52 0-1.542.45-2.373 1.32C8.6 4.782 7.66 6.48 7.843 7.82c.6.03 1.623-.425 2.28-1.308z"/></svg>
);


const childLoginSchema = z.object({
  username: z.string().min(2, { message: 'Username must be at least 2 characters.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});
type ChildFormValues = z.infer<typeof childLoginSchema>;

const adultLoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});
type AdultFormValues = z.infer<typeof adultLoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('child');
  const { firebaseUser, loading: authLoading } = useAuth();

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const childForm = useForm<ChildFormValues>({
    resolver: zodResolver(childLoginSchema),
    defaultValues: { username: '', password: '' },
  });

  const adultForm = useForm<AdultFormValues>({
    resolver: zodResolver(adultLoginSchema),
    defaultValues: { email: '', password: '' },
  });
  
  useEffect(() => {
    if (!authLoading && firebaseUser) {
      router.push('/');
    }
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    // This effect handles the auto-login after signup
    if (!authLoading && !firebaseUser) {
      const autoLoginEmail = localStorage.getItem('energysync_autologin_email');
      const autoLoginPassword = localStorage.getItem('energysync_autologin_password');
      if (autoLoginEmail && autoLoginPassword) {
        setLoading(true);
        signInWithEmailAndPassword(auth, autoLoginEmail, autoLoginPassword)
          .then(() => {
            localStorage.removeItem('energysync_autologin_email');
            localStorage.removeItem('energysync_autologin_password');
            toast({ title: 'Welcome!', description: 'You have been successfully signed in.' });
            // The main useEffect will handle the redirect now
          })
          .catch(handleLoginError)
          .finally(() => setLoading(false));
      }
    }
  }, [authLoading, firebaseUser]);


  const handleLoginError = (error: any) => {
      let description = "An unexpected error occurred. Please try again.";
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          description = "Invalid credentials. Please check your details and try again.";
          break;
        case 'auth/operation-not-allowed':
          description = "This sign-in method is not enabled. Please contact support.";
          break;
        case 'auth/network-request-failed':
            description = "A network error occurred. Please check your internet connection.";
            break;
        case 'auth/api-key-not-valid':
            description = "The Firebase API Key is not valid. Please check your configuration.";
            break;
        default:
          description = "An unknown error occurred. Please check your project configuration.";
          break;
      }
      toast({ title: 'Authentication Failed', description, variant: 'destructive' });
  }

  const onChildSubmit = async (data: ChildFormValues) => {
    setLoading(true);
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
        toast({ title: "Configuration Error", description: "Firebase Project ID is not set.", variant: "destructive" });
        setLoading(false);
        return;
    }
    const email = `${data.username.toLowerCase().trim()}@${projectId}.fake-user.com`;
    try {
        await signInWithEmailAndPassword(auth, email, data.password);
        toast({ title: 'Welcome Back!', description: 'You have been successfully signed in.' });
    } catch (error) {
        handleLoginError(error);
    } finally {
        setLoading(false);
    }
  };

  const onAdultSubmit = async (data: AdultFormValues) => {
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({ title: 'Welcome Back!', description: 'You have been successfully signed in.' });
    } catch (error) {
        handleLoginError(error);
    } finally {
        setLoading(false);
    }
  };
  
  const handleSocialLogin = (provider: string) => {
      toast({
          title: "Feature Coming Soon",
          description: `${provider} login is not yet available.`,
      });
  }

  const handleChildPasswordHelp = () => {
    toast({
        title: "Ask a Grown-up for Help",
        description: "Your parent or guardian can help you reset your password from their Parent Dashboard.",
    });
  }

  const handleSendResetEmail = async () => {
    if (!resetEmail) {
      toast({ title: "Email Required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({ title: "Password Reset Email Sent", description: "Please check your inbox for a password reset link." });
      setIsResetDialogOpen(false);
      setResetEmail('');
    } catch (error: any) {
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/user-not-found') {
        description = "No user found with this email address.";
      }
      toast({ title: "Error sending reset email", description, variant: "destructive" });
    } finally {
      setIsSendingReset(false);
    }
  };

  if (authLoading || firebaseUser || loading) {
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
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>
            Please sign in to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="child">Child</TabsTrigger>
              <TabsTrigger value="adult">Adult</TabsTrigger>
            </TabsList>
            <TabsContent value="child" className="pt-6">
                 <Form {...childForm}>
                    <form onSubmit={childForm.handleSubmit(onChildSubmit)} className="space-y-6">
                        <FormField control={childForm.control} name="username" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl><Input placeholder="Your username" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={childForm.control} name="password" render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Password</FormLabel>
                                    <Button
                                        type="button"
                                        variant="link"
                                        size="sm"
                                        className="p-0 h-auto font-normal text-primary hover:text-primary/90"
                                        onClick={handleChildPasswordHelp}
                                    >
                                        Forgot password?
                                    </Button>
                                </div>
                                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </form>
                </Form>
            </TabsContent>
             <TabsContent value="adult" className="pt-6">
                <Form {...adultForm}>
                    <form onSubmit={adultForm.handleSubmit(onAdultSubmit)} className="space-y-6">
                        <FormField control={adultForm.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={adultForm.control} name="password" render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Password</FormLabel>
                                    <Button
                                        type="button"
                                        variant="link"
                                        size="sm"
                                        className="p-0 h-auto font-normal text-primary hover:text-primary/90"
                                        onClick={() => setIsResetDialogOpen(true)}
                                    >
                                        Forgot password?
                                    </Button>
                                </div>
                                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </form>
                </Form>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" onClick={() => handleSocialLogin('Google')}><GoogleIcon className="h-4 w-4" /></Button>
                    <Button variant="outline" onClick={() => handleSocialLogin('Facebook')}><FacebookIcon className="h-4 w-4" /></Button>
                    <Button variant="outline" onClick={() => handleSocialLogin('Apple')}><AppleIcon className="h-4 w-4" /></Button>
                </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="pt-0">
            <Button variant="outline" onClick={() => router.push('/welcome')} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Welcome
            </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Your Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the email address associated with your account, and we'll send you a link to reset your password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
              <Label htmlFor="reset-email" className="sr-only">Email</Label>
              <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={isSendingReset}
              />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSendingReset}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendResetEmail} disabled={isSendingReset}>
              {isSendingReset && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

    