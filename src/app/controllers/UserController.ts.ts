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

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios" });
  }

  try {
    const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const usuario = result.rows[0];
    const match = await bcrypt.compare(senha, usuario.senha);

    if (!match) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }

    const token = jwt.sign({ userId: usuario.id }, SECRET, { expiresIn: "5m" });
    return res
      .status(200)
      .json({ auth: true, token, mensagem: "Login bem-sucedido" });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao buscar usuário" });
  }
});

export default userRouter;
