"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, LogIn, LogOut, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { login, register, logout, getCurrentUser } from "@/lib/appwrite";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export function AuthDialog() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const checkCurrentUser = async () => {
    const { success, data } = await getCurrentUser();
    if (success) {
      setUser(data);
    }
  };

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        const { success, error } = await register(
          values.email,
          values.password,
          values.name || ""
        );
        if (success) {
          toast({
            title: "Account created successfully",
            description: "Welcome to Sendelly!",
          });
          setIsOpen(false);
          await checkCurrentUser();
          form.reset();
        } else {
          toast({
            variant: "destructive",
            title: "Error creating account",
            description: error.message,
          });
        }
      } else {
        const { success, error } = await login(values.email, values.password);
        if (success) {
          toast({
            title: "Logged in successfully",
            description: "Welcome back!",
          });
          setIsOpen(false);
          await checkCurrentUser();
          form.reset();
        } else {
          toast({
            variant: "destructive",
            title: "Error logging in",
            description: error.message,
          });
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { success, error } = await logout();
      if (success) {
        toast({
          title: "Logged out successfully",
          description: "See you soon!",
        });
        setUser(null);
      } else {
        toast({
          variant: "destructive",
          title: "Error logging out",
          description: error?.message || "Failed to logout",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          <span className="text-sm text-white/80">
            Hello, {user.name || user.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            className="rounded-full border-white/25 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Logout
          </Button>
        </>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-white/25 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl border border-white/50 bg-gray-300/20 backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle className="text-white/90">
                {isSignUp ? "Create an account" : "Welcome back"}
              </DialogTitle>
              <DialogDescription className="text-white/60">
                {isSignUp
                  ? "Enter your details to create a new account"
                  : "Enter your credentials to login"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {isSignUp && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="border-white/25 bg-white/10 text-white placeholder:text-white/50"
                            placeholder="John Doe"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="border-white/25 bg-white/10 text-white placeholder:text-white/50"
                          placeholder="example@email.com"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="border-white/25 bg-white/10 text-white placeholder:text-white/50"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl border border-white/25 bg-[#f7a372] text-white hover:bg-[#fdd3b8]"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSignUp ? (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      form.reset();
                    }}
                    className="text-white/60 hover:text-white"
                  >
                    {isSignUp
                      ? "Already have an account? Login"
                      : "Don't have an account? Sign Up"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}