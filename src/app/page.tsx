import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: casinos, error } = await supabase
    .from("casinos")
    .select("id, name, status");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">WagerLayer</h1>

      {error ? (
        <p className="text-red-600">Supabase connection failed: {error.message}</p>
      ) : (
        <p>Supabase connected. Casinos found: {casinos.length}</p>
      )}
    </main>
  );
}