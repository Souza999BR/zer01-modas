import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

export const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [ userData, setUserData ] = useState("");
  const [ isAdmin, setIsAdmin ] = useState(false);

  async function SignUp({ name, email, password }) {
    await api.post("/users", { name, email, password });
  }

  async function SignIn({ email, password }) {
    const response = await api.post("/sessions", { email, password });

    api.defaults.headers.authorization = `Bearer ${ response.data.token }`;

    localStorage.setItem("@Babymodas:userData", JSON.stringify(response.data));
    setUserData(response.data);

    if(response.data.user.isAdmin == 1) {
      localStorage.setItem("@Babymodas:isAdmin", JSON.stringify(true));
      setIsAdmin(true);
    } else {
      localStorage.setItem("@Babymodas:isAdmin", JSON.stringify(false));
      setIsAdmin(false);
    }
  }

  function SignOut() {
    setUserData("");
    setIsAdmin(false);
    localStorage.removeItem("@Babymodas:userData");
    localStorage.removeItem("@Babymodas:isAdmin");
  }

  async function updateUser({ oldPassword, email, password }) {
    await api.patch("/users/", { oldPassword, email, password });
  }

  useEffect(() => {
    const userLocalStorage = JSON.parse(localStorage.getItem("@Babymodas:userData"));
    const isAdminLocalStorage = JSON.parse(localStorage.getItem("@Babymodas:isAdmin"));

    if(userLocalStorage) {
      api.defaults.headers.authorization = `Bearer ${ userLocalStorage.token }`;
      setUserData(userLocalStorage);
    }

    if(isAdminLocalStorage) {
      setIsAdmin(isAdminLocalStorage);
    }

  }, []);

  return (
    <AuthContext.Provider value={{ userData, isAdmin, SignUp, SignIn, SignOut, updateUser }}>
      { children }
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export { AuthProvider, useAuth };