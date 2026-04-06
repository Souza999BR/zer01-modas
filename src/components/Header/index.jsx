import axios from "axios"; 
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useMenu } from "../../hooks/menu";
import { useAuth } from "../../hooks/auth";
import { useProducts } from "../../hooks/products";
import { useShopping } from "../../hooks/shopping";
import { api } from "../../services/api";

import { HiOutlineViewList } from "react-icons/hi";
import { TfiClose } from "react-icons/tfi";
import { FaChevronDown } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { RiShoppingBag2Line } from "react-icons/ri";

import Logo from "../../assets/logo.svg";
import iconSearch from "../../assets/search-icon.svg";
import img_produto_nao_encontrado_mobile from "../../assets/produto-nao-encontrado-branco.png";

import { InputBox } from "../InputBox";
import { NavMenu } from "../Nav-Menu";
import { Button } from "../Button";
import { Login } from "../Login";
import { ShowOutfit } from "../ShowOutfit";

import { Container } from "./style";

export function Header() {
  const { openMenuDesktop, closenMenuDesktop } = useMenu();
  const { userData } = useAuth();
  const { searchProducts, findAllFavorites, favorites, allProducts, setAllProducts, loadingProducts } = useProducts();
  const { cartBuy, findAllProductsShoppingCart } = useShopping();

  const [ search, setSearch ] = useState("");
  const [ isAdminLocal, setIsAdminLocal ] = useState(false); // 🔥 NOVO

  const navigate = useNavigate();
  const route = useLocation();

  // 🔥 VERIFICAR ADMIN PELO LOCALSTORAGE
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userLogged"));
    if(user && user.admin === true) {
      setIsAdminLocal(true);
    }
  }, []);

  function handleOpenMenuMOBILE() {
    document.querySelector(".menuMobile").style.display = "block";
  }

  function handleCloseMenuMOBILE() {
    document.querySelector(".menuMobile").style.display = "none";
    document.querySelector(".responseSearch").style.display = "none";
    document.querySelector(".inputSearch input").value ="";
    setAllProducts([]);
  }

  function handleOpenMenuDESKTOP() {
    if(window.innerWidth >= 1000) {
      openMenuDesktop();
    }

    document.querySelector(".firstButton svg").style.animation = "rotate180 0.3s forwards";
  }

  function handleCloseMenuDESKTOP() {
    if(window.innerWidth >= 1000) {
      closenMenuDesktop();
    }

    document.querySelector(".firstButton svg").style.animation = "rotate180 reverse 0.3s forwards";
  }

  function navigateShopping() {
    if(route.pathname != "/shopping-cart") {
      navigate("/shopping-cart");
    }
  }

  function navigateFavorites() {
    navigate("/favorites");
  }

  function handleCloseModalLogin() {
    document.querySelector(".modal-login").close();
    document.querySelector(".boxButtons .nav-menu").style.display = "none";
    closenMenuDesktop();
  }

  function handleNavigateOutfit(product_name) {
    navigate(`/outfit?${product_name}`);
    handleCloseMenuMOBILE();
  }

  function fetchDataDesktop(key) {
    if(key == "Enter") {
      navigate("/catalog");
    }
  }

  function focusInputDesktop() {
    document.addEventListener("keydown", event => fetchDataDesktop(event.key));
  }

  // 🔍 BUSCA
  useEffect(() => {
    const source = axios.CancelToken.source();
    const boxResponseSearch = document.querySelector(".responseSearch");
    const inputSearchDesktop = document.querySelector(".inputSearchDesktop input");

    (async() => {
      const id = Number(search);
      await searchProducts({ name: search, id, cancelToken: source.token });
    })();
    
    if(window.innerWidth < 1000) {
      boxResponseSearch.style.display = search == "" ? "none" : "flex";
    } else {
      inputSearchDesktop.addEventListener('focus', focusInputDesktop);
    }

    return () => {
      inputSearchDesktop.removeEventListener("focus", focusInputDesktop);
      source.cancel();
    }

  }, [ search ]);

  useEffect(() => {
    (async() => {
      if(userData) {
        await findAllFavorites();
        await findAllProductsShoppingCart();
      }
    })();
  }, [ userData ]);

  return (
    <Container $pathname={ route.pathname } $isAdmin={ isAdminLocal }>

      <div>
        <p> Sua moda é feita aqui ;) </p>
        <ul>
          <li> <a href="#"> Política de privacidade </a> </li>
          <li> <a href="#"> Contato </a> </li>
          <li> <a href="#"> Ajuda </a> </li>
        </ul>
      </div>

      <div>
        <Button icon={ <HiOutlineViewList /> } className="buttonMenu" onClick={ handleOpenMenuMOBILE } />

        <img src={ Logo } alt="Logomarca" />

        <div className="boxButtons">
          <button className="firstButton" onMouseOver={ handleOpenMenuDESKTOP } onMouseOut={ handleCloseMenuDESKTOP } >
            {
              userData ?
              <p> Oie, <strong> { userData && userData.user.name } </strong> </p>
              :
              <p> Oie! </p>
            }
            <FaChevronDown size={ 20 } />
          </button>

          <NavMenu onMouseOver={ handleOpenMenuDESKTOP } onMouseOut={ handleCloseMenuDESKTOP }  />

          {/* 🔥 BOTÃO ADMIN AUTOMÁTICO */}
          {
            isAdminLocal && (
              <Button 
                title="Editar Promoções" 
                onClick={() => navigate("/edit")} 
              />
            )
          }

          {
            !isAdminLocal &&
          <button className="buttonFavorites">
            <FiHeart size={ 25 } onClick={ navigateFavorites } />
            <span> { favorites.length } </span>
          </button>
          }

          {
            !isAdminLocal &&
          <button>
            <RiShoppingBag2Line size={ 25 } onClick={ navigateShopping } />
            <span> { cartBuy.products.length } </span>
          </button>
          }

        </div>

        <InputBox className="input inputSearchDesktop" placeholder="O que vai querer hoje?" icon={ iconSearch } onChange={e => setSearch(e.target.value) } />

        <dialog className="modal-login">
          <div>
            <div>
              <Button className="buttonClose" icon={ <TfiClose size={ 20 } /> } onClick={ handleCloseModalLogin } />
              <Login />
            </div>
          </div>
        </dialog>

      </div>
    </Container>
  )
}