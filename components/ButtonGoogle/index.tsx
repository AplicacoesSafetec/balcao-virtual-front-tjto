import styled from 'styled-components';

const Button = styled.button`
  display: flex;
  align-items: center;
  margin: 0px auto;
  padding: 0.625rem;
  background-color: rgb(255, 255, 255);
  color: rgba(0, 0, 0, 0.54);
  box-shadow: rgb(0 0 0 / 24%) 0px 0.125rem 0.125rem 0px,
    rgb(0 0 0 / 24%) 0px 0px 0.0625rem 0px;
  border-radius: 2px;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;
  user-select: none;

  svg {
    margin-right: 0.625rem;
  }
`;

export default Button;
