import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export default async function VictimMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 해당 피해자의 사건에 관심을 표명한 변호사 목록
  const { data: conversations } = await supabase
    .from("lawyer_interests")
    .select(`
      id,
      status,
      created_at,
      profiles!lawyer_interests_lawyer_id_fkey(full_name, law_firm),
      case_categories(name)
    `)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-bold text-navy-900">메시지</h2>

      {conversations && conversations.length > 0 ? (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <Card
              key={conv.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-navy-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 truncate">
                      {(conv.profiles as unknown as { full_name: string })?.full_name} 변호사
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {(conv.case_categories as unknown as { name: string })?.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground mt-4 font-medium">
              아직 메시지가 없습니다
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              변호사가 사건에 관심을 표명하면 대화할 수 있습니다
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
