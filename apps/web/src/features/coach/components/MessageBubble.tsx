import { cn } from "@/lib/utils";

export function MessageBubble({ role, content }: { role: "USER" | "ASSISTANT"; content: string }) {
  const isUser = role === "USER";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] whitespace-pre-wrap rounded-lg px-3 py-2 text-body",
          isUser ? "bg-brand text-brand-foreground" : "bg-surface text-text-primary",
        )}
      >
        {content}
      </div>
    </div>
  );
}
