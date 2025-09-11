import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export function ContextPanel() {
  return (
    <div className="flex h-full flex-col p-4 space-y-4 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            <span>Context</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This panel will show contextual information, such as retrieved documents, when available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
