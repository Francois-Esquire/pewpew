import React from 'react';
import { Box, Email, Image, Item, Span, A } from 'react-html-email';

const css = `
@media only screen and (max-device-width: 480px) {
  font-size: 20px !important;
}`.trim();


const Recovery = ({ handle, token = '' }) => {
  const home = config.urls.host;
  const logo = config.hrefs.logo;
  const recovery = `${config.urls.host}/?triage=${token}`;

  return (<Email title="Test Email" headCSS={css}>
    <Item>
      <A href={home}>
        <Image alt="Pew Pew" src={logo} width={100} height={100} />
      </A>
      <Span fontSize={15}>
        Hi {handle}, We are sorry to hear about
        your troubles getting into your account!
      </Span>
    </Item>
    <Item>
      <Box cellSpacing={20} width="100%" style={{ borderTop: '3px solid black' }}>
        <Item>
          <Span color="gray" lineHeight={20}>To reset your account password, please follow this link:</Span>
          <Span color="gray" lineHeight={20}><A href={recovery}>Recover Your Account</A></Span>
        </Item>
        <Item>
          <Span color="gray" lineHeight={20}>
            If this was not requested by you, please disregard this email
            and rest assured your account is safe.
          </Span>
        </Item>
      </Box>
    </Item>
  </Email>);
};

export default Recovery;
