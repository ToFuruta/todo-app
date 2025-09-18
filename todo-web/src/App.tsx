import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type Todo = { id: number; text: string; done: boolean };

const API = "http://localhost:3001";

export default function App() {
  const qc = useQueryClient();
  const [text, setText] = useState("");

  const todosQ = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/todos`);
      return (await res.json()) as Todo[];
    },
  });

  const createM = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`${API}/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const toggleM = useMutation({
    mutationFn: async (todo: Todo) => {
      await fetch(`${API}/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !todo.done }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const deleteM = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${API}/api/todos/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  return (
    <div
      style={{ maxWidth: 480, margin: "40px auto", fontFamily: "system-ui" }}
    >
      <h1>Todo</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          createM.mutate(text.trim());
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="やること..."
          style={{ padding: 8, width: 320 }}
        />
        <button style={{ marginLeft: 8 }}>追加</button>
      </form>

      <div style={{ marginTop: 24 }}>
        {todosQ.isLoading ? (
          <div>読み込み中...</div>
        ) : (
          todosQ.data?.map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggleM.mutate(t)}
              />
              <span
                style={{ textDecoration: t.done ? "line-through" : "none" }}
              >
                {t.text}
              </span>
              <button
                onClick={() => deleteM.mutate(t.id)}
                style={{ marginLeft: "auto" }}
              >
                削除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
