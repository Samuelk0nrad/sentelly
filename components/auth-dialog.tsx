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
import { trackActivity, PerformanceTracker } from "@/lib/utils/activity-tracker";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

export function AuthDialog() {
  console.log("AuthDialog component rendering");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  console.log("AuthDialog state:", { isLoading, isSignUp, isOpen, user });

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
    console.log("onSubmit called with values:", values);
    console.log("isSignUp:", isSignUp);

    // Manual validation for signup mode
    if (isSignUp && (!values.name || values.name.length < 2)) {
      form.setError("name", {
        type: "manual",
        message: "Name must be at least 2 characters",
      });
      return;
    }

    const performanceTracker = new PerformanceTracker();
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { success, error } = await register(
          values.email,
          values.password,
          values.name || "",
        );
        const responseTime = performanceTracker.end();
        
        if (success) {
          toast({
            title: "Account created successfully",
            description: "Welcome to Sentelly!",
          });
          setIsOpen(false);
          await checkCurrentUser();
          form.reset();

          // Track successful registration
          await trackActivity({
            user_email: values.email,
            activity_type: "user_registration",
            response_source: "database",
            response_time_ms: responseTime,
            success: true,
            metadata: {
              registration_method: "email_password",
            },
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error creating account",
            description: error?.message ?? "",
          });

          // Track failed registration
          await trackActivity({
            user_email: values.email,
            activity_type: "user_registration",
            response_source: "error",
            response_time_ms: responseTime,
            success: false,
            error_message: error?.message ?? "Registration failed",
          });
        }
      } else {
        console.log("Attempting login with:", values.email);
        const { success, error } = await login(values.email, values.password);
        const responseTime = performanceTracker.end();
        
        console.log("Login result:", { success, error });
        if (success) {
          toast({
            title: "Logged in successfully",
            description: "Welcome back!",
          });
          setIsOpen(false);
          await checkCurrentUser();
          form.reset();

          // Track successful login
          await trackActivity({
            user_email: values.email,
            activity_type: "user_login",
            response_source: "database",
            response_time_ms: responseTime,
            success: true,
            metadata: {
              login_method: "email_password",
            },
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error logging in",
            description: error?.message ?? "",
          });

          // Track failed login
          await trackActivity({
            user_email: values.email,
            activity_type: "user_login",
            response_source: "error",
            response_time_ms: responseTime,
            success: false,
            error_message: error?.message ?? "Login failed",
          });
        }
      }
    } catch (error: any) {
      const responseTime = performanceTracker.end();
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message ?? "An unexpected error occurred",
      });

      // Track unexpected error
      await trackActivity({
        user_email: values.email,
        activity_type: isSignUp ? "user_registration" : "user_login",
        response_source: "error",
        response_time_ms: responseTime,
        success: false,
        error_message: error?.message ?? "Unexpected error",
        metadata: {
          error_type: "unexpected_error",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const performanceTracker = new PerformanceTracker();
    setIsLoading(true);
    
    try {
      const { success, error } = await logout();
      const responseTime = performanceTracker.end();
      
      if (success) {
        toast({
          title: "Logged out successfully",
          description: "See you soon!",
        });
        setUser(null);

        // Track successful logout
        await trackActivity({
          user_id: user?.id,
          user_email: user?.email,
          activity_type: "user_login", // Using login type for logout as well
          response_source: "database",
          response_time_ms: responseTime,
          success: true,
          metadata: {
            action: "logout",
          },
        });
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
    <div className="flex items-center gap-1 sm:gap-2">
      {user ? (
        <>
          <span className="hidden max-w-24 truncate text-xs text-white/80 sm:inline sm:max-w-32 sm:text-sm md:max-w-none">
            Hello, {user.name || user.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            className="h-7 rounded-full border-white/25 bg-white/10 px-2 text-xs text-white/80 hover:bg-white/20 hover:text-white sm:h-8 sm:px-3 sm:text-sm md:h-9"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
            ) : (
              <LogOut className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="xs:inline hidden sm:hidden md:inline">Logout</span>
            <span className="xs:hidden sm:inline md:hidden">Out</span>
          </Button>
        </>
      ) : (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              console.log("Direct button click test", e);
              setIsOpen(true);
            }}
            className="h-7 rounded-full border-white/25 bg-white/10 px-2 text-xs text-white/80 hover:bg-white/20 hover:text-white sm:h-8 sm:px-3 sm:text-sm md:h-9"
          >
            <LogIn className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            Login
          </Button>

          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              console.log("Dialog open state changing to:", open);
              setIsOpen(open);
            }}
          >
            <DialogContent className="mx-2 max-w-xs rounded-xl border border-white/50 bg-gray-300/20 backdrop-blur-2xl sm:mx-4 sm:max-w-sm sm:rounded-2xl md:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base text-white/90 sm:text-lg md:text-xl">
                  {isSignUp ? "Create an account" : "Welcome back"}
                </DialogTitle>
                <DialogDescription className="text-xs text-white/60 sm:text-sm md:text-base">
                  {isSignUp
                    ? "Enter your details to create a new account"
                    : "Enter your credentials to login"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    console.log("Form submit event triggered", e);
                    console.log("Form errors:", form.formState.errors);
                    console.log("Form values:", form.getValues());
                    console.log("Form isValid:", form.formState.isValid);
                    form.handleSubmit(onSubmit)(e);
                  }}
                  className="space-y-3 sm:space-y-4"
                >
                  {isSignUp && (
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-white/80 sm:text-sm md:text-base">
                            Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-8 border-white/25 bg-white/10 text-xs text-white placeholder:text-white/50 sm:h-9 sm:text-sm md:h-10 md:text-base"
                              placeholder="John Doe"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-400" />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-white/80 sm:text-sm md:text-base">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="h-8 border-white/25 bg-white/10 text-xs text-white placeholder:text-white/50 sm:h-9 sm:text-sm md:h-10 md:text-base"
                            placeholder="example@email.com"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-white/80 sm:text-sm md:text-base">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            className="h-8 border-white/25 bg-white/10 text-xs text-white placeholder:text-white/50 sm:h-9 sm:text-sm md:h-10 md:text-base"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-400" />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      onClick={() => {
                        console.log(
                          "Submit button clicked, form state:",
                          form.formState,
                        );
                        console.log(
                          "Form errors before submit:",
                          form.formState.errors,
                        );
                        console.log("Current form values:", form.getValues());
                        console.log("isSignUp mode:", isSignUp);
                      }}
                      className="h-8 w-full rounded-xl border border-white/25 bg-[#f7a372] text-xs text-white hover:bg-[#fdd3b8] sm:h-9 sm:text-sm md:h-10 md:text-base"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
                      ) : isSignUp ? (
                        <>
                          <UserPlus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                          Sign Up
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
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
                      className="text-xs text-white/60 hover:text-white sm:text-sm"
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
        </div>
      )}
    </div>
  );
}