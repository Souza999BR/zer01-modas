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

  // 🔐 SENHA ADMIN
  const adminPassword = "anjonegro21";

  const path = useLocation().pathname;
  const navigate = useNavigate();

  // 🔐 VERIFICA OU PEDE SENHA (SÓ QUANDO PRECISA)
  function checkAdmin() {
    const admin = localStorage.getItem("adminAccess");

    if(admin === "true") {
      setIsAdmin(true);
      return true;
    }

    const password = prompt("Digite a senha de administrador:");

    if(password === adminPassword) {
      localStorage.setItem("adminAccess", "true");
      setIsAdmin(true);
      createNotification("Modo administrador ativado");
      return true;
    } else {
      createNotification("Senha incorreta");
      return false;
    }
  }

  async function handleNewProduct() {
    if(!checkAdmin()) return;

    verifyValues();

    if(name !== "" && price !== "" && description !== "") {
      try {
        const product_id = await createProduct({ name, category, price, promotion, description });
        await AddAttributes(product_id);
        await addDetailsDatabase(product_id);

        createNotification("Produto criado com sucesso :)");
        clearPage();

      } catch(error) {
        console.log(error);
      }
    }
  }

  async function handleEditProduct() {
    if(!checkAdmin()) return;

    if(!lastViewedProduct) {
      createNotification("Nenhum produto selecionado");
      return;
    }

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

    if(!lastViewedProduct) {
      createNotification("Nenhum produto selecionado");
      return;
    }

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
    const formDivs = [ divName, divPrice ];

    for(let div of formDivs) {
      if(div && div.querySelector("input").value === "") {
        createErrorMessage(div);
      }
    }
    
    if(divDescription && divDescription.querySelector("textarea").value === "") {
      createErrorMessage(divDescription);
    }
  }

  function clearPage() {
    const allInputs = document.querySelectorAll("input");
    const select = document.querySelector(".label_select select");
    const textarea = document.querySelector("#textarea");

    Array.from(allInputs).map(input => {
      input.value = "";
    });

    if(select) select.value = "FEMININO";
    if(textarea) textarea.value = "";

    setName("");
    setCategory("FEMININO");
    setPrice("");
    setPromotion("");
    setDescription("");

    saveSectionsStorage([]);
    saveProductDetailsStorage([]);
    saveModelDetailsStorage([]);
  }

  // 🔄 manter admin logado
  useEffect(() => {
    const admin = localStorage.getItem("adminAccess");
    if(admin === "true") {
      setIsAdmin(true);
    }
  }, []);

  // 🔄 carregar produto sem quebrar
  useEffect(() => {
    if(path === "/edit_product" && lastViewedProduct) {
      const nameInput = document.querySelector("#inputName input");
      const textarea = document.querySelector("#textarea");
      const categorySelect = document.querySelector("#categoryLabel select");
      const priceInput = document.querySelector("#inputPrice input");
      const promoInput = document.querySelector("#inputPromotion input");

      if(nameInput) nameInput.value = lastViewedProduct.name;
      if(textarea) textarea.value = lastViewedProduct.description;
      if(categorySelect) categorySelect.value = lastViewedProduct.category;
      if(priceInput) priceInput.value = (lastViewedProduct.price).replace(/[^0-9,]/g, "");

      setName(lastViewedProduct.name);
      setDescription(lastViewedProduct.description);
      setCategory(lastViewedProduct.category);
      setPrice((lastViewedProduct.price).replace(/[^0-9,]/g, ""));

      if(lastViewedProduct.promotion && promoInput) {
        promoInput.value = lastViewedProduct.promotion.percentage;
        setPromotion(lastViewedProduct.promotion.percentage);
      }
    }
  }, [lastViewedProduct]);

  return (
    <Container {...rest}>

      {/* BOTÃO ADMIN VISÍVEL SEMPRE */}
      {isAdmin && (
        <Button 
          title="Sair do Admin" 
          onClick={() => {
            localStorage.removeItem("adminAccess");
            setIsAdmin(false);
            createNotification("Saiu do modo admin");
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
        <div className="tags">
          <ChangeColor />
        </div>
      </div>

      <div className="details">
        <p>Detalhes</p>
        <div className="tags">
          <OutfitTag $detail />
        </div>
      </div>

      <div className="modelDetails">
        <p>Medidas do(a) modelo</p>
        <div className="tags">
          <OutfitTag $modelDetail />
        </div>
      </div>

      <label className="textarea">
        Descrição
        <textarea id="textarea" placeholder="Breve descrição sobre o produto" onChange={e => setDescription(e.target.value)}></textarea>
      </label>

      {/* BOTÕES SEMPRE VISÍVEIS */}
      {
        path === "/new" ?
        <Button title="SALVAR" onClick={ handleNewProduct } />
        :
        <div className="buttons">
          <Button title="SALVAR" onClick={ handleEditProduct } />
          <Button title="EXCLUIR" onClick={ handleDeleteProduct } />
        </div>
      }

    </Container>
  )
}