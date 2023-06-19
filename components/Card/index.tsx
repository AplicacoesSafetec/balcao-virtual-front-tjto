import { Card, Text as StyledText, Number as NumberStyled } from './styles';

export const Text = StyledText;

export const Number = NumberStyled;

export default function CardStyled({
  children,
  ...rest
}: {
  children: React.ReactNode;
}) {
  return <Card {...rest}>{children}</Card>;
}
