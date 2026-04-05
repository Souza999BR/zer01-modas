import { IoLogoInstagram } from "react-icons/io";
import { AiFillYoutube } from "react-icons/ai";
import { BiLogoFacebook } from "react-icons/bi";
import { BsTwitter } from "react-icons/bs";

import logoSvg from "../../assets/logo.svg";

import { Container } from "./style";

export function Footer() {
  return (
    <Container>

      <div>
        <span>
          <p> Baby Modas nas redes sociais </p>
          <IoLogoInstagram />
          <AiFillYoutube />
          <BiLogoFacebook />
          <BsTwitter />
        </span>

        <img src={ logoSvg } alt="logomarca" />

        <span>
          <p> Fale conosco </p>
          <p> (66) 99696-5128 </p>
          <p> (66) 99641-3924 </p>
        </span>

      </div>

      <p>
        Copyright Baby Modas S.A. © - adfufhuwghioqead,  Centro - rodonopolis/MT CEP: 78745638 CNPJ: 37.924.***/****-*** - Todos os direitos reservados Souza
      </p>

    </Container>
  )
}