import React from 'react';
import { Box, Email, Image, Item, Span, A } from 'react-html-email';

const css = `
@media only screen and (max-device-width: 480px) {
  font-size: 20px !important;
}`.trim();


const Verification = ({ handle = '', token = '' }) => {
  const home = config.urls.host;
  const logo = config.hrefs.logo;
  const verification = `${home}/?verification=${token}`;

  return (<Email title="Test Email" headCSS={css}>
    <Item>
      <A href={home}>
        <Image alt="Pew Pew" src={logo} width={100} height={100} />
      </A>
      <Span fontSize={15}>Hey {handle}, did you request a verification email?</Span>
    </Item>
    <Item>
      <Box cellSpacing={20} width="100%" style={{ borderTop: '3px solid black' }}>
        <Item>
          <Span color="gray" lineHeight={20}>Clicking on the link below will</Span>
          <Span color="gray" lineHeight={20}><A href={verification}>Verify Your Email</A></Span>
          <Span color="gray" lineHeight={20}>
            If you are having trouble clicking the link,
            copy the url below and paste it in your browser bar:
          </Span>
          <Span color="gray" lineHeight={20}>{verification}</Span>
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

export default Verification;
