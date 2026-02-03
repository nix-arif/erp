"use client";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
// import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
// import { uploadLogo } from "@/lib/upload-logo.client";

const formSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  logo: z.instanceof(File).refine((file) => file.type === "image/svg+xml", {
    message: "Logo must be an SVG file (.svg)",
  }),
});

const CreateOrganizationForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: undefined,
    },
  });

  const uploadLogo = async (file: File) => {
    if (file.type !== "image/svg+xml") {
      throw new Error("Only SVG files allowed");
    }

    // get signed URL
    const res = await fetch("/api/logo/upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename: file.name }),
    });

    // console.log(res);
    //   const { url, key } = await res.json();

    // upload file to R2
    //   const uploadRes = await fetch(url, {
    //     method: "PUT",
    //     headers: {
    //       "Content-Type": "image/svg+xml",
    //     },
    //     body: file,
    //   });

    //   if (!uploadRes.ok) {
    //     throw new Error("Upload to R2 failed");
    //   }

    //   return key;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      // 1️⃣ Upload SVG to R2
      const logoKey = await uploadLogo(values.logo);

      // 2️⃣ Store key in NeonDB
      //   await authClient.organization.create({
      //     name: values.name,
      //     slug: values.slug,
      //     logo: logoKey,
      //   });

      toast.success("Organization created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create organization");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create Organization</CardTitle>
          <CardDescription>Create your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="createOrganization-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Company Name</FieldLabel>
                    <Input
                      id="name"
                      {...field}
                      placeholder="Enter your company name"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="slug"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="slug">Slug</FieldLabel>
                    <Input
                      id="slug"
                      {...field}
                      placeholder="Enter your company slug"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="logo"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Logo</FieldLabel>
                    <Input
                      id="logo"
                      placeholder=""
                      type="file"
                      accept="image/svg+xml"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field>
            <Button type="submit" form="createOrganization-form">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Create Organization"
              )}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateOrganizationForm;
