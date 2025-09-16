import { createFileRoute } from "@tanstack/react-router";
import {
	Button,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
} from "ui";
import DashboardLayout from "@/components/layout/dashboard";
import { zodResolver } from "@hookform/resolvers/zod"
import { RequireAuth } from "@/lib/auth";
import { RequireWorkspace } from "@/lib/workspace";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const Route = createFileRoute("/workspace/$workspaceId/compose")({
	component: AuthComponent,
});

function AuthComponent() {
	const { workspaceId } = Route.useParams();
	return (
		<RequireAuth>
			<RequireWorkspace workspaceId={workspaceId}>
				<ComposeEmail workspaceId={workspaceId} />
			</RequireWorkspace>
		</RequireAuth>
	);
}

const schema = z.object({
	to: z.email({ message: "Invalid email address" }),
	cc: z.string().optional(),
	bcc: z.string().optional(),
	subject: z.string().min(1, { message: "Subject is required" }),
	body: z.string().min(1, { message: "Body is required" }),
})

function ComposeEmail({ workspaceId }: { workspaceId: string }) {
	const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      bcc: "",
	  cc: "",
	  to: "",
	  subject: "",
	  body: ""
    },
  })


  function onSubmit(values: z.infer<typeof schema>) {
    console.log(values)
  }

		return (
			<DashboardLayout workspaceId={workspaceId} showNav={false}>
				<h2 className="text-lg">Compose new Email</h2>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)}>
								<FormField
									name="to"
									render={({ field }) => (
										<FormItem>
											<FormLabel>To</FormLabel>
											<FormControl>
												<Input placeholder="Enter recipient email" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									name="cc"
									render={({ field }) => (
										<FormItem>
											<FormLabel>CC</FormLabel>
											<FormControl>
												<Input placeholder="Enter CC emails (optional)" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									name="bcc"
									render={({ field }) => (
										<FormItem>
											<FormLabel>BCC</FormLabel>
											<FormControl>
												<Input placeholder="Enter BCC emails (optional)" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									name="subject"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Subject</FormLabel>
											<FormControl>
												<Input placeholder="Enter subject" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									name="body"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Body</FormLabel>
											<FormControl>
												<textarea placeholder="Enter email body" rows={8} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit">Send Email</Button>
							</form>
						</Form>
			</DashboardLayout>
		);
}
