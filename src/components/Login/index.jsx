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

  // CADASTRO
  async function handleSignUp() {
    if(!name) {
      const input = document.querySelectorAll(".registerInput")[0];
      if(input) createErrorMessage(input);
    }

    if(!email) {
      const input = document.querySelectorAll(".registerInput")[1];
      if(input) createErrorMessage(input);
    }

    if(!password) {
      const input = document.querySelectorAll(".registerInput")[2];
      if(input) createErrorMessage(input);
    }

    if(name !== "" && email !== "" && password !== "") {
      try {
        const users = JSON.parse(localStorage.getItem("users")) || [];

        const userExists = users.find(user => user.email === email);

        if(userExists) {
          createNotification("Email já cadastrado");
          return;
        }

        const newUser = {
          name,
          email,
          password,
          orders: [],
          admin: false
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        createNotification("Usuário cadastrado com sucesso :)");
        setAccount(true);

      } catch(error) {
        createNotification("Erro ao cadastrar usuário");
      }
    }
  }

  // LOGIN
  async function handleSignIn() {
    if(!email) {
      const input = document.querySelectorAll(".loginInput")[0];
      if(input) createErrorMessage(input);
    }

    if(!password) {
      const input = document.querySelectorAll(".loginInput")[1];
      if(input) createErrorMessage(input);
    }

    if(email !== "" && password !== "") {
      try {
        let user;

        // LOGIN ADMIN
        if(email === adminEmail && password === adminPassword) {
          user = {
            name: "Administrador",
            email: adminEmail,
            admin: true
          };
        } else {
          const users = JSON.parse(localStorage.getItem("users")) || [];

          user = users.find(
            u => u.email === email && u.password === password
          );

          if(!user) {
            createNotification("Email ou senha incorretos");
            return;
          }

          // garantir que não vira admin por erro
          user = { ...user, admin: false };
        }

        // SALVAR SESSÃO
        localStorage.setItem("userLogged", JSON.stringify(user));

        createNotification("Login realizado :)");

        if(window.innerWidth >= 1000) {
          const modal = document.querySelector(".modal-login");
          if(modal) modal.close();

          sessionStorage.removeItem("@zer01modas:modal");

          const nav = document.querySelector(".boxButtons .nav-menu");
          if(nav) nav.style.display = "none";
        } else {
          navigate("/");
        }

      } catch(error) {
        createNotification("Erro ao fazer login");
      }
    }
  }

  function resetInputs() {
    const registerInputs = document.querySelectorAll(".registerInput");
    const loginInputs = document.querySelectorAll(".loginInput");
    const ErrorMessage = document.querySelectorAll(".divMessage");

    if(ErrorMessage.length > 0) {
      ErrorMessage.forEach(div => div.remove());

      registerInputs.forEach(input => {
        input.style.borderBottom = `1px solid black`;
      });

      loginInputs.forEach(input => {
        input.style.borderBottom = `1px solid black`;
      });
    }
  }

  function navigateSignIn() {
    setAccount(true);
    resetInputs();
  }

  function navigateSignUp() {
    setAccount(false);
    resetInputs();
  }

  // MANTER USUÁRIO LOGADO
  useEffect(() => {
    const userLogged = JSON.parse(localStorage.getItem("userLogged"));

    if(userLogged) {
      const modal = document.querySelector(".modal-login");
      if(modal) modal.close();
    }
  }, []);

  useEffect(() => {
    const modal = document.querySelector("dialog .buttonClose");

    if(modal) {
      const handler = () => {
        setAccount(true);
        resetInputs();
      };

      modal.addEventListener("click", handler);

      return () => modal.removeEventListener("click", handler);
    }
  }, []);

  useEffect(() => {
    const input = document.querySelectorAll(".registerInput")[0];
    if(input) removeErrorMessage(input);
  }, [ name ]);

  useEffect(() => {
    const register = document.querySelectorAll(".registerInput")[1];
    const login = document.querySelectorAll(".loginInput")[0];

    if(register) removeErrorMessage(register);
    if(login) removeErrorMessage(login);
  }, [ email ]);

  useEffect(() => {
    const register = document.querySelectorAll(".registerInput")[2];
    const login = document.querySelectorAll(".loginInput")[1];

    if(register) removeErrorMessage(register);
    if(login) removeErrorMessage(login);
  }, [ password ]);

  useEffect(() => {
    const nameInput = document.querySelector(".name input");
    const emailInput = document.querySelector(".email input");
    const passInput = document.querySelector(".password input");

    if(nameInput) nameInput.value = name;
    if(emailInput) emailInput.value = email;
    if(passInput) passInput.value = password;

  }, [ account ]);

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