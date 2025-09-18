import express from "express";
import cors from "cors";
import { z } from "zod";
import { prisma } from "./prisma";

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// スキーマ（型安全）
const CreateTodoZ = z.object({ text: z.string().min(1) });
const UpdateTodoZ = z.object({ done: z.boolean() });
const RenameTodoZ = z.object({ text: z.string().min(1) });

// 一覧
app.get("/api/todos", async (_req, res) => {
  const todos = await prisma.todo.findMany({ orderBy: { id: "desc" } });
  res.json(todos);
});

// 追加
app.post("/api/todos", async (req, res) => {
  const body = CreateTodoZ.parse(req.body);
  const todo = await prisma.todo.create({ data: { text: body.text } });
  res.json(todo);
});

// 完了/未完トグル
app.patch("/api/todos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const body = UpdateTodoZ.parse(req.body);
  await prisma.todo.update({ where: { id }, data: { done: body.done } });
  res.json({ ok: true });
});

// 文言変更
app.put("/api/todos/:id/text", async (req, res) => {
  const id = Number(req.params.id);
  const body = RenameTodoZ.parse(req.body);
  await prisma.todo.update({ where: { id }, data: { text: body.text } });
  res.json({ ok: true });
});

// 削除
app.delete("/api/todos/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.todo.delete({ where: { id } });
  res.json({ ok: true });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
