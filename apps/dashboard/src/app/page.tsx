import { Button } from "ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "ui/tooltip";

export default function HomePage() {
  return (
    <div className="flex h-screen">
      
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Inbox</h1>
          <Button>New Email</Button>
        </div>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Business Inquirer</CardTitle>
          </CardHeader>
          <CardContent>
            <p>I want to acquire your business.</p>
          </CardContent>
        </Card>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
