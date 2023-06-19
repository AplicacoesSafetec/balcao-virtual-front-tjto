import { createGlobalStyle } from 'styled-components';

const size = {
  mobileS: '320px',
  mobileM: '375px',
  mobileL: '425px',
  tablet: '768px',
  laptop: '1024px',
  laptopM: '1280px',
  laptopMCustom: '1366px',
  laptopL: '1440px',
  desktop: '2560px',
};

export const device = {
  mobileS: `(max-width: ${size.mobileS})`,
  mobileM: `(max-width: ${size.mobileM})`,
  mobileL: `(max-width: ${size.mobileL})`,
  tablet: `(max-width: ${size.tablet})`,
  laptop: `(max-width: ${size.laptop})`,
  laptopM: `(max-width: ${size.laptopM})`,
  laptopMCustom: `(max-width: ${size.laptopMCustom})`,
  laptopL: `(max-width: ${size.laptopL})`,
  desktop: `(max-width: ${size.desktop})`,
  desktopL: `(max-width: ${size.desktop})`,
};

export default createGlobalStyle`
  *{
    margin: 0;
    padding: 0;
    outline: 0;
    box-sizing: border-box;
  }

  df-messenger {
    --df-messenger-bot-message: #FF7D63;
    --df-messenger-button-titlebar-color: white;
    --df-messenger-button-titlebar-font-color: #706d6d;
    --df-messenger-font-color: white;
    --df-messenger-send-icon: #42A953;
    --df-messenger-user-message: #706d6d;
  }

  *:focus{
    outline: 0!important;
  }

  html, body, #__next{
    height: 100%;
  }

  @media (max-width: 767px) {
  .df-message {
    /* Estilos para dispositivos móveis */
    font-size: 14px;
    padding: 10px;
  }
}
  
  @media ${device.laptopMCustom} {
    html {
      font-size: 67%;
    }
  }

  @media (max-width: 1366px) {
    html {
      font-size: 67%;
    }
  }

  body{
    line-height: 1.43 !important;
    background: #FF7D63;
    -webkit-font-smoothing: antialiased;
  }

  body, input, button textarea, select {
    font: 400 1rem "Roboto", sans-serif;
  }

  a {
   text-decoration: none!important;
  }
  p{
   margin-bottom: 0rem;
  }
  ul{
    list-style: none;
  }

  button{
    cursor: pointer;
  }
  hr{
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
`;
