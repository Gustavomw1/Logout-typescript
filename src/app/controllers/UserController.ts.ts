import { Request, Response, Router } from "express";
import { AppDataSource } from "../../database/data-source";

const db = AppDataSource;

const userRouter = Router();

//Ver usuarios
userRouter.get("/profile", async (_req: Request, res: Response) => {
  try {
    const result = await db.query("SELECT * FROM users;");
    return res.status(200).json({ result });
  } catch (erro) {
    return res
      .status(500)
      .json({ mensagem: "Erro ao buscar perfis de usuário" });
  }
});

//Cadastrar usuario
userRouter.post("/register", async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: "Email e senha são obrigatórios" });
  }

  try {
    const query = "INSERT INTO users (email, senha) VALUES (?, ?)";
    const result = await db.query(query, [email, senha]);

    return res
      .status(201)
      .json({ mensagem: `Usuário criado com sucesso! ID: ${result}` });
  } catch (erro) {
    return res.status(500).json({ mensagem: "Erro ao cadastrar usuário" });
  }
});

export default userRouter;
