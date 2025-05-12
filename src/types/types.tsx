export type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: { url: string, _id: string }[];
};

export type RootStackParamList = {
  SignUp: undefined;
  Login: undefined;
  VerificationScreen: undefined;  
  ProductList: undefined;
  ProductDetails: { productId: string }; 
};

