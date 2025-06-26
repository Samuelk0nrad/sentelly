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
import { login, register, logout, getCurrentUser } from "@/lib/client/appwrite";

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
          values.name || "",
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
            description: error?.message ?? "",
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
            description: error?.message ?? "",
          });
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message ?? "An unexpected error occurred",
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
          description: error?.message ?? "Failed to logout",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message ?? "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1 md:gap-2">
      {user ? (
        <>
          <span className="hidden text-xs text-white/80 sm:inline md:text-sm">
            Hello, {user.name || user.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            className="h-8 rounded-full border-white/25 bg-white/10 px-2 text-xs text-white/80 hover:bg-white/20 hover:text-white md:h-9 md:px-3 md:text-sm"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin md:h-4 md:w-4" />
            ) : (
              <LogOut className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
            )}
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Out</span>
          </Button>
        </>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-white/25 bg-white/10 px-2 text-xs text-white/80 hover:bg-white/20 hover:text-white md:h-9 md:px-3 md:text-sm"
            >
              <LogIn className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
              Login
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 max-w-sm rounded-2xl border border-white/50 bg-gray-300/20 backdrop-blur-2xl md:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg text-white/90 md:text-xl">
                {isSignUp ? "Create an account" : "Welcome back"}
              </DialogTitle>
              <DialogDescription className="text-sm text-white/60 md:text-base">
                {isSignUp
                  ? "Enter your details to create a new account"
                  : "Enter your credentials to login"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 md:space-y-4"
              >
                {isSignUp && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-white/80 md:text-base">
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-9 border-white/25 bg-white/10 text-sm text-white placeholder:text-white/50 md:h-10 md:text-base"
                            placeholder="John Doe"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400 md:text-sm" />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-white/80 md:text-base">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="h-9 border-white/25 bg-white/10 text-sm text-white placeholder:text-white/50 md:h-10 md:text-base"
                          placeholder="example@email.com"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-400 md:text-sm" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-white/80 md:text-base">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="h-9 border-white/25 bg-white/10 text-sm text-white placeholder:text-white/50 md:h-10 md:text-base"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-400 md:text-sm" />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-9 w-full rounded-xl border border-white/25 bg-[#f7a372] text-sm text-white hover:bg-[#fdd3b8] md:h-10 md:text-base"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin md:h-4 md:w-4" />
                    ) : isSignUp ? (
                      <>
                        <UserPlus className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                        Sign Up
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
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
                    className="text-xs text-white/60 hover:text-white md:text-sm"
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
