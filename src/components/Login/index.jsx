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
      const nameInput = document.querySelectorAll(".registerInput")[0];
      createErrorMessage(nameInput);
    }

    if(!email) {
      const emailInput = document.querySelectorAll(".registerInput")[1];
      createErrorMessage(emailInput);
    }

    if(!password) {
      const passwordInput = document.querySelectorAll(".registerInput")[2];
      createErrorMessage(passwordInput);
    }

    if(name != "" && email != "" && password != "") {
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
      const emailInput = document.querySelectorAll(".loginInput")[0];
      createErrorMessage(emailInput);
    }

    if(!password) {
      const passwordInput = document.querySelectorAll(".loginInput")[1];
      createErrorMessage(passwordInput);
    }

    if(email != "" && password != "") {
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
            user => user.email === email && user.password === password
          );

          if(!user) {
            createNotification("Email ou senha incorretos");
            return;
          }

          user.admin = false;
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
      for(let div of ErrorMessage) {
        div.remove();
      }

      if(registerInputs) {
        for(let div of registerInputs) {
          div.style.borderBottom = `1px solid black`;
        }
      }

      if(loginInputs) {
        for(let div of loginInputs) {
          div.style.borderBottom = `1px solid black`;
        }
      }
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
      // usuário já logado, não precisa abrir login
      const modal = document.querySelector(".modal-login");
      if(modal) modal.close();
    }
  }, []);

  useEffect(() => {
    const modal = document.querySelector("dialog .buttonClose");
    if(modal) {
      modal.addEventListener("click", () => {
        setAccount(true);
        resetInputs();
      });
    }
  }, []);

  useEffect(() => {
    const nameInput = document.querySelectorAll(".registerInput")[0];
    if(nameInput) {
      removeErrorMessage(nameInput);
    }
  }, [ name ]); 

  useEffect(() => {
    const emailInputRegister = document.querySelectorAll(".registerInput")[1];
    const emailInputLogin = document.querySelectorAll(".loginInput")[0];

    if(emailInputRegister) {
      removeErrorMessage(emailInputRegister);
    }

    if(emailInputLogin) {
      removeErrorMessage(emailInputLogin);
    }
  }, [ email ]);

  useEffect(() => {
    const passwordInputRegister = document.querySelectorAll(".registerInput")[2];
    const passwordInputLogin = document.querySelectorAll(".loginInput")[1];

    if(passwordInputRegister) {
      removeErrorMessage(passwordInputRegister);
    }

    if(passwordInputLogin) {
      removeErrorMessage(passwordInputLogin);
    }
  }, [ password ]);

  useEffect(() => {
    const registerInputs = document.querySelectorAll(".registerInput");
    const loginInputs = document.querySelectorAll(".loginInput");

    if(registerInputs.length > 0) {
      const nameInput = document.querySelector(".name input");
      if(nameInput) nameInput.value = name;
    }

    if(registerInputs.length > 0 || loginInputs.length > 0) {
      const emailInput = document.querySelector(".email input");
      const passInput = document.querySelector(".password input");

      if(emailInput) emailInput.value = email;
      if(passInput) passInput.value = password;
    }
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
            <Button title="criar uma conta"  onClick={ navigateSignUp } />
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