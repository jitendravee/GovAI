//Modules
import { PropsWithChildren } from "react";

//Components
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "@/styles/theme";
import { QueryClientProvider } from "react-query";
import { query } from "@/services/query";
import { ClerkProvider } from "@clerk/clerk-react";

export interface IProvidersProps extends PropsWithChildren {}

export const Providers = ({ children, ...props }: IProvidersProps) => {
  const PUBLISHABLE_KEY =
    "pk_test_cXVpZXQtc25ha2UtOTYuY2xlcmsuYWNjb3VudHMuZGV2JA"; // from Clerk dashboard

  return (
    <QueryClientProvider client={query}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </ClerkProvider>
    </QueryClientProvider>
  );
};
