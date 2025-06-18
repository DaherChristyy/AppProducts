export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: { url: string };
  profileImage?: { url: string };
}

export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
  };
  images: { url: string }[];
  user?: User;
  isDeleted?: boolean;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  VerificationScreen: { email: string; password: string };
  MainTabs: undefined; // ProductList and NewPosts
  ProductDetails: { productId: string };
  AddProduct: {
    selectedLocation?: {
      latitude: number;
      longitude: number;
      address: string;
    };
  } | undefined;
  MapPicker: {
    initialLocation?: { latitude: number; longitude: number };
    onSelect: (coords: { latitude: number; longitude: number; address?: string }) => void;
  };
  UploadedProducts: undefined;
  EditProduct: { product: Product };
  NewPostsScreen: undefined; 
};

export type AppTabParamList = {
  ProductList: undefined; 
  Profile: undefined;
  NewPosts: undefined; 

};

export type Post = {
  _id: string;
  article_id: string;
  title: string;
  link: string;
  keywords: string[] | null;
  creator: string[] | null;
  video_url: string | null;
  description: string | null;
  content: string;
  pubDate: string;
  image_url: string | null;
  source_id: string;
  source_priority: number;
  source_url: string;
  source_icon: string | null;
  language: string;
  country: string[];
  category: string[];
  ai_tag: string;
  sentiment: string;
  sentiment_stats: string;
  ai_region: string;
};