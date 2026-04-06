import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createErrorMessage, removeErrorMessage, removeAlertMessage } from "../../scripts/messages-inputs.js";
import { createNotification } from "../../scripts/notifications.js";

import { Input } from "../Input";
import { Button } from "../../components/Button";

import { Container } from "./style";

export function Login() {
  const [ account, setAccount ] = useState(true);
  const [ name, setName ] = useState("");
  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");

  const navigate = useNavigate();

  const adminEmail = "babybarbara083@gmail.com";
  const adminPassword = "anjonegro21";

  // ================= CADASTRO =================
  async function handleSignUp() {
    if(!name) createErrorMessage(document.querySelectorAll(".registerInput")[0]);
    if(!email) createErrorMessage(document.querySelectorAll(".registerInput")[1]);
    if(!password) createErrorMessage(document.querySelectorAll(".registerInput")[2]);

    if(name && email && password) {
      try {
        const users = JSON.parse(localStorage.getItem("users")) || [];

        if(users.find(user => user.email === email)) {
          createNotification("Email já cadastrado");
          return;
        }

        const newUser = { name, email, password, orders: [], admin: false };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        createNotification("Usuário cadastrado com sucesso :)");
        setAccount(true);

      } catch {
        createNotification("Erro ao cadastrar usuário");
      }
    }
  }

  // ================= LOGIN =================
  async function handleSignIn() {
    if(!email) createErrorMessage(document.querySelectorAll(".loginInput")[0]);
    if(!password) createErrorMessage(document.querySelectorAll(".loginInput")[1]);

    if(email && password) {
      try {
        let user;

        // ADMIN
        if(email === adminEmail && password === adminPassword) {
          user = {
            name: "Administrador",
            email: adminEmail,
            admin: true
          };
        } else {
          const users = JSON.parse(localStorage.getItem("users")) || [];

          user = users.find(u => u.email === email && u.password === password);

          if(!user) {
            createNotification("Email ou senha incorretos");
            return;
          }

          user.admin = false;
        }

        localStorage.setItem("userLogged", JSON.stringify(user));

        createNotification("Login realizado :)");

        navigate("/"); // 🔥 melhor que navigate(-1)

      } catch {
        createNotification("Erro ao fazer login");
      }
    }
  }

  // ================= MANTER LOGIN =================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userLogged"));
    if(user) navigate("/");
  }, []);

  // ================= RESTANTE (SEM MUDAR) =================
  function resetInputs() {
    document.querySelectorAll(".divMessage").forEach(e => e.remove());
  }

  function navigateSignIn() {
    setAccount(true);
    resetInputs();
  }

  function navigateSignUp() {
    setAccount(false);
    resetInputs();
  }

  useEffect(() => {
    removeAlertMessage();
  }, [ name, email, password ]);

  return (
    <Container>
      {
        account ?
        <div className="body-modal">
          <h3>Identificação</h3>

          <div className="form-modal">
            <div className="boxInput">
              <Input className="loginInput email" title="E-mail" onChange={e => setEmail(e.target.value)} />
              <Input className="loginInput password" title="Senha" type="password" onChange={e => setPassword(e.target.value)} />
            </div>

            <Button title="ENTRAR" onClick={ handleSignIn } />
            <Button title="criar uma conta" onClick={ navigateSignUp } />
          </div>
        </div>
        :
        <div className="body-modal">
          <h3>Nova conta</h3>

          <div className="form-modal">
            <div className="boxInput">
              <Input className="registerInput name" title="Nome" onChange={e => setName(e.target.value)} />
              <Input className="registerInput email" title="E-mail" onChange={e => setEmail(e.target.value)} />
              <Input className="registerInput password" title="Senha" type="password" onChange={e => setPassword(e.target.value)} />
            </div>

            <Button title="CADASTRAR" onClick={ handleSignUp } />
            <Button title="voltar" onClick={ navigateSignIn } />
          </div>
        </div>
      }
    </Container>
  )
}