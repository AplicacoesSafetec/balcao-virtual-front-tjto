import styled from 'styled-components';

interface ButtonProps {
  color?: 'primary' | 'secondary';
  layout?: 'small' | 'medium';
}

const Button = styled.button<ButtonProps>`
  font-size: ${({ layout }) => (layout === 'medium' ? '2rem' : '1.5rem')};
  color: white;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  background-color: ${({ color, disabled }) =>
    (disabled && '#ccc') || (color === 'primary' && '#42A953') || '#C74444'};
  border: none;
  border-radius: 20px;
  padding: ${({ layout }) => (layout === 'medium' ? '1.5625rem 4.625rem' : '1.5625rem 2.1875rem')};
  user-select: none;
`;

export const ButtonTransfer = styled.button<ButtonProps>`
  font-size: ${({ layout }) => (layout === 'medium' ? '2rem' : '1.5rem')};
  color: white;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  background-color: ${({ color, disabled }) =>
    (disabled && '#ccc') || (color === 'primary' && '#42A953') || '#312fc2'};
  border: none;
  border-radius: 20px;
  padding: ${({ layout }) => (layout === 'medium' ? '1.5625rem 4.625rem' : '1.5625rem 2.1875rem')};
  user-select: none;
`;

export default Button;
