import { Request, Response, Router } from "express";
import { AppDataSource } from "../../database/data-source";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const SECRET = "tools";

const db = AppDataSource;

const userRouter = Router();

//Ver usuarios
userRouter.get("/profile", async (_req: Request, res: Response) => {
  try {
    const result = await db.query("SELECT * FROM usuarios;");
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

  //Hasheando a senha
  const hashedPassword = await bcrypt.hash(senha, 10);

  if (!email || !senha) {
    return res.status(400).json({ mensagem: "Email e senha são obrigatórios" });
  }

  try {
    const query = "INSERT INTO usuarios (email, senha) VALUES ($1, $2)";
    const result = await db.query(query, [email, hashedPassword]);

    return res
      .status(201)
      .json({ mensagem: `Usuário criado com sucesso! ID: ${result.insertId}` });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao cadastrar usuário" });
  }
});

//Verificão JWT
function verifyJWT(req: Request, res: Response) {
  const token = req.headers["authorization"]?.split("")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  jwt.verify(token, SECRET, (error, result) => {
    if (error) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }
  });
}

//Logar usuario
userRouter.post("/login", async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  try {
    const result = db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    res.status(401).json({ erro: "erro ao buscar usuario" });
  } catch {
    res.status(201).json({ mensagem: "ok" });
  }
});

//Deletar usuario
userRouter.delete("/profile/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const result = await db.query("DELETE FROM usuarios WHERE id = $1", [id]);
    res.status(200).json({ mensagem: "Usuairo deletado com sucesso" });
  } catch {
    res.status(401).json({ erro: "erro ao deletar usuario" });
  }
});

export default userRouter;
