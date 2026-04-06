import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { createErrorMessage } from "../../scripts/messages-inputs";
import { createNotification, createConfirmationMessage } from "../../scripts/notifications";
import { useProducts } from "../../hooks/products";
import { useProductAttributes } from "../../hooks/productAttributes";
import { useProductDetails } from "../../hooks/productDetails";

import { Input } from "../Input";
import { ChangeColor } from "../ChangeColor";
import { OutfitTag } from "../OutfitTag";
import { Button } from "../Button";

import { Container } from "./style";

export function EditCatalog({ ...rest }) {
  const { createProduct, deleteProducts, lastViewedProduct, updateProduct } = useProducts();
  const { AddAttributes, saveSectionsStorage, deleteAllImgs, updateColors } = useProductAttributes();
  const { addDetailsDatabase, saveProductDetailsStorage, saveModelDetailsStorage, updateTags } = useProductDetails();

  const [ name, setName ] = useState("");
  const [ category, setCategory ] = useState("FEMININO");
  const [ price, setPrice ] = useState("");
  const [ promotion, setPromotion ] = useState("");
  const [ description, setDescription ] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const adminPassword = "123456";

  const path = useLocation().pathname;
  const navigate = useNavigate();

  // 🔐 ATIVAR ADMIN
  function activateAdmin() {
    const senha = prompt("Digite a senha do administrador:");

    if(senha === adminPassword) {
      localStorage.setItem("isAdmin", "true");
      setIsAdmin(true);
      createNotification("Modo administrador ativado");
    } else {
      createNotification("Senha incorreta");
    }
  }

  // 🔐 VERIFICAR ADMIN
  function checkAdmin() {
    const admin = localStorage.getItem("isAdmin");

    if(admin === "true") {
      setIsAdmin(true);
      return true;
    }

    createNotification("Apenas administrador pode editar");
    return false;
  }

  // 👆 CLICAR 6 VEZES NA LOGO
  function handleLogoClick() {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if(newCount >= 6) {
      activateAdmin();
      setClickCount(0);
    }

    setTimeout(() => {
      setClickCount(0);
    }, 3000);
  }

  async function handleNewProduct() {
    if(!checkAdmin()) return;

    verifyValues();

    if(name && price && description) {
      try {
        const product_id = await createProduct({ name, category, price, promotion, description });
        await AddAttributes(product_id);
        await addDetailsDatabase(product_id);

        createNotification("Produto criado com sucesso :)");
        clearPage();

      } catch(error) {
        alert(error);
      }
    }
  }

  async function handleEditProduct() {
    if(!checkAdmin()) return;

    try {
      await updateProduct({ id: lastViewedProduct.id, name, category, price, promotion, description });
      await updateColors(lastViewedProduct);
      await updateTags(lastViewedProduct.id);

      createNotification("Produto atualizado com sucesso :)");

    } catch(error) {
      console.log(error);
    }
  }

  function handleDeleteProduct() {
    if(!checkAdmin()) return;

    const buttonConfirm = createConfirmationMessage("Tem certeza que deseja excluir?");

    buttonConfirm.addEventListener("click", async() => {
      await deleteAllImgs(lastViewedProduct.id);
      await deleteProducts([lastViewedProduct.id]);
      document.querySelector(".confirmationModal").remove();
      createNotification("Produto removido ;)");
      navigate(-2);
    });
  }

  function verifyValues() {
    const divName = document.querySelector("#inputName");
    const divPrice = document.querySelector("#inputPrice");
    const divDescription = document.querySelector(".textarea");

    if(divName.querySelector("input").value == "") createErrorMessage(divName);
    if(divPrice.querySelector("input").value == "") createErrorMessage(divPrice);
    if(divDescription.querySelector("textarea").value == "") createErrorMessage(divDescription);
  }

  function clearPage() {
    const allInputs = document.querySelectorAll("input");
    const select = document.querySelector(".label_select select");
    const textarea = document.querySelector("#textarea");

    allInputs.forEach(input => input.value = "");

    select.value = "FEMININO";
    textarea.value = "";

    setName("");
    setCategory("FEMININO");
    setPrice("");
    setPromotion("");
    setDescription("");

    saveSectionsStorage([]);
    saveProductDetailsStorage([]);
    saveModelDetailsStorage([]);
  }

  // 🔥 DETECTAR ADMIN AO ABRIR
  useEffect(() => {
    const admin = localStorage.getItem("isAdmin");
    if(admin === "true") {
      setIsAdmin(true);
    }
  }, []);

  // 🔥 ADICIONAR EVENTO NA LOGO
  useEffect(() => {
    const logo = document.querySelector(".logo");

    if(logo) {
      logo.addEventListener("click", handleLogoClick);
    }

    return () => {
      if(logo) logo.removeEventListener("click", handleLogoClick);
    };
  });

  // ❌ REMOVER AUTOCOMPLETE (email aparecendo)
  useEffect(() => {
    const inputs = document.querySelectorAll("input");
    inputs.forEach(input => {
      input.setAttribute("autocomplete", "off");
    });
  }, []);

  useEffect(() => {
    if(path == "/edit_product" && lastViewedProduct) {
      document.querySelector("#inputName input").value = lastViewedProduct.name;
      document.querySelector("#textarea").value = lastViewedProduct.description;
      document.querySelector("#categoryLabel select").value = lastViewedProduct.category;
      document.querySelector("#inputPrice input").value = (lastViewedProduct.price).replace(/[^0-9,]/g, "");

      setName(lastViewedProduct.name);
      setDescription(lastViewedProduct.description);
      setCategory(lastViewedProduct.category);
      setPrice((lastViewedProduct.price).replace(/[^0-9,]/g, ""));

      if(lastViewedProduct.promotion) {
        document.querySelector("#inputPromotion input").value = lastViewedProduct.promotion.percentage;
        setPromotion(lastViewedProduct.promotion.percentage);
      }
    }
  }, [lastViewedProduct]);

  return (
    <Container {...rest}>

      {/* LOGOUT ADMIN */}
      {isAdmin && (
        <Button 
          title="Logout Admin" 
          onClick={() => {
            localStorage.removeItem("isAdmin");
            setIsAdmin(false);
            createNotification("Admin desativado");
          }} 
        />
      )}

      <Input id="inputName" title="Nome" placeholder="Nome do produto" onChange={e => setName(e.target.value)} />

      <label className="label_select" id="categoryLabel">
        Categoria:
        <select defaultValue="FEMININO" onChange={e => setCategory(e.target.value)}>
          <option value="FEMININO">Feminino</option>
          <option value="MASCULINO">Masculino</option>
          <option value="INFANTIL">Infantil</option>
          <option value="CASA">Casa</option>
          <option value="ESPORTE">Esporte</option>
          <option value="ACESSORIOS">Acessórios</option>
        </select>
      </label>

      <Input id="inputPrice" title="Preço" span="R$" placeholder="00,00" onChange={e => setPrice(e.target.value)} />
      <Input id="inputPromotion" title="Promoçao" span="%" placeholder="00" onChange={e => setPromotion(e.target.value)} />

      <div className="colors">
        <p>Cores</p>
        <ChangeColor />
      </div>

      <div className="details">
        <p>Detalhes</p>
        <OutfitTag $detail />
      </div>

      <div className="modelDetails">
        <p>Medidas do(a) modelo</p>
        <OutfitTag $modelDetail />
      </div>

      <label className="textarea">
        Descrição
        <textarea id="textarea" onChange={e => setDescription(e.target.value)}></textarea>
      </label>

      {
        isAdmin && (
          path == "/new" ?
          <Button title="SALVAR" onClick={ handleNewProduct } />
          :
          <div className="buttons">
            <Button title="SALVAR" onClick={ handleEditProduct } />
            <Button title="EXCLUIR" onClick={ handleDeleteProduct } />
          </div>
        )
      }

    </Container>
  )
}