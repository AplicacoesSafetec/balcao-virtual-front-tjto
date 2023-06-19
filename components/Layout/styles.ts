import styled from 'styled-components';
import Button from 'components/Button';

interface ContainerProps {
  showBackgroundImage?: boolean;
}

export const Container = styled.div<ContainerProps>`
  height: 100%;
  background-image: ${({ showBackgroundImage }) =>
    showBackgroundImage
      ? 'url("/images/background-solicitante-login.png")'
      : ''};
  background-size: cover;
`;

export const TopButtonArea = styled.div`
  display: flex;
  align-items: center;
  margin: 0px;
  position: absolute; 
  left: 20px;
  top: 20px;
`

export const Logout = styled(Button)`
  display: flex;
  align-items: center;
  margin: 0px auto;
  padding: 0.625rem;
  background-color: rgb(255, 255, 255);
  color: rgba(0, 0, 0, 0.54);
  box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
  border-radius: 2px;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;

  svg {
    margin-right: 0.625rem;
  }
`;

export const Grid = styled.main`
  height: 100%;
  display: grid;
  grid-template-areas:
    'headers'
    'mains'
    'footers';
  grid-template-rows: auto 1fr 3.125rem;
`;

export const Header = styled.header`
  grid-area: headers;
  display: flex;
  padding-top: 4.625rem;
  padding-bottom: 1.875rem;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 13.75rem;
  margin: auto;
`;

export const Vector = styled.div`
  position: absolute;
  top: -31px;
  z-index: -1;
  right: 0;
`;

export const Main = styled.main`
  grid-area: mains;
  justify-self: flex-start;
  width: 100%;
`;

export const Copyright = styled.span`
  font-size: 1.125rem;
  color: white;
  padding-left: 3.125rem;
`;

export const Dummy = styled.div`
  width: 1px;
  height: 1px;
`;

export const Footer = styled.footer`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
`;

export const SuperiorBackgroundBox = styled.div`
  width: 100%;
  height: 80%;
  position: absolute;
  overflow: hidden;
  z-index: -1;

  ::after {
    background: #0f9d85;
    content: '';
    position: absolute;
    border-radius: 50%;
    height: 100%;
    left: -12%;
    right: -12%;
    top: -20.5%;
  }
`;
