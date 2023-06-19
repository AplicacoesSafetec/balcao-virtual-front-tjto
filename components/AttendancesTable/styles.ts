import { Switch } from '@mui/material';
import styled from 'styled-components';

export const OrangeSwitch = styled(Switch)(() => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#f75a48',
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#f75a48',
  },
}));

export const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
`;

export const CategorySpan = styled.span`
  color: #aaa;
  font-weight: bold;
`
export const QueueUserLink = styled.a`
  text-decoration: underline!important;
  color: inherit;
`;

export const DeskSpan = styled.span`
  color: #FF7D63;
  font-weight: bold;
`
